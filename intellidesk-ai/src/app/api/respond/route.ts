import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/smtp";
import { requireAuth } from "@/lib/auth/helpers";
import { getOrgId } from "@/lib/auth/org-context";

export async function POST(req: NextRequest) {
	const session = await requireAuth();
	if (session instanceof NextResponse) return session;

	const orgId = getOrgId(session);

	try {
		const body = await req.json();

		if (!body.response_id) {
			return NextResponse.json(
				{ error: "Missing response_id" },
				{ status: 400 },
			);
		}

		// Get auto-response details
		const { data: autoResponse, error } = await supabaseAdmin
			.from("auto_responses")
			.select(
				`
        *,
        tickets(id, ticket_number, subject),
        emails(id, from_address, from_name, message_id, subject)
      `,
			)
			.eq("id", body.response_id)
			.eq("organization_id", orgId)
			.single();

		if (error || !autoResponse) {
			return NextResponse.json(
				{ error: "Auto-response not found" },
				{ status: 404 },
			);
		}

		const ticket = (
			autoResponse as unknown as {
				tickets: { id: string; ticket_number: string; subject: string };
			}
		).tickets;
		const email = (
			autoResponse as unknown as {
				emails: {
					id: string;
					from_address: string;
					from_name: string;
					message_id: string;
					subject: string;
				};
			}
		).emails;

		// Use custom text if provided, otherwise use generated response
		const responseText = body.response_text || autoResponse.response_text;

		// Get org's SMTP config if set
		const { data: orgData } = await supabaseAdmin
			.from("organizations")
			.select("email_config")
			.eq("id", orgId)
			.single();

		const smtpConfig = orgData?.email_config?.smtp || undefined;

		// Send the email
		await sendEmail({
			to: email.from_address,
			subject: `Re: ${email.subject} [${ticket.ticket_number}]`,
			html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${responseText.replace(/\n/g, "<br>")}</div>`,
			text: responseText,
			inReplyTo: email.message_id,
			smtpConfig,
		});

		// Mark as sent
		await supabaseAdmin
			.from("auto_responses")
			.update({ sent: true, response_text: responseText })
			.eq("id", body.response_id);

		// Update ticket first_response_at if not set
		const { data: ticketData } = await supabaseAdmin
			.from("tickets")
			.select("sla_first_response_at")
			.eq("id", ticket.id)
			.single();

		if (ticketData && !ticketData.sla_first_response_at) {
			await supabaseAdmin
				.from("tickets")
				.update({ sla_first_response_at: new Date().toISOString() })
				.eq("id", ticket.id);
		}

		// Audit log
		await supabaseAdmin.from("audit_logs").insert({
			organization_id: orgId,
			ticket_id: ticket.id,
			action: "response_sent",
			details: {
				response_id: body.response_id,
				to: email.from_address,
				edited: !!body.response_text,
			},
		});

		return NextResponse.json({ success: true, message: "Response sent" });
	} catch (error) {
		console.error("Send response error:", error);
		return NextResponse.json(
			{ error: "Failed to send response" },
			{ status: 500 },
		);
	}
}
