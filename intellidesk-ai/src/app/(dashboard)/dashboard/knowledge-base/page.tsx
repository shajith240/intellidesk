"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	BookOpen,
	Plus,
	Search,
	Edit2,
	Trash2,
	Loader2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PageTransition, Shimmer } from "@/components/motion";
import { motion } from "framer-motion";

interface FAQ {
	id: string;
	question: string;
	answer: string;
	category: string;
	tags: string[];
	created_at: string;
	updated_at: string;
}

const categoryLabels: Record<string, string> = {
	billing: "Billing",
	technical_support: "Technical Support",
	account_management: "Account Mgmt",
	general_inquiry: "General Inquiry",
	complaint: "Complaint",
	feature_request: "Feature Request",
	security: "Security",
	onboarding: "Onboarding",
	feedback: "Feedback",
};

export default function KnowledgeBasePage() {
	const [faqs, setFaqs] = useState<FAQ[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [showForm, setShowForm] = useState(false);
	const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
	const [saving, setSaving] = useState(false);

	const [formData, setFormData] = useState({
		question: "",
		answer: "",
		category: "general_inquiry",
		tags: "",
	});

	const fetchFaqs = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: "20",
			});
			if (search) params.set("search", search);
			if (categoryFilter !== "all") params.set("category", categoryFilter);

			const res = await fetch(`/api/faqs?${params}`);
			const json = await res.json();
			setFaqs(json.faqs || []);
			setTotal(json.total || 0);
		} catch {
			console.error("Failed to fetch FAQs");
		} finally {
			setLoading(false);
		}
	}, [page, search, categoryFilter]);

	useEffect(() => {
		fetchFaqs();
	}, [fetchFaqs]);

	const handleCreate = async () => {
		if (!formData.question || !formData.answer) {
			toast.error("Question and answer are required");
			return;
		}

		setSaving(true);
		try {
			const res = await fetch("/api/faqs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					tags: formData.tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean),
				}),
			});
			if (!res.ok) throw new Error("Failed to create");
			toast.success("FAQ created and embedded");
			setShowForm(false);
			resetForm();
			fetchFaqs();
		} catch {
			toast.error("Failed to create FAQ");
		} finally {
			setSaving(false);
		}
	};

	const handleUpdate = async () => {
		if (!editingFaq) return;

		setSaving(true);
		try {
			const res = await fetch(`/api/faqs/${editingFaq.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					tags: formData.tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean),
				}),
			});
			if (!res.ok) throw new Error("Failed to update");
			toast.success("FAQ updated");
			setEditingFaq(null);
			setShowForm(false);
			resetForm();
			fetchFaqs();
		} catch {
			toast.error("Failed to update FAQ");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Failed to delete");
			toast.success("FAQ deleted");
			fetchFaqs();
		} catch {
			toast.error("Failed to delete FAQ");
		}
	};

	const resetForm = () => {
		setFormData({
			question: "",
			answer: "",
			category: "general_inquiry",
			tags: "",
		});
	};

	const openEdit = (faq: FAQ) => {
		setEditingFaq(faq);
		setFormData({
			question: faq.question,
			answer: faq.answer,
			category: faq.category,
			tags: faq.tags?.join(", ") || "",
		});
		setShowForm(true);
	};

	const totalPages = Math.ceil(total / 20);

	return (
		<PageTransition>
			<div className="p-6 lg:p-8 space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-lg font-semibold tracking-tight">
							Knowledge Base
						</h1>
						<p className="text-xs text-muted-foreground mt-0.5">
							{total} FAQs powering auto-responses
						</p>
					</div>
					<Button
						size="sm"
						className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20"
						onClick={() => {
							setEditingFaq(null);
							resetForm();
							setShowForm(true);
						}}
					>
						<Plus className="mr-1.5 h-3.5 w-3.5" />
						Add FAQ
					</Button>
				</div>

				{/* Filters */}
				<motion.div
					className="flex gap-3"
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.3 }}
				>
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
						<Input
							placeholder="Search FAQs..."
							className="pl-9 h-8 text-sm bg-card/50 border-border/50"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
						/>
					</div>
					<Select
						value={categoryFilter}
						onValueChange={(v) => {
							setCategoryFilter(v ?? "");
							setPage(1);
						}}
					>
						<SelectTrigger className="w-[160px] h-8 text-xs bg-card/50 border-border/50">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{Object.entries(categoryLabels).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</motion.div>

				{/* FAQ List */}
				{loading ? (
					<div className="space-y-3">
						{[...Array(3)].map((_, i) => (
							<Shimmer key={i} className="h-28" />
						))}
					</div>
				) : faqs.length === 0 ? (
					<div className="text-center py-16 text-muted-foreground">
						<BookOpen className="mx-auto h-10 w-10 mb-3 opacity-30" />
						<p className="text-sm">No FAQs found</p>
						<p className="text-xs mt-1 text-muted-foreground/60">
							Add FAQs to power AI auto-responses
						</p>
					</div>
				) : (
					<div className="space-y-2">
						{faqs.map((faq, i) => (
							<motion.div
								key={faq.id}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.15 + i * 0.03, duration: 0.3 }}
							>
								<Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-border/70 transition-colors group">
									<CardContent className="p-4">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-1.5 mb-1.5">
													<span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
														{categoryLabels[faq.category] || faq.category}
													</span>
													{faq.tags?.map((tag, ti) => (
														<span
															key={ti}
															className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/70"
														>
															{tag}
														</span>
													))}
												</div>
												<h3 className="text-sm font-medium">{faq.question}</h3>
												<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
													{faq.answer}
												</p>
											</div>
											<div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
												<Button
													variant="ghost"
													size="sm"
													className="h-7 w-7 p-0"
													onClick={() => openEdit(faq)}
												>
													<Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="h-7 w-7 p-0"
													onClick={() => handleDelete(faq.id)}
												>
													<Trash2 className="h-3.5 w-3.5 text-destructive/70" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between">
						<p className="text-xs text-muted-foreground tabular-nums">
							Page {page} of {totalPages}
						</p>
						<div className="flex gap-1.5">
							<Button
								variant="ghost"
								size="sm"
								className="h-7 w-7 p-0"
								disabled={page <= 1}
								onClick={() => setPage(page - 1)}
							>
								<ChevronLeft className="h-3.5 w-3.5" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 w-7 p-0"
								disabled={page >= totalPages}
								onClick={() => setPage(page + 1)}
							>
								<ChevronRight className="h-3.5 w-3.5" />
							</Button>
						</div>
					</div>
				)}

				{/* Create/Edit Dialog */}
				<Dialog open={showForm} onOpenChange={setShowForm}>
					<DialogContent className="max-w-2xl bg-card border-border/50">
						<DialogHeader>
							<DialogTitle className="text-sm font-semibold">
								{editingFaq ? "Edit FAQ" : "Add FAQ"}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<label className="text-xs font-medium text-muted-foreground">
									Category
								</label>
								<Select
									value={formData.category}
									onValueChange={(v) =>
										setFormData({ ...formData, category: v ?? "" })
									}
								>
									<SelectTrigger className="mt-1 bg-background/50 border-border/50 text-sm">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(categoryLabels).map(([key, label]) => (
											<SelectItem key={key} value={key}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground">
									Question *
								</label>
								<Input
									placeholder="How do I reset my password?"
									value={formData.question}
									onChange={(e) =>
										setFormData({ ...formData, question: e.target.value })
									}
									className="mt-1 bg-background/50 border-border/50 text-sm"
								/>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground">
									Answer *
								</label>
								<Textarea
									placeholder="To reset your password, go to Settings > Security..."
									rows={6}
									value={formData.answer}
									onChange={(e) =>
										setFormData({ ...formData, answer: e.target.value })
									}
									className="mt-1 bg-background/50 border-border/50 text-sm"
								/>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground">
									Tags (comma-separated)
								</label>
								<Input
									placeholder="password, reset, account"
									value={formData.tags}
									onChange={(e) =>
										setFormData({ ...formData, tags: e.target.value })
									}
									className="mt-1 bg-background/50 border-border/50 text-sm"
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-xs"
									onClick={() => setShowForm(false)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20"
									onClick={editingFaq ? handleUpdate : handleCreate}
									disabled={saving}
								>
									{saving && (
										<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
									)}
									{editingFaq ? "Update" : "Create"}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</PageTransition>
	);
}
