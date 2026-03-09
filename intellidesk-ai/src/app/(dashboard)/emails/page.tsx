"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Mail,
	Upload,
	RefreshCw,
	Loader2,
	Send,
	AlertCircle,
	CheckCircle,
	Copy,
	Eye,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PageTransition, Shimmer } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";

interface EmailIngestResult {
	email_id: string;
	ticket_id?: string;
	ticket_number?: string;
	status: string;
	message: string;
	processing_time_ms: number;
	classification?: {
		category: string;
		severity: string;
		confidence: number;
		summary: string;
		sentiment: string;
	};
	auto_response_sent?: boolean;
}

const severityConfig: Record<string, { color: string; bg: string }> = {
	P1: { color: "text-red-400", bg: "bg-red-500/10" },
	P2: { color: "text-orange-400", bg: "bg-orange-500/10" },
	P3: { color: "text-yellow-400", bg: "bg-yellow-500/10" },
	P4: { color: "text-blue-400", bg: "bg-blue-500/10" },
};

const statusVariant: Record<
	string,
	{ icon: typeof CheckCircle; color: string; bg: string; label: string }
> = {
	processed: {
		icon: CheckCircle,
		color: "text-green-400",
		bg: "bg-green-500/10",
		label: "Processed",
	},
	spam: {
		icon: AlertCircle,
		color: "text-yellow-400",
		bg: "bg-yellow-500/10",
		label: "Spam",
	},
	duplicate: {
		icon: Copy,
		color: "text-blue-400",
		bg: "bg-blue-500/10",
		label: "Duplicate",
	},
	error: {
		icon: AlertCircle,
		color: "text-red-400",
		bg: "bg-red-500/10",
		label: "Error",
	},
};

export default function EmailQueuePage() {
	const [results, setResults] = useState<EmailIngestResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [polling, setPolling] = useState(false);
	const [showManual, setShowManual] = useState(false);
	const [showResult, setShowResult] = useState<EmailIngestResult | null>(null);

	const [formData, setFormData] = useState({
		from_address: "",
		from_name: "",
		to_address: "support@intellidesk.ai",
		subject: "",
		body_text: "",
		message_id: "",
	});

	const handlePollEmails = async () => {
		setPolling(true);
		try {
			const res = await fetch("/api/emails/poll", { method: "POST" });
			const json = await res.json();
			if (json.results) {
				setResults((prev) => [...json.results, ...prev]);
			}
			toast.success(`Processed ${json.processed || 0} emails from IMAP`);
		} catch {
			toast.error("Failed to poll emails");
		} finally {
			setPolling(false);
		}
	};

	const handleManualSubmit = async () => {
		if (!formData.from_address || !formData.subject || !formData.body_text) {
			toast.error("Please fill in From, Subject, and Body");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/emails/ingest", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					received_at: new Date().toISOString(),
					message_id:
						formData.message_id || `manual-${Date.now()}@intellidesk.ai`,
				}),
			});
			const result = await res.json();
			setResults((prev) => [result, ...prev]);
			setShowManual(false);
			setFormData({
				from_address: "",
				from_name: "",
				to_address: "support@intellidesk.ai",
				subject: "",
				body_text: "",
				message_id: "",
			});
			toast.success(result.message || "Email processed");
		} catch {
			toast.error("Failed to process email");
		} finally {
			setLoading(false);
		}
	};

	return (
		<PageTransition>
			<div className="p-6 lg:p-8 space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-lg font-semibold tracking-tight">
							Email Queue
						</h1>
						<p className="text-xs text-muted-foreground mt-0.5">
							Ingest, process, and monitor incoming emails
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 text-xs"
							onClick={() => setShowManual(true)}
						>
							<Upload className="mr-1.5 h-3.5 w-3.5" />
							Manual Ingest
						</Button>
						<Button
							size="sm"
							className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20"
							onClick={handlePollEmails}
							disabled={polling}
						>
							{polling ? (
								<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
							) : (
								<RefreshCw className="mr-1.5 h-3.5 w-3.5" />
							)}
							Poll IMAP
						</Button>
					</div>
				</div>

				{/* Processing Results */}
				<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
					<CardHeader className="pb-3 px-5 pt-4">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Processing Results
						</CardTitle>
					</CardHeader>
					<CardContent className="px-5 pb-5">
						{results.length === 0 ? (
							<div className="text-center py-16 text-muted-foreground">
								<Mail className="mx-auto h-10 w-10 mb-3 opacity-30" />
								<p className="text-sm">No emails processed yet</p>
								<p className="text-xs mt-1 text-muted-foreground/60">
									Poll IMAP to fetch from your server, or use Manual Ingest to
									test
								</p>
							</div>
						) : (
							<ScrollArea className="h-[500px]">
								<div className="space-y-2">
									<AnimatePresence mode="popLayout">
										{results.map((result, i) => {
											const sv =
												statusVariant[result.status] || statusVariant.error;
											const StatusIcon = sv.icon;
											const sc = result.classification
												? severityConfig[result.classification.severity] ||
													severityConfig.P3
												: null;

											return (
												<motion.div
													key={`${result.email_id}-${i}`}
													initial={{ opacity: 0, y: -8, scale: 0.98 }}
													animate={{ opacity: 1, y: 0, scale: 1 }}
													exit={{ opacity: 0, scale: 0.95 }}
													transition={{ duration: 0.25 }}
													className="flex items-start gap-3 p-3 rounded-lg border border-border/30 hover:border-border/50 hover:bg-muted/20 cursor-pointer transition-colors group"
													onClick={() => setShowResult(result)}
												>
													<div className={`mt-0.5 p-1 rounded ${sv.bg}`}>
														<StatusIcon className={`h-3.5 w-3.5 ${sv.color}`} />
													</div>

													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-1.5 flex-wrap">
															<span
																className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sv.bg} ${sv.color}`}
															>
																{sv.label}
															</span>
															{sc && result.classification && (
																<>
																	<span
																		className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}
																	>
																		{result.classification.severity}
																	</span>
																	<span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
																		{result.classification.category.replace(
																			/_/g,
																			" ",
																		)}
																	</span>
																</>
															)}
															{result.ticket_number && (
																<span className="text-[10px] font-mono text-muted-foreground">
																	{result.ticket_number}
																</span>
															)}
														</div>
														<p className="text-sm mt-1 truncate">
															{result.message}
														</p>
														<div className="flex items-center gap-3 mt-1">
															<span className="text-[10px] text-muted-foreground tabular-nums">
																{result.processing_time_ms}ms
															</span>
															{result.classification && (
																<div className="flex items-center gap-1.5">
																	<div className="h-0.5 w-10 rounded-full bg-muted overflow-hidden">
																		<div
																			className={`h-full rounded-full ${result.classification.confidence > 0.8 ? "bg-green-500" : "bg-yellow-500"}`}
																			style={{
																				width: `${result.classification.confidence * 100}%`,
																			}}
																		/>
																	</div>
																	<span className="text-[10px] text-muted-foreground tabular-nums">
																		{(
																			result.classification.confidence * 100
																		).toFixed(0)}
																		%
																	</span>
																</div>
															)}
															{result.auto_response_sent && (
																<span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 flex items-center gap-1">
																	<Send className="h-2.5 w-2.5" />
																	Auto-replied
																</span>
															)}
														</div>
													</div>

													<Eye className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground mt-1 transition-colors" />
												</motion.div>
											);
										})}
									</AnimatePresence>
								</div>
							</ScrollArea>
						)}
					</CardContent>
				</Card>

				{/* Manual Ingest Dialog */}
				<Dialog open={showManual} onOpenChange={setShowManual}>
					<DialogContent className="max-w-2xl bg-card border-border/50">
						<DialogHeader>
							<DialogTitle className="text-sm font-semibold">
								Manual Email Ingest
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-xs font-medium text-muted-foreground">
										From Email *
									</label>
									<Input
										placeholder="customer@example.com"
										value={formData.from_address}
										onChange={(e) =>
											setFormData({ ...formData, from_address: e.target.value })
										}
										className="mt-1 bg-background/50 border-border/50 text-sm"
									/>
								</div>
								<div>
									<label className="text-xs font-medium text-muted-foreground">
										From Name
									</label>
									<Input
										placeholder="John Doe"
										value={formData.from_name}
										onChange={(e) =>
											setFormData({ ...formData, from_name: e.target.value })
										}
										className="mt-1 bg-background/50 border-border/50 text-sm"
									/>
								</div>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground">
									Subject *
								</label>
								<Input
									placeholder="Cannot access my billing dashboard"
									value={formData.subject}
									onChange={(e) =>
										setFormData({ ...formData, subject: e.target.value })
									}
									className="mt-1 bg-background/50 border-border/50 text-sm"
								/>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground">
									Body *
								</label>
								<Textarea
									placeholder="Write the email body here..."
									rows={8}
									value={formData.body_text}
									onChange={(e) =>
										setFormData({ ...formData, body_text: e.target.value })
									}
									className="mt-1 bg-background/50 border-border/50 text-sm"
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-xs"
									onClick={() => setShowManual(false)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20"
									onClick={handleManualSubmit}
									disabled={loading}
								>
									{loading ? (
										<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
									) : (
										<Send className="mr-1.5 h-3.5 w-3.5" />
									)}
									Process Email
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Result Detail Dialog */}
				<Dialog open={!!showResult} onOpenChange={() => setShowResult(null)}>
					<DialogContent className="max-w-2xl bg-card border-border/50">
						<DialogHeader>
							<DialogTitle className="text-sm font-semibold">
								Processing Result
							</DialogTitle>
						</DialogHeader>
						{showResult && (
							<ScrollArea className="max-h-[60vh]">
								<pre className="text-xs font-mono bg-background/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border border-border/30">
									{JSON.stringify(showResult, null, 2)}
								</pre>
							</ScrollArea>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</PageTransition>
	);
}
