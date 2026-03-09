"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Search as SearchIcon,
	Loader2,
	Ticket,
	Mail,
	BookOpen,
	ArrowUpRight,
} from "lucide-react";
import { PageTransition } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";

const severityConfig: Record<
	string,
	{ label: string; color: string; bg: string }
> = {
	P1: { label: "P1", color: "text-red-400", bg: "bg-red-500/10" },
	P2: { label: "P2", color: "text-orange-400", bg: "bg-orange-500/10" },
	P3: { label: "P3", color: "text-yellow-400", bg: "bg-yellow-500/10" },
	P4: { label: "P4", color: "text-blue-400", bg: "bg-blue-500/10" },
};

interface SearchResults {
	tickets?: Array<{
		id: string;
		ticket_number: string;
		subject: string;
		status: string;
		severity: string;
		category: string;
		score: number;
		created_at: string;
	}>;
	emails?: Array<{
		id: string;
		from_address: string;
		from_name: string;
		subject: string;
		summary: string;
		score: number;
		received_at: string;
	}>;
	faqs?: Array<{
		id: string;
		question: string;
		answer: string;
		category: string;
		score: number;
	}>;
}

export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [type, setType] = useState("all");
	const [results, setResults] = useState<SearchResults | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSearch = async () => {
		if (!query.trim()) return;
		setLoading(true);
		try {
			const params = new URLSearchParams({ q: query, type, limit: "10" });
			const res = await fetch(`/api/search?${params}`);
			const json = await res.json();
			setResults(json.results || {});
		} catch {
			console.error("Search failed");
		} finally {
			setLoading(false);
		}
	};

	const totalResults =
		(results?.tickets?.length || 0) +
		(results?.emails?.length || 0) +
		(results?.faqs?.length || 0);

	return (
		<PageTransition>
			<div className="p-6 lg:p-8 space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-lg font-semibold tracking-tight">
						Semantic Search
					</h1>
					<p className="text-xs text-muted-foreground mt-0.5">
						AI-powered search across tickets, emails, and FAQs
					</p>
				</div>

				{/* Search Bar */}
				<motion.div
					className="flex gap-3"
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.3 }}
				>
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
						<Input
							placeholder="Describe what you're looking for..."
							className="pl-9 h-9 text-sm bg-card/50 border-border/50"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						/>
					</div>
					<Select value={type} onValueChange={(v) => setType(v ?? "all")}>
						<SelectTrigger className="w-[120px] h-9 text-xs bg-card/50 border-border/50">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="tickets">Tickets</SelectItem>
							<SelectItem value="emails">Emails</SelectItem>
							<SelectItem value="faqs">FAQs</SelectItem>
						</SelectContent>
					</Select>
					<Button
						size="sm"
						className="h-9 px-4 bg-primary/10 text-primary hover:bg-primary/20"
						onClick={handleSearch}
						disabled={loading || !query.trim()}
					>
						{loading ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<SearchIcon className="h-3.5 w-3.5" />
						)}
					</Button>
				</motion.div>

				{/* Results */}
				<AnimatePresence mode="wait">
					{results && (
						<motion.div
							className="space-y-4"
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.3 }}
						>
							<p className="text-xs text-muted-foreground tabular-nums">
								{totalResults} results found
							</p>

							<Tabs
								defaultValue={
									(results.tickets?.length || 0) > 0
										? "tickets"
										: (results.emails?.length || 0) > 0
											? "emails"
											: "faqs"
								}
							>
								<TabsList className="bg-muted/50 h-8">
									{(type === "all" || type === "tickets") && (
										<TabsTrigger value="tickets" className="text-xs h-6 gap-1">
											<Ticket className="h-3 w-3" />
											Tickets ({results.tickets?.length || 0})
										</TabsTrigger>
									)}
									{(type === "all" || type === "emails") && (
										<TabsTrigger value="emails" className="text-xs h-6 gap-1">
											<Mail className="h-3 w-3" />
											Emails ({results.emails?.length || 0})
										</TabsTrigger>
									)}
									{(type === "all" || type === "faqs") && (
										<TabsTrigger value="faqs" className="text-xs h-6 gap-1">
											<BookOpen className="h-3 w-3" />
											FAQs ({results.faqs?.length || 0})
										</TabsTrigger>
									)}
								</TabsList>

								<TabsContent value="tickets" className="space-y-2 mt-3">
									{results.tickets?.map((t, i) => {
										const sev = severityConfig[t.severity] || severityConfig.P3;
										return (
											<motion.div
												key={t.id}
												initial={{ opacity: 0, y: 6 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: i * 0.04 }}
											>
												<Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-border/70 transition-colors group">
													<CardContent className="p-4">
														<div className="flex items-start justify-between">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-1.5 mb-1">
																	<span
																		className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sev.color} ${sev.bg}`}
																	>
																		{t.severity}
																	</span>
																	<span className="font-mono text-[10px] text-muted-foreground/70">
																		{t.ticket_number}
																	</span>
																	<span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
																		{t.status.replace(/_/g, " ")}
																	</span>
																	<span className="text-[10px] text-muted-foreground/60 ml-auto tabular-nums">
																		{(t.score * 100).toFixed(0)}%
																	</span>
																</div>
																<p className="text-sm font-medium truncate">
																	{t.subject}
																</p>
															</div>
															<Link
																href={`/tickets/${t.id}`}
																className="ml-3 shrink-0"
															>
																<ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
															</Link>
														</div>
														{/* Score bar */}
														<div className="mt-2 flex items-center gap-2">
															<div className="flex-1 h-0.5 rounded-full bg-muted/50 overflow-hidden">
																<motion.div
																	className="h-full rounded-full bg-primary/40"
																	initial={{ width: 0 }}
																	animate={{ width: `${t.score * 100}%` }}
																	transition={{
																		delay: 0.2 + i * 0.04,
																		duration: 0.5,
																	}}
																/>
															</div>
														</div>
													</CardContent>
												</Card>
											</motion.div>
										);
									})}
									{(!results.tickets || results.tickets.length === 0) && (
										<p className="text-center py-6 text-xs text-muted-foreground/60">
											No matching tickets
										</p>
									)}
								</TabsContent>

								<TabsContent value="emails" className="space-y-2 mt-3">
									{results.emails?.map((e, i) => (
										<motion.div
											key={e.id}
											initial={{ opacity: 0, y: 6 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: i * 0.04 }}
										>
											<Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-border/70 transition-colors">
												<CardContent className="p-4">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-xs font-medium truncate">
															{e.from_name || e.from_address}
														</span>
														<span className="text-[10px] text-muted-foreground/60 ml-auto tabular-nums">
															{(e.score * 100).toFixed(0)}%
														</span>
													</div>
													<p className="text-sm font-medium truncate">
														{e.subject}
													</p>
													{e.summary && (
														<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
															{e.summary}
														</p>
													)}
													<div className="mt-2 h-0.5 rounded-full bg-muted/50 overflow-hidden">
														<motion.div
															className="h-full rounded-full bg-primary/40"
															initial={{ width: 0 }}
															animate={{ width: `${e.score * 100}%` }}
															transition={{
																delay: 0.2 + i * 0.04,
																duration: 0.5,
															}}
														/>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									))}
									{(!results.emails || results.emails.length === 0) && (
										<p className="text-center py-6 text-xs text-muted-foreground/60">
											No matching emails
										</p>
									)}
								</TabsContent>

								<TabsContent value="faqs" className="space-y-2 mt-3">
									{results.faqs?.map((f, i) => (
										<motion.div
											key={f.id}
											initial={{ opacity: 0, y: 6 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: i * 0.04 }}
										>
											<Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-border/70 transition-colors">
												<CardContent className="p-4">
													<div className="flex items-center gap-1.5 mb-1">
														<span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
															{f.category.replace(/_/g, " ")}
														</span>
														<span className="text-[10px] text-muted-foreground/60 ml-auto tabular-nums">
															{(f.score * 100).toFixed(0)}%
														</span>
													</div>
													<p className="text-sm font-medium">{f.question}</p>
													<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
														{f.answer}
													</p>
													<div className="mt-2 h-0.5 rounded-full bg-muted/50 overflow-hidden">
														<motion.div
															className="h-full rounded-full bg-primary/40"
															initial={{ width: 0 }}
															animate={{ width: `${f.score * 100}%` }}
															transition={{
																delay: 0.2 + i * 0.04,
																duration: 0.5,
															}}
														/>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									))}
									{(!results.faqs || results.faqs.length === 0) && (
										<p className="text-center py-6 text-xs text-muted-foreground/60">
											No matching FAQs
										</p>
									)}
								</TabsContent>
							</Tabs>
						</motion.div>
					)}
				</AnimatePresence>

				{!results && !loading && (
					<motion.div
						className="text-center py-20 text-muted-foreground"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<SearchIcon className="mx-auto h-10 w-10 mb-3 opacity-20" />
						<p className="text-sm">Search across tickets, emails, and FAQs</p>
						<p className="text-xs mt-1 text-muted-foreground/60">
							AI embeddings for semantic understanding
						</p>
					</motion.div>
				)}
			</div>
		</PageTransition>
	);
}
