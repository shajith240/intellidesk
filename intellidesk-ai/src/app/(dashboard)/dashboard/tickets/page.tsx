"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	PageTransition,
	StaggerList,
	StaggerItem,
	Shimmer,
} from "@/components/motion";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

interface Ticket {
	id: string;
	ticket_number: string;
	subject: string;
	status: string;
	severity: string;
	category: string;
	ai_confidence: number;
	created_at: string;
	contacts: { id: string; name: string; email: string } | null;
	accounts: { id: string; name: string; tier: string } | null;
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

const statusConfig: Record<
	string,
	{ label: string; color: string; bg: string }
> = {
	New: { label: "New", color: "text-green-400", bg: "bg-green-500/10" },
	"In Progress": {
		label: "In Progress",
		color: "text-blue-400",
		bg: "bg-blue-500/10",
	},
	Resolved: {
		label: "Resolved",
		color: "text-muted-foreground",
		bg: "bg-muted",
	},
	Closed: {
		label: "Closed",
		color: "text-muted-foreground/60",
		bg: "bg-muted/50",
	},
};

function timeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "now";
	if (mins < 60) return `${mins}m`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h`;
	return `${Math.floor(hours / 24)}d`;
}

export default function TicketsPage() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [severityFilter, setSeverityFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");

	const fetchTickets = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: "20",
			});
			if (search) params.set("search", search);
			if (statusFilter !== "all") params.set("status", statusFilter);
			if (severityFilter !== "all") params.set("severity", severityFilter);
			if (categoryFilter !== "all") params.set("category", categoryFilter);

			const res = await fetch(`/api/tickets?${params}`);
			const json = await res.json();
			setTickets(json.tickets || []);
			setTotal(json.total || 0);
			setTotalPages(json.total_pages || 1);
		} catch {
			console.error("Failed to fetch tickets");
		} finally {
			setLoading(false);
		}
	}, [page, search, statusFilter, severityFilter, categoryFilter]);

	useEffect(() => {
		fetchTickets();
	}, [fetchTickets]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setPage(1);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

	return (
		<PageTransition>
			<div className="p-6 lg:p-8 space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						{total} tickets total
					</p>
				</div>

				{/* Filters */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.3 }}
					className="flex flex-wrap gap-3"
				>
					<div className="relative flex-1 min-w-[200px]">
						<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search tickets..."
							className="pl-9 bg-card/50 border-border/50 h-9 text-sm"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<Select
						value={statusFilter}
						onValueChange={(v) => {
							setStatusFilter(v ?? "");
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[140px] bg-card/50 border-border/50 h-9 text-sm">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="open">Open</SelectItem>
							<SelectItem value="in_progress">In Progress</SelectItem>
							<SelectItem value="waiting_on_customer">Waiting</SelectItem>
							<SelectItem value="resolved">Resolved</SelectItem>
							<SelectItem value="closed">Closed</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={severityFilter}
						onValueChange={(v) => {
							setSeverityFilter(v ?? "");
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[130px] bg-card/50 border-border/50 h-9 text-sm">
							<SelectValue placeholder="Severity" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Severity</SelectItem>
							<SelectItem value="P1">P1 Critical</SelectItem>
							<SelectItem value="P2">P2 High</SelectItem>
							<SelectItem value="P3">P3 Medium</SelectItem>
							<SelectItem value="P4">P4 Low</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={categoryFilter}
						onValueChange={(v) => {
							setCategoryFilter(v ?? "");
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[160px] bg-card/50 border-border/50 h-9 text-sm">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="billing">Billing</SelectItem>
							<SelectItem value="technical_support">
								Technical Support
							</SelectItem>
							<SelectItem value="account_management">Account Mgmt</SelectItem>
							<SelectItem value="general_inquiry">General Inquiry</SelectItem>
							<SelectItem value="complaint">Complaint</SelectItem>
							<SelectItem value="feature_request">Feature Request</SelectItem>
							<SelectItem value="security">Security</SelectItem>
							<SelectItem value="onboarding">Onboarding</SelectItem>
							<SelectItem value="feedback">Feedback</SelectItem>
						</SelectContent>
					</Select>
				</motion.div>

				{/* Table */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.4 }}
				>
					<Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
						<CardContent className="p-0">
							{loading ? (
								<div className="p-5 space-y-3">
									{[...Array(5)].map((_, i) => (
										<Shimmer key={i} className="h-11 w-full" />
									))}
								</div>
							) : tickets.length === 0 ? (
								<div className="text-center py-16 text-muted-foreground text-sm">
									No tickets found
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow className="border-border/30 hover:bg-transparent">
											<TableHead className="w-[90px] text-xs font-medium text-muted-foreground">
												Ticket
											</TableHead>
											<TableHead className="text-xs font-medium text-muted-foreground">
												Subject
											</TableHead>
											<TableHead className="w-[70px] text-xs font-medium text-muted-foreground">
												Severity
											</TableHead>
											<TableHead className="w-[100px] text-xs font-medium text-muted-foreground">
												Status
											</TableHead>
											<TableHead className="w-[120px] text-xs font-medium text-muted-foreground">
												Category
											</TableHead>
											<TableHead className="text-xs font-medium text-muted-foreground">
												Customer
											</TableHead>
											<TableHead className="w-[100px] text-xs font-medium text-muted-foreground">
												Confidence
											</TableHead>
											<TableHead className="w-[70px] text-xs font-medium text-muted-foreground">
												Age
											</TableHead>
											<TableHead className="w-[36px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{tickets.map((ticket, i) => {
											const sev =
												severityConfig[ticket.severity] || severityConfig.P3;
											const status =
												statusConfig[ticket.status] || statusConfig.New;
											return (
												<motion.tr
													key={ticket.id}
													initial={{ opacity: 0, y: 4 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														delay: 0.25 + i * 0.02,
														duration: 0.25,
													}}
													className="border-border/20 transition-colors hover:bg-muted/30 group"
												>
													<TableCell className="font-mono text-xs text-muted-foreground">
														{ticket.ticket_number}
													</TableCell>
													<TableCell className="max-w-[280px] truncate text-sm font-medium">
														<Link
															href={`/dashboard/tickets/${ticket.id}`}
															className="hover:text-primary transition-colors"
														>
															{ticket.subject}
														</Link>
													</TableCell>
													<TableCell>
														<span
															className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${sev.bg} ${sev.color} ring-1 ${sev.ring}`}
														>
															{ticket.severity}
														</span>
													</TableCell>
													<TableCell>
														<span
															className={`text-xs px-2 py-0.5 rounded-md ${status.bg} ${status.color}`}
														>
															{status.label}
														</span>
													</TableCell>
													<TableCell className="text-xs text-muted-foreground capitalize">
														{ticket.category.replace(/_/g, " ")}
													</TableCell>
													<TableCell className="text-sm">
														<span>{ticket.contacts?.name || "Unknown"}</span>
														{ticket.accounts && (
															<span className="text-xs text-muted-foreground ml-1.5">
																{ticket.accounts.name}
															</span>
														)}
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1.5">
															<div className="h-1 w-14 rounded-full bg-muted overflow-hidden">
																<div
																	className={`h-full rounded-full transition-all ${
																		ticket.ai_confidence > 0.8
																			? "bg-green-500"
																			: ticket.ai_confidence > 0.5
																				? "bg-yellow-500"
																				: "bg-red-500"
																	}`}
																	style={{
																		width: `${(ticket.ai_confidence || 0) * 100}%`,
																	}}
																/>
															</div>
															<span className="text-[10px] text-muted-foreground tabular-nums">
																{((ticket.ai_confidence || 0) * 100).toFixed(0)}
																%
															</span>
														</div>
													</TableCell>
													<TableCell className="text-[11px] text-muted-foreground tabular-nums">
														{timeAgo(ticket.created_at)}
													</TableCell>
													<TableCell>
														<Link
															href={`/dashboard/tickets/${ticket.id}`}
															className="opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
														</Link>
													</TableCell>
												</motion.tr>
											);
										})}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Pagination */}
				{totalPages > 1 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="flex items-center justify-between"
					>
						<p className="text-xs text-muted-foreground tabular-nums">
							Page {page} of {totalPages}
						</p>
						<div className="flex gap-1.5">
							<Button
								variant="ghost"
								size="sm"
								disabled={page <= 1}
								onClick={() => setPage(page - 1)}
								className="h-8 w-8 p-0 hover:bg-muted"
							>
								<ChevronLeft className="h-3.5 w-3.5" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								disabled={page >= totalPages}
								onClick={() => setPage(page + 1)}
								className="h-8 w-8 p-0 hover:bg-muted"
							>
								<ChevronRight className="h-3.5 w-3.5" />
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</PageTransition>
	);
}
