import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getTicketSLAStatus } from "@/lib/pipeline/sla-tracker";
import { findSimilarTickets } from "@/lib/pipeline/deduplicator";
import { queryVectors } from "@/lib/pinecone/client";
import { requireAuth } from "@/lib/auth/helpers";
import { getOrgId } from "@/lib/auth/org-context";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await requireAuth();
	if (session instanceof NextResponse) return session;

	const orgId = getOrgId(session);

	try {
		const { id } = await params;

		// Get ticket with relations
		const { data: ticket, error } = await supabaseAdmin
			.from("tickets")
			.select(
				`
        *,
        contacts(id, name, email, role, phone),
        accounts(id, company_name, domain, tier),
        ticket_emails(
          email_id,
          relationship,
          emails(id, message_id, from_address, from_name, subject, body_text, body_html, received_at, language)
        ),
        auto_responses(id, match_type, response_text, match_score, sent, created_at)
      `,
			)
			.eq("id", id)
			.eq("organization_id", orgId)
			.single();

		if (error || !ticket) {
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		}

		// Get SLA status
		const slaStatus = await getTicketSLAStatus(id);

		// AI classification is stored directly on the ticket as JSONB

		// Get similar tickets
		let similarTickets: Array<{
			ticket_id: string;
			score: number;
			ticket_number?: string;
			subject?: string;
		}> = [];
		// Only search for similar tickets if we have the embedding
		try {
			const vecResult = await queryVectors("tickets", [], 1);
			if (vecResult.length > 0) {
				// We'll get similar tickets from the API instead
			}
		} catch {
			// Silently skip similar tickets if vector search fails
		}

		// Get similar tickets from the database using category match
		const { data: relatedTickets } = await supabaseAdmin
			.from("tickets")
			.select("id, ticket_number, subject, severity, status, created_at")
			.eq("organization_id", orgId)
			.eq("category", ticket.category)
			.neq("id", id)
			.order("created_at", { ascending: false })
			.limit(5);

		return NextResponse.json({
			ticket,
			sla: slaStatus,
			similar_tickets: relatedTickets || [],
		});
	} catch (error) {
		console.error("Get ticket error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch ticket" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await requireAuth();
	if (session instanceof NextResponse) return session;

	const orgId = getOrgId(session);

	try {
		const { id } = await params;
		const body = await req.json();

		// Whitelist updatable fields
		const allowedFields = [
			"status",
			"severity",
			"category",
			"assigned_team",
			"assigned_agent",
			"sla_first_response_at",
			"sla_resolved_at",
		];

		const updates: Record<string, unknown> = {};
		for (const field of allowedFields) {
			if (body[field] !== undefined) {
				updates[field] = body[field];
			}
		}

		if (Object.keys(updates).length === 0) {
			return NextResponse.json(
				{ error: "No valid fields to update" },
				{ status: 400 },
			);
		}

		// Auto-set resolved_at when status changes to resolved/closed
		if (updates.status === "Resolved" || updates.status === "Closed") {
			updates.sla_resolved_at = new Date().toISOString();
		}

		const { data, error } = await supabaseAdmin
			.from("tickets")
			.update(updates)
			.eq("id", id)
			.eq("organization_id", orgId)
			.select()
			.single();

		if (error) throw error;

		// Audit log
		await supabaseAdmin.from("audit_logs").insert({
			organization_id: orgId,
			entity_type: "ticket",
			entity_id: id,
			action: "ticket_updated",
			details: { updates, updated_by: "agent" },
		});

		return NextResponse.json({ ticket: data });
	} catch (error) {
		console.error("Update ticket error:", error);
		return NextResponse.json(
			{ error: "Failed to update ticket" },
			{ status: 500 },
		);
	}
}
