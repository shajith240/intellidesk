import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/helpers";
import { getOrgId } from "@/lib/auth/org-context";

export async function GET(req: NextRequest) {
	const session = await requireAuth();
	if (session instanceof NextResponse) return session;

	const orgId = getOrgId(session);

	try {
		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");
		const severity = searchParams.get("severity");
		const category = searchParams.get("category");
		const search = searchParams.get("search");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
		const offset = (page - 1) * limit;
		const sortBy = searchParams.get("sort") || "created_at";
		const sortOrder = searchParams.get("order") === "asc" ? true : false;

		let query = supabaseAdmin
			.from("tickets")
			.select(
				"*, contacts(id, name, email), accounts(id, company_name, tier)",
				{
					count: "exact",
				},
			)
			.eq("organization_id", orgId);

		if (status) {
			query = query.eq("status", status);
		}
		if (severity) {
			query = query.eq("severity", severity);
		}
		if (category) {
			query = query.eq("category", category);
		}
		if (search) {
			query = query.or(
				`subject.ilike.%${search}%,ticket_number.ilike.%${search}%,summary.ilike.%${search}%`,
			);
		}

		const validSortFields = [
			"created_at",
			"updated_at",
			"severity",
			"status",
			"ticket_number",
		];
		const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";

		const { data, count, error } = await query
			.order(sortField, { ascending: sortOrder })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		return NextResponse.json({
			tickets: data,
			total: count,
			page,
			limit,
			total_pages: Math.ceil((count || 0) / limit),
		});
	} catch (error) {
		console.error("Get tickets error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch tickets" },
			{ status: 500 },
		);
	}
}
