"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	PageTransition,
	StaggerList,
	StaggerItem,
	AnimatedNumber,
	PulseDot,
	Shimmer,
} from "@/components/motion";
import { motion } from "framer-motion";
import {
	Ticket,
	Mail,
	AlertTriangle,
	CheckCircle,
	Clock,
	ShieldAlert,
	RefreshCw,
	Loader2,
	TrendingUp,
	ArrowUpRight,
	Activity,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface DashboardData {
	tickets: {
		total: number;
		open: number;
		resolved_today: number;
		by_category: Record<string, number>;
		by_severity: Record<string, number>;
	};
	emails: {
		total: number;
		spam: number;
		duplicates: number;
	};
	sla: {
		total_open: number;
		breached: number;
		at_risk: number;
		within_sla: number;
		avg_first_response_minutes: number | null;
		avg_resolution_minutes: number | null;
	};
	sla_alerts: Array<{
		ticket_id: string;
		ticket_number: string;
		severity: string;
		first_response_breached: boolean;
		resolution_breached: boolean;
		first_response_due: string;
		resolution_due: string;
	}>;
	recent_activity: Array<{
		id: string;
		action: string;
		ticket_id: string;
		details: Record<string, unknown>;
		created_at: string;
	}>;
}

const severityConfig: Record<
	string,
	{ color: string; bg: string; ring: string }
> = {
	P1: { color: "text-red-400", bg: "bg-red-500/10", ring: "ring-red-500/20" },
	P2: {
		color: "text-orange-400",
		bg: "bg-orange-500/10",
		ring: "ring-orange-500/20",
	},
	P3: {
		color: "text-yellow-400",
		bg: "bg-yellow-500/10",
		ring: "ring-yellow-500/20",
	},
	P4: {
		color: "text-blue-400",
		bg: "bg-blue-500/10",
		ring: "ring-blue-500/20",
	},
};

const categoryLabels: Record<string, string> = {
	billing: "Billing",
	technical_support: "Technical",
	account_management: "Account",
	general_inquiry: "General",
	complaint: "Complaint",
	feature_request: "Feature Req",
	security: "Security",
	onboarding: "Onboarding",
	feedback: "Feedback",
};

function formatMinutes(minutes: number): string {
	if (minutes < 60) return `${minutes}m`;
	if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
	return `${Math.round(minutes / 1440)}d`;
}

function timeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "now";
	if (mins < 60) return `${mins}m`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h`;
	return `${Math.floor(hours / 24)}d`;
}

export default function DashboardPage() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [polling, setPolling] = useState(false);

	const fetchDashboard = useCallback(async () => {
		try {
			const res = await fetch("/api/dashboard");
			if (!res.ok) throw new Error("Failed to fetch");
			const json = await res.json();
			setData(json);
		} catch {
			console.error("Dashboard fetch failed");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDashboard();
		const interval = setInterval(fetchDashboard, 30000);
		return () => clearInterval(interval);
	}, [fetchDashboard]);

	const handlePollEmails = async () => {
		setPolling(true);
		try {
			const res = await fetch("/api/emails/poll", { method: "POST" });
			const json = await res.json();
			toast.success(`Processed ${json.processed || 0} new emails`);
			fetchDashboard();
		} catch {
			toast.error("Failed to poll emails");
		} finally {
			setPolling(false);
		}
	};

	if (loading) {
		return (
			<div className="p-6 lg:p-8 space-y-6">
				<div className="flex justify-between items-center">
					<Shimmer className="h-10 w-52" />
					<Shimmer className="h-10 w-36" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<Shimmer key={i} className="h-[120px]" />
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => (
						<Shimmer key={i} className="h-[240px]" />
					))}
				</div>
			</div>
		);
	}

	return (
		<PageTransition>
			<div className="p-6 lg:p-8 space-y-6">
				{/* Header */}
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
						<div className="flex items-center gap-2 mt-1">
							<PulseDot color="bg-green-500" />
							<p className="text-sm text-muted-foreground">
								Live · Auto-refreshes every 30s
							</p>
						</div>
					</div>
					<Button
						onClick={handlePollEmails}
						disabled={polling}
						size="sm"
						className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
					>
						{polling ? (
							<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
						) : (
							<RefreshCw className="mr-2 h-3.5 w-3.5" />
						)}
						Poll Emails
					</Button>
				</div>

				{/* Stat Cards */}
				<StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Open Tickets */}
					<StaggerItem>
						<Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardContent className="relative pt-5 pb-4 px-5">
								<div className="flex items-center justify-between">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
										<Ticket className="h-4 w-4 text-primary" />
									</div>
									<Link
										href="/dashboard/tickets?status=open"
										className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
									>
										View <ArrowUpRight className="h-3 w-3" />
									</Link>
								</div>
								<div className="mt-3">
									<AnimatedNumber
										value={data?.tickets.open || 0}
										className="text-3xl font-bold tracking-tight"
									/>
									<p className="text-xs text-muted-foreground mt-0.5">
										Open tickets · {data?.tickets.total || 0} total
									</p>
								</div>
							</CardContent>
						</Card>
					</StaggerItem>

					{/* Emails Processed */}
					<StaggerItem>
						<Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5">
							<div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardContent className="relative pt-5 pb-4 px-5">
								<div className="flex items-center justify-between">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
										<Mail className="h-4 w-4 text-accent" />
									</div>
									<Link
										href="/dashboard/emails"
										className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-0.5"
									>
										View <ArrowUpRight className="h-3 w-3" />
									</Link>
								</div>
								<div className="mt-3">
									<AnimatedNumber
										value={data?.emails.total || 0}
										className="text-3xl font-bold tracking-tight"
									/>
									<p className="text-xs text-muted-foreground mt-0.5">
										{data?.emails.spam || 0} spam ·{" "}
										{data?.emails.duplicates || 0} dupes
									</p>
								</div>
							</CardContent>
						</Card>
					</StaggerItem>

					{/* SLA Breached */}
					<StaggerItem>
						<Card
							className={`group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ${(data?.sla.breached || 0) > 0 ? "hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/5" : "hover:border-border"}`}
						>
							{(data?.sla.breached || 0) > 0 && (
								<div className="absolute inset-0 bg-gradient-to-br from-destructive/[0.06] to-transparent" />
							)}
							<CardContent className="relative pt-5 pb-4 px-5">
								<div className="flex items-center justify-between">
									<div
										className={`flex h-9 w-9 items-center justify-center rounded-lg ${(data?.sla.breached || 0) > 0 ? "bg-destructive/10" : "bg-muted"}`}
									>
										<AlertTriangle
											className={`h-4 w-4 ${(data?.sla.breached || 0) > 0 ? "text-destructive" : "text-muted-foreground"}`}
										/>
									</div>
									{(data?.sla.at_risk || 0) > 0 && (
										<Badge
											variant="outline"
											className="text-[10px] border-orange-500/30 text-orange-400 px-1.5 py-0"
										>
											{data?.sla.at_risk} at risk
										</Badge>
									)}
								</div>
								<div className="mt-3">
									<AnimatedNumber
										value={data?.sla.breached || 0}
										className={`text-3xl font-bold tracking-tight ${(data?.sla.breached || 0) > 0 ? "text-destructive" : ""}`}
									/>
									<p className="text-xs text-muted-foreground mt-0.5">
										SLA breached
									</p>
								</div>
							</CardContent>
						</Card>
					</StaggerItem>

					{/* Resolved Today */}
					<StaggerItem>
						<Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-green-500/20 hover:shadow-lg hover:shadow-green-500/5">
							<div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardContent className="relative pt-5 pb-4 px-5">
								<div className="flex items-center justify-between">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
										<CheckCircle className="h-4 w-4 text-green-400" />
									</div>
									<span className="text-xs text-muted-foreground">
										Avg{" "}
										{data?.sla.avg_first_response_minutes
											? formatMinutes(data.sla.avg_first_response_minutes)
											: "—"}
									</span>
								</div>
								<div className="mt-3">
									<AnimatedNumber
										value={data?.tickets.resolved_today || 0}
										className="text-3xl font-bold tracking-tight text-green-400"
									/>
									<p className="text-xs text-muted-foreground mt-0.5">
										Resolved today
									</p>
								</div>
							</CardContent>
						</Card>
					</StaggerItem>
				</StaggerList>

				{/* Main Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Severity Breakdown */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
					>
						<Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<TrendingUp className="h-4 w-4" />
									Severity Distribution
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{["P1", "P2", "P3", "P4"].map((sev) => {
									const count = data?.tickets.by_severity[sev] || 0;
									const total = data?.tickets.open || 1;
									const pct = Math.round((count / total) * 100) || 0;
									const config = severityConfig[sev];
									return (
										<div key={sev} className="flex items-center gap-3">
											<span
												className={`text-xs font-mono font-semibold w-6 ${config.color}`}
											>
												{sev}
											</span>
											<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
												<motion.div
													initial={{ width: 0 }}
													animate={{ width: `${pct}%` }}
													transition={{
														delay: 0.5,
														duration: 0.6,
														ease: [0.16, 1, 0.3, 1],
													}}
													className={`h-full rounded-full ${sev === "P1" ? "bg-red-500" : sev === "P2" ? "bg-orange-500" : sev === "P3" ? "bg-yellow-500" : "bg-blue-500"}`}
												/>
											</div>
											<span className="text-xs font-medium text-muted-foreground w-6 text-right tabular-nums">
												{count}
											</span>
										</div>
									);
								})}
							</CardContent>
						</Card>
					</motion.div>

					{/* Category Breakdown */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.4 }}
					>
						<Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<Activity className="h-4 w-4" />
									Categories
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[172px]">
									<div className="space-y-2">
										{Object.entries(data?.tickets.by_category || {})
											.sort(([, a], [, b]) => b - a)
											.map(([cat, count]) => (
												<div
													key={cat}
													className="flex items-center justify-between py-1"
												>
													<span className="text-sm text-muted-foreground">
														{categoryLabels[cat] || cat}
													</span>
													<span className="text-xs font-medium tabular-nums bg-muted px-2 py-0.5 rounded-md">
														{count}
													</span>
												</div>
											))}
										{Object.keys(data?.tickets.by_category || {}).length ===
											0 && (
											<p className="text-sm text-muted-foreground text-center py-8">
												No data yet
											</p>
										)}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</motion.div>

					{/* SLA Alerts */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.4 }}
					>
						<Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<ShieldAlert className="h-4 w-4" />
									SLA Alerts
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-[172px]">
									<div className="space-y-2">
										{data?.sla_alerts.map((alert) => {
											const config =
												severityConfig[alert.severity] || severityConfig.P3;
											const isBreach =
												alert.first_response_breached ||
												alert.resolution_breached;
											return (
												<Link
													key={alert.ticket_id}
													href={`/dashboard/tickets/${alert.ticket_id}`}
													className={`flex items-center gap-2.5 text-sm p-2 rounded-lg border transition-colors duration-200 hover:bg-muted/50 ${isBreach ? "border-destructive/20 bg-destructive/[0.03]" : "border-border/50"}`}
												>
													<span
														className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${config.bg} ${config.color} ring-1 ${config.ring}`}
													>
														{alert.severity}
													</span>
													<span className="font-mono text-xs text-muted-foreground">
														{alert.ticket_number}
													</span>
													{isBreach ? (
														<Badge
															variant="destructive"
															className="ml-auto text-[10px] px-1.5 py-0 h-5"
														>
															Breached
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="ml-auto text-[10px] border-orange-500/30 text-orange-400 px-1.5 py-0 h-5"
														>
															At Risk
														</Badge>
													)}
												</Link>
											);
										})}
										{(!data?.sla_alerts || data.sla_alerts.length === 0) && (
											<div className="text-center py-8">
												<CheckCircle className="h-8 w-8 text-green-500/30 mx-auto mb-2" />
												<p className="text-sm text-muted-foreground">
													All clear
												</p>
											</div>
										)}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Recent Activity */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.4 }}
				>
					<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Recent Activity
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[180px]">
								<div className="space-y-0">
									{data?.recent_activity.map((activity, i) => (
										<motion.div
											key={activity.id}
											initial={{ opacity: 0, x: -8 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.7 + i * 0.03, duration: 0.3 }}
											className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0"
										>
											<div className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
											<div className="flex-1 min-w-0">
												<span className="text-sm">
													{activity.action.replace(/_/g, " ")}
												</span>
												<span className="text-sm text-muted-foreground ml-2 font-mono">
													{String(
														(activity.details as Record<string, unknown>)
															?.ticket_number ||
															activity.ticket_id?.slice(0, 8) ||
															"",
													)}
												</span>
											</div>
											<span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
												{timeAgo(activity.created_at)}
											</span>
										</motion.div>
									))}
									{(!data?.recent_activity ||
										data.recent_activity.length === 0) && (
										<p className="text-sm text-muted-foreground text-center py-8">
											No recent activity
										</p>
									)}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</PageTransition>
	);
}
