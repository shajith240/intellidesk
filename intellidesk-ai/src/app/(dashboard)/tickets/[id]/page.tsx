"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition, Shimmer } from "@/components/motion";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	Brain,
	Clock,
	User,
	Building2,
	Send,
	AlertTriangle,
	CheckCircle,
	MessageSquare,
	Tag,
	Loader2,
	Edit2,
} from "lucide-react";
import { toast } from "sonner";

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

const sentimentConfig: Record<string, { color: string; bg: string }> = {
	positive: { color: "text-green-400", bg: "bg-green-500/10" },
	neutral: { color: "text-muted-foreground", bg: "bg-muted" },
	negative: { color: "text-orange-400", bg: "bg-orange-500/10" },
	angry: { color: "text-red-400", bg: "bg-red-500/10" },
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

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleString();
}

export default function TicketDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const [data, setData] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [sendingResponse, setSendingResponse] = useState(false);
	const [editedResponse, setEditedResponse] = useState("");
	const [editingResponse, setEditingResponse] = useState<string | null>(null);

	const fetchTicket = useCallback(async () => {
		try {
			const res = await fetch(`/api/tickets/${id}`);
			if (!res.ok) throw new Error("Not found");
			const json = await res.json();
			setData(json);
		} catch {
			toast.error("Ticket not found");
			router.push("/tickets");
		} finally {
			setLoading(false);
		}
	}, [id, router]);

	useEffect(() => {
		fetchTicket();
	}, [fetchTicket]);

	const updateTicket = async (updates: Record<string, unknown>) => {
		setUpdating(true);
		try {
			const res = await fetch(`/api/tickets/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});
			if (!res.ok) throw new Error("Update failed");
			toast.success("Ticket updated");
			fetchTicket();
		} catch {
			toast.error("Failed to update ticket");
		} finally {
			setUpdating(false);
		}
	};

	const sendResponse = async (responseId: string, customText?: string) => {
		setSendingResponse(true);
		try {
			const res = await fetch("/api/respond", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					response_id: responseId,
					response_text: customText || undefined,
				}),
			});
			if (!res.ok) throw new Error("Send failed");
			toast.success("Response sent");
			setEditingResponse(null);
			fetchTicket();
		} catch {
			toast.error("Failed to send response");
		} finally {
			setSendingResponse(false);
		}
	};

	if (loading) {
		return (
			<div className="p-6 lg:p-8 space-y-6">
				<Shimmer className="h-8 w-64" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-4">
						<Shimmer className="h-48" />
						<Shimmer className="h-64" />
					</div>
					<Shimmer className="h-96" />
				</div>
			</div>
		);
	}

	if (!data) return null;

	const ticket = data.ticket as Record<string, unknown>;
	const sla = data.sla as Record<string, unknown> | null;
	const similarTickets = (data.similar_tickets || []) as Array<
		Record<string, unknown>
	>;
	const emails = (
		(ticket.ticket_emails || []) as Array<Record<string, unknown>>
	)
		.map((te) => te.emails as Record<string, unknown>)
		.filter(Boolean)
		.sort(
			(a, b) =>
				new Date(a.received_at as string).getTime() -
				new Date(b.received_at as string).getTime(),
		);
	const autoResponses = (ticket.auto_responses || []) as Array<
		Record<string, unknown>
	>;
	const contact = ticket.contacts as Record<string, unknown> | null;
	const account = ticket.accounts as Record<string, unknown> | null;
	const aiClassification = (ticket.ai_classification || null) as Record<
		string,
		unknown
	> | null;

	const sevConfig =
		severityConfig[(ticket.severity as string) || "P3"] || severityConfig.P3;

	return (
		<PageTransition>
			<div className="p-6 lg:p-8 space-y-6">
				{/* Header */}
				<div className="flex items-start gap-3">
					<button
						onClick={() => router.push("/tickets")}
						className="mt-1 p-1.5 rounded-md hover:bg-muted transition-colors"
					>
						<ArrowLeft className="h-4 w-4 text-muted-foreground" />
					</button>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="font-mono text-xs text-muted-foreground">
								{ticket.ticket_number as string}
							</span>
							<span
								className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${sevConfig.bg} ${sevConfig.color} ring-1 ${sevConfig.ring}`}
							>
								{ticket.severity as string}
							</span>
							{(() => {
								const st =
									statusConfig[(ticket.status as string) || "New"] ||
									statusConfig.New;
								return (
									<span
										className={`text-xs px-2 py-0.5 rounded-md ${st.bg} ${st.color}`}
									>
										{st.label}
									</span>
								);
							})()}
							{sla &&
								(Boolean(sla.first_response_breached) ||
									Boolean(sla.resolution_breached)) && (
									<span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive ring-1 ring-destructive/20 flex items-center gap-1">
										<AlertTriangle className="h-2.5 w-2.5" />
										SLA Breached
									</span>
								)}
						</div>
						<h1 className="text-lg font-semibold tracking-tight mt-1 truncate">
							{ticket.subject as string}
						</h1>
						<p className="text-xs text-muted-foreground mt-0.5">
							{timeAgo(ticket.created_at as string)} ·{" "}
							{((ticket.category as string) || "").replace(/_/g, " ")}
						</p>
					</div>
					<div className="flex gap-2 shrink-0">
						<Select
							value={ticket.status as string}
							onValueChange={(v) => updateTicket({ status: v })}
							disabled={updating}
						>
							<SelectTrigger className="w-[140px] h-8 text-xs bg-card/50 border-border/50">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="New">New</SelectItem>
								<SelectItem value="In Progress">In Progress</SelectItem>
								<SelectItem value="Resolved">Resolved</SelectItem>
								<SelectItem value="Closed">Closed</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={ticket.severity as string}
							onValueChange={(v) => updateTicket({ severity: v })}
							disabled={updating}
						>
							<SelectTrigger className="w-[80px] h-8 text-xs bg-card/50 border-border/50">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="P1">P1</SelectItem>
								<SelectItem value="P2">P2</SelectItem>
								<SelectItem value="P3">P3</SelectItem>
								<SelectItem value="P4">P4</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
					{/* Main Content */}
					<motion.div
						className="lg:col-span-2 space-y-5"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15, duration: 0.4 }}
					>
						<Tabs defaultValue="emails">
							<TabsList className="bg-card/50 border border-border/50">
								<TabsTrigger value="emails" className="text-xs gap-1.5">
									<MessageSquare className="h-3.5 w-3.5" />
									Emails ({emails.length})
								</TabsTrigger>
								<TabsTrigger value="ai" className="text-xs gap-1.5">
									<Brain className="h-3.5 w-3.5" />
									AI Analysis
								</TabsTrigger>
								<TabsTrigger value="response" className="text-xs gap-1.5">
									<Send className="h-3.5 w-3.5" />
									Response ({autoResponses.length})
								</TabsTrigger>
							</TabsList>

							{/* Email Thread */}
							<TabsContent value="emails" className="space-y-3 mt-4">
								{emails.map((email, i) => (
									<motion.div
										key={(email.id as string) || i}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
									>
										<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
											<CardHeader className="pb-2 px-5 pt-4">
												<div className="flex items-center justify-between">
													<div className="min-w-0">
														<span className="text-sm font-medium">
															{(email.from_name as string) ||
																(email.from_address as string)}
														</span>
														<span className="text-xs text-muted-foreground ml-2">
															{email.from_address as string}
														</span>
													</div>
													<div className="flex items-center gap-2 shrink-0">
														{Boolean(email.sentiment) &&
															(() => {
																const sc =
																	sentimentConfig[email.sentiment as string] ||
																	sentimentConfig.neutral;
																return (
																	<span
																		className={`text-[10px] px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}
																	>
																		{String(email.sentiment)}
																	</span>
																);
															})()}
														<span className="text-[11px] text-muted-foreground tabular-nums">
															{formatDate(email.received_at as string)}
														</span>
													</div>
												</div>
												<p className="text-sm font-medium mt-1">
													{email.subject as string}
												</p>
											</CardHeader>
											<CardContent className="px-5 pb-4">
												{Boolean(email.summary) && (
													<div className="bg-primary/[0.04] border border-primary/10 p-2.5 rounded-lg text-xs mb-3 flex items-start gap-2">
														<Brain className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
														<span className="text-muted-foreground">
															{String(email.summary)}
														</span>
													</div>
												)}
												<div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
													{(email.body_text as string) || "No text content"}
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
								{emails.length === 0 && (
									<div className="text-center py-12 text-sm text-muted-foreground">
										No emails linked to this ticket
									</div>
								)}
							</TabsContent>

							{/* AI Classification */}
							<TabsContent value="ai" className="mt-4">
								<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
									<CardHeader className="pb-3 px-5 pt-4">
										<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
											<Brain className="h-4 w-4 text-primary" />
											AI Classification
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4 px-5 pb-5">
										{aiClassification ? (
											<>
												<div className="grid grid-cols-2 gap-4">
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Category
														</label>
														<p className="text-sm font-medium mt-0.5 capitalize">
															{(
																(aiClassification.category as string) || ""
															).replace(/_/g, " ")}
														</p>
													</div>
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Severity
														</label>
														<div className="mt-0.5">
															{(() => {
																const sc =
																	severityConfig[
																		(aiClassification.severity as string) ||
																			"P3"
																	] || severityConfig.P3;
																return (
																	<span
																		className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${sc.bg} ${sc.color} ring-1 ${sc.ring}`}
																	>
																		{aiClassification.severity as string}
																	</span>
																);
															})()}
														</div>
													</div>
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Confidence
														</label>
														<div className="flex items-center gap-2 mt-1">
															<div className="h-1 w-20 rounded-full bg-muted overflow-hidden">
																<motion.div
																	initial={{ width: 0 }}
																	animate={{
																		width: `${((aiClassification.confidence as number) || 0) * 100}%`,
																	}}
																	transition={{
																		delay: 0.3,
																		duration: 0.5,
																		ease: [0.16, 1, 0.3, 1],
																	}}
																	className={`h-full rounded-full ${(aiClassification.confidence as number) > 0.8 ? "bg-green-500" : "bg-yellow-500"}`}
																/>
															</div>
															<span className="text-xs tabular-nums">
																{(
																	((aiClassification.confidence as number) ||
																		0) * 100
																).toFixed(0)}
																%
															</span>
														</div>
													</div>
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Sentiment
														</label>
														<div className="mt-0.5">
															{(() => {
																const sc =
																	sentimentConfig[
																		(aiClassification.sentiment as string) ||
																			"neutral"
																	] || sentimentConfig.neutral;
																return (
																	<span
																		className={`text-xs px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}
																	>
																		{aiClassification.sentiment as string}
																	</span>
																);
															})()}
														</div>
													</div>
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Language
														</label>
														<p className="text-sm mt-0.5">
															{aiClassification.language as string}
														</p>
													</div>
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Spam
														</label>
														<p className="text-sm mt-0.5">
															{(aiClassification.is_spam as boolean)
																? "Yes"
																: "No"}
														</p>
													</div>
												</div>

												<Separator className="opacity-30" />

												<div>
													<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
														Summary
													</label>
													<p className="text-sm mt-1 leading-relaxed">
														{aiClassification.summary as string}
													</p>
												</div>

												<div>
													<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
														Reasoning
													</label>
													<p className="text-sm mt-1 italic text-muted-foreground leading-relaxed">
														{(aiClassification.reasoning as string) ||
															"No reasoning provided"}
													</p>
												</div>

												{((aiClassification.key_entities as string[]) || [])
													.length > 0 && (
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Key Entities
														</label>
														<div className="flex flex-wrap gap-1 mt-1.5">
															{(aiClassification.key_entities as string[]).map(
																(entity, i) => (
																	<span
																		key={i}
																		className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary ring-1 ring-primary/20"
																	>
																		{entity}
																	</span>
																),
															)}
														</div>
													</div>
												)}

												{((aiClassification.suggested_tags as string[]) || [])
													.length > 0 && (
													<div>
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
															<Tag className="h-3 w-3" />
															Suggested Tags
														</label>
														<div className="flex flex-wrap gap-1 mt-1.5">
															{(
																aiClassification.suggested_tags as string[]
															).map((tag, i) => (
																<span
																	key={i}
																	className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
																>
																	{tag}
																</span>
															))}
														</div>
													</div>
												)}

												{aiClassification.requires_human_review && (
													<div className="flex items-center gap-2 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
														<AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
														<span className="text-xs text-yellow-400">
															Requires human review (low confidence)
														</span>
													</div>
												)}
											</>
										) : (
											<p className="text-sm text-muted-foreground py-4 text-center">
												No AI classification available
											</p>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							{/* Auto-Response */}
							<TabsContent value="response" className="space-y-3 mt-4">
								{autoResponses.map((ar, i) => (
									<motion.div
										key={ar.id as string}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
									>
										<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
											<CardHeader className="pb-2 px-5 pt-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<span
															className={`text-[10px] px-1.5 py-0.5 rounded ${(ar.response_type as string) === "auto" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
														>
															{(ar.response_type as string) === "auto"
																? "Auto-sent"
																: "Suggested"}
														</span>
														<span className="text-[10px] text-muted-foreground tabular-nums">
															{(((ar.confidence as number) || 0) * 100).toFixed(
																0,
															)}
															% match
														</span>
													</div>
													<div className="flex items-center gap-1.5">
														{ar.sent ? (
															<span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 flex items-center gap-1">
																<CheckCircle className="h-2.5 w-2.5" />
																Sent
															</span>
														) : (
															<div className="flex gap-1">
																<Button
																	size="sm"
																	variant="ghost"
																	className="h-7 text-xs px-2"
																	onClick={() => {
																		setEditingResponse(ar.id as string);
																		setEditedResponse(
																			ar.response_text as string,
																		);
																	}}
																>
																	<Edit2 className="h-3 w-3 mr-1" />
																	Edit
																</Button>
																<Button
																	size="sm"
																	className="h-7 text-xs px-2.5 bg-primary/10 text-primary hover:bg-primary/20"
																	onClick={() => sendResponse(ar.id as string)}
																	disabled={sendingResponse}
																>
																	{sendingResponse ? (
																		<Loader2 className="h-3 w-3 mr-1 animate-spin" />
																	) : (
																		<Send className="h-3 w-3 mr-1" />
																	)}
																	Send
																</Button>
															</div>
														)}
													</div>
												</div>
											</CardHeader>
											<CardContent className="px-5 pb-4">
												{editingResponse === (ar.id as string) ? (
													<div className="space-y-2.5">
														<Textarea
															value={editedResponse}
															onChange={(e) =>
																setEditedResponse(e.target.value)
															}
															rows={8}
															className="bg-background/50 border-border/50 text-sm"
														/>
														<div className="flex gap-1.5 justify-end">
															<Button
																variant="ghost"
																size="sm"
																className="h-7 text-xs"
																onClick={() => setEditingResponse(null)}
															>
																Cancel
															</Button>
															<Button
																size="sm"
																className="h-7 text-xs bg-primary/10 text-primary hover:bg-primary/20"
																onClick={() =>
																	sendResponse(ar.id as string, editedResponse)
																}
																disabled={sendingResponse}
															>
																Send Edited
															</Button>
														</div>
													</div>
												) : (
													<div className="text-sm whitespace-pre-wrap bg-muted/30 border border-border/30 p-3 rounded-lg leading-relaxed">
														{ar.response_text as string}
													</div>
												)}

												{(
													(ar.faq_matches as Array<Record<string, unknown>>) ||
													[]
												).length > 0 && (
													<div className="mt-3">
														<label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
															Matched FAQs
														</label>
														<div className="space-y-1.5 mt-1.5">
															{(
																ar.faq_matches as Array<Record<string, unknown>>
															).map((faq, fi) => (
																<div
																	key={fi}
																	className="text-xs p-2 border border-border/30 rounded-lg flex justify-between items-center"
																>
																	<span className="truncate">
																		{faq.question as string}
																	</span>
																	<span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-2">
																		{(
																			((faq.score as number) || 0) * 100
																		).toFixed(0)}
																		%
																	</span>
																</div>
															))}
														</div>
													</div>
												)}
											</CardContent>
										</Card>
									</motion.div>
								))}
								{autoResponses.length === 0 && (
									<div className="text-center py-12 text-sm text-muted-foreground">
										No auto-response generated
									</div>
								)}
							</TabsContent>
						</Tabs>
					</motion.div>

					{/* Sidebar */}
					<motion.div
						className="space-y-4"
						initial={{ opacity: 0, x: 12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.25, duration: 0.4 }}
					>
						{/* SLA Status */}
						{sla && (
							<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
								<CardHeader className="pb-2 px-4 pt-3">
									<CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
										<Clock className="h-3.5 w-3.5" />
										SLA Status
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2.5 text-sm px-4 pb-3">
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">
											First Response
										</span>
										<div className="flex items-center gap-1">
											{sla.first_response_breached ? (
												<AlertTriangle className="h-3 w-3 text-red-400" />
											) : sla.first_response_at ? (
												<CheckCircle className="h-3 w-3 text-green-400" />
											) : (
												<Clock className="h-3 w-3 text-yellow-400" />
											)}
											<span className="text-xs tabular-nums">
												{sla.first_response_at
													? `${sla.time_to_first_response_minutes}m`
													: `Due ${timeAgo(sla.first_response_due as string)}`}
											</span>
										</div>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">
											Resolution
										</span>
										<div className="flex items-center gap-1">
											{sla.resolution_breached ? (
												<AlertTriangle className="h-3 w-3 text-red-400" />
											) : sla.resolved_at ? (
												<CheckCircle className="h-3 w-3 text-green-400" />
											) : (
												<Clock className="h-3 w-3 text-yellow-400" />
											)}
											<span className="text-xs tabular-nums">
												{sla.resolved_at
													? `${sla.time_to_resolution_minutes}m`
													: `Due ${timeAgo(sla.resolution_due as string)}`}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Customer Info */}
						<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
							<CardHeader className="pb-2 px-4 pt-3">
								<CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
									<User className="h-3.5 w-3.5" />
									Customer
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-1 px-4 pb-3">
								{contact ? (
									<>
										<p className="text-sm font-medium">
											{contact.name as string}
										</p>
										<p className="text-xs text-muted-foreground">
											{contact.email as string}
										</p>
										{contact.role && (
											<p className="text-[10px] text-muted-foreground">
												{contact.role as string}
											</p>
										)}
									</>
								) : (
									<p className="text-xs text-muted-foreground">
										Unknown customer
									</p>
								)}
							</CardContent>
						</Card>

						{/* Account Info */}
						{account && (
							<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
								<CardHeader className="pb-2 px-4 pt-3">
									<CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
										<Building2 className="h-3.5 w-3.5" />
										Account
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-1.5 px-4 pb-3">
									<p className="text-sm font-medium">
										{account.name as string}
									</p>
									{Boolean(account.domain) && (
										<p className="text-[10px] text-muted-foreground">
											{String(account.domain)}
										</p>
									)}
									<span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
										{(account.tier as string) || "free"}
									</span>
								</CardContent>
							</Card>
						)}

						{/* Tags */}
						{((ticket.tags as string[]) || []).length > 0 && (
							<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
								<CardHeader className="pb-2 px-4 pt-3">
									<CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
										<Tag className="h-3.5 w-3.5" />
										Tags
									</CardTitle>
								</CardHeader>
								<CardContent className="px-4 pb-3">
									<div className="flex flex-wrap gap-1">
										{(ticket.tags as string[]).map((tag, i) => (
											<span
												key={i}
												className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
											>
												{tag}
											</span>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Similar Tickets */}
						{similarTickets.length > 0 && (
							<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
								<CardHeader className="pb-2 px-4 pt-3">
									<CardTitle className="text-xs font-medium text-muted-foreground">
										Similar Tickets
									</CardTitle>
								</CardHeader>
								<CardContent className="px-4 pb-3">
									<ScrollArea className="h-[160px]">
										<div className="space-y-1.5">
											{similarTickets.map((st) => {
												const sc =
													severityConfig[(st.severity as string) || "P3"] ||
													severityConfig.P3;
												return (
													<div
														key={st.id as string}
														className="p-2 border border-border/30 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
														onClick={() => router.push(`/tickets/${st.id}`)}
													>
														<div className="flex items-center gap-1.5">
															<span
																className={`text-[9px] font-mono font-semibold px-1 py-0 rounded ${sc.bg} ${sc.color}`}
															>
																{st.severity as string}
															</span>
															<span className="font-mono text-[10px] text-muted-foreground">
																{st.ticket_number as string}
															</span>
														</div>
														<p className="text-xs truncate mt-0.5">
															{st.subject as string}
														</p>
													</div>
												);
											})}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>
						)}
					</motion.div>
				</div>
			</div>
		</PageTransition>
	);
}
