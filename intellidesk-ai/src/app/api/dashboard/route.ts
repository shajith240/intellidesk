import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSLAMetrics, getSLAAlerts } from "@/lib/pipeline/sla-tracker";
import { requireAuth } from "@/lib/auth/helpers";
import { getOrgId } from "@/lib/auth/org-context";

export async function GET() {
	const session = await requireAuth();
	if (session instanceof NextResponse) return session;

	const orgId = getOrgId(session);

	try {
		// Get ticket stats
		const { count: totalTickets } = await supabaseAdmin
			.from("tickets")
			.select("*", { count: "exact", head: true })
			.eq("organization_id", orgId);

		const { count: openTickets } = await supabaseAdmin
			.from("tickets")
			.select("*", { count: "exact", head: true })
			.eq("organization_id", orgId)
			.in("status", ["New", "In Progress"]);

		const { count: resolvedToday } = await supabaseAdmin
			.from("tickets")
			.select("*", { count: "exact", head: true })
			.eq("organization_id", orgId)
			.eq("status", "Resolved")
			.gte(
				"sla_resolved_at",
				new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
			);

		// Category breakdown
		const { data: categoryStats } = await supabaseAdmin
			.from("tickets")
			.select("category")
			.eq("organization_id", orgId)
			.in("status", ["New", "In Progress"]);

		const categoryCounts: Record<string, number> = {};
		categoryStats?.forEach((t) => {
			categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
		});

		// Severity breakdown
		const { data: severityStats } = await supabaseAdmin
			.from("tickets")
			.select("severity")
			.eq("organization_id", orgId)
			.in("status", ["New", "In Progress"]);

		const severityCounts: Record<string, number> = {};
		severityStats?.forEach((t) => {
			severityCounts[t.severity] = (severityCounts[t.severity] || 0) + 1;
		});

		// Email stats
		const { count: totalEmails } = await supabaseAdmin
			.from("emails")
			.select("*", { count: "exact", head: true })
			.eq("organization_id", orgId);

		const { count: spamEmails } = await supabaseAdmin
			.from("emails")
			.select("*", { count: "exact", head: true })
			.eq("organization_id", orgId)
			.eq("is_spam", true);

		const duplicateEmails = 0; // Duplicate tracking is handled at pipeline level

		// SLA metrics
		const slaMetrics = await getSLAMetrics(orgId);

		// SLA alerts
		const slaAlerts = await getSLAAlerts(orgId);

		// Recent activity
		const { data: recentActivity } = await supabaseAdmin
			.from("audit_logs")
			.select("*")
			.eq("organization_id", orgId)
			.order("created_at", { ascending: false })
			.limit(10);

		return NextResponse.json({
			tickets: {
				total: totalTickets || 0,
				open: openTickets || 0,
				resolved_today: resolvedToday || 0,
				by_category: categoryCounts,
				by_severity: severityCounts,
			},
			emails: {
				total: totalEmails || 0,
				spam: spamEmails || 0,
				duplicates: duplicateEmails || 0,
			},
			sla: slaMetrics,
			sla_alerts: slaAlerts.slice(0, 10),
			recent_activity: recentActivity || [],
		});
	} catch (error) {
		console.error("Dashboard stats error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch dashboard stats" },
			{ status: 500 },
		);
	}
}
