"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Database,
	Brain,
	Mail,
	Clock,
	CheckCircle,
	XCircle,
	Loader2,
	Zap,
	Eye,
	EyeOff,
	Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/motion";
import { motion } from "framer-motion";

interface ConnectionStatus {
	supabase: boolean;
	pinecone: boolean;
	gemini: boolean;
	imap: boolean;
	smtp: boolean;
}

interface EmailConfig {
	connected: boolean;
	config: {
		email: string;
		imap_host: string;
		imap_port: number;
		smtp_host: string;
		smtp_port: number;
		password_set: boolean;
	} | null;
}

const slaDefaults = [
	{
		severity: "P1",
		first_response: "1 hour",
		resolution: "4 hours",
		color: "text-red-400",
		bg: "bg-red-500/10",
	},
	{
		severity: "P2",
		first_response: "4 hours",
		resolution: "8 hours",
		color: "text-orange-400",
		bg: "bg-orange-500/10",
	},
	{
		severity: "P3",
		first_response: "24 hours",
		resolution: "3 days",
		color: "text-yellow-400",
		bg: "bg-yellow-500/10",
	},
	{
		severity: "P4",
		first_response: "3 days",
		resolution: "7 days",
		color: "text-blue-400",
		bg: "bg-blue-500/10",
	},
];

export default function SettingsPage() {
	const [testing, setTesting] = useState(false);
	const [status, setStatus] = useState<ConnectionStatus | null>(null);

	// Gmail connection state
	const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
	const [gmailEmail, setGmailEmail] = useState("");
	const [gmailPassword, setGmailPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [savingEmail, setSavingEmail] = useState(false);
	const [disconnecting, setDisconnecting] = useState(false);
	const [loadingConfig, setLoadingConfig] = useState(true);

	// Load existing email config on mount
	useEffect(() => {
		const loadConfig = async () => {
			try {
				const res = await fetch("/api/settings/email-config");
				if (res.ok) {
					const data = await res.json();
					setEmailConfig(data);
					if (data.config?.email) {
						setGmailEmail(data.config.email);
					}
				}
			} catch {
				/* ignore */
			} finally {
				setLoadingConfig(false);
			}
		};
		loadConfig();
	}, []);

	const saveGmailConfig = async () => {
		if (!gmailEmail || !gmailPassword) {
			toast.error("Please enter both your Gmail address and App Password");
			return;
		}
		setSavingEmail(true);
		try {
			const res = await fetch("/api/settings/email-config", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: gmailEmail, password: gmailPassword }),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success("Gmail connected successfully!");
				setEmailConfig({
					connected: true,
					config: {
						email: gmailEmail,
						imap_host: "imap.gmail.com",
						imap_port: 993,
						smtp_host: "smtp.gmail.com",
						smtp_port: 587,
						password_set: true,
					},
				});
				setGmailPassword("");
			} else {
				toast.error(data.error || "Failed to save");
			}
		} catch {
			toast.error("Failed to connect Gmail");
		} finally {
			setSavingEmail(false);
		}
	};

	const disconnectGmail = async () => {
		setDisconnecting(true);
		try {
			const res = await fetch("/api/settings/email-config", {
				method: "DELETE",
			});
			if (res.ok) {
				toast.success("Gmail disconnected");
				setEmailConfig({ connected: false, config: null });
				setGmailEmail("");
				setGmailPassword("");
			} else {
				toast.error("Failed to disconnect");
			}
		} catch {
			toast.error("Failed to disconnect Gmail");
		} finally {
			setDisconnecting(false);
		}
	};

	const testConnections = async () => {
		setTesting(true);
		const results: ConnectionStatus = {
			supabase: false,
			pinecone: false,
			gemini: false,
			imap: false,
			smtp: false,
		};

		try {
			const res = await fetch("/api/dashboard");
			results.supabase = res.ok;
		} catch {
			/* ignore */
		}

		setStatus(results);
		setTesting(false);
		toast.success("Connection tests complete");
	};

	return (
		<PageTransition>
			<div className="p-6 lg:p-8 space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-lg font-semibold tracking-tight">Settings</h1>
					<p className="text-xs text-muted-foreground mt-0.5">
						Configure your IntelliDesk AI instance
					</p>
				</div>

				{/* Connection Status */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.3 }}
				>
					<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
						<CardContent className="p-4">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<Database className="h-3.5 w-3.5 text-muted-foreground" />
									<h2 className="text-sm font-medium">Service Connections</h2>
								</div>
								<Button
									size="sm"
									className="h-7 text-xs bg-primary/10 text-primary hover:bg-primary/20"
									onClick={testConnections}
									disabled={testing}
								>
									{testing ? (
										<Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
									) : (
										<Zap className="mr-1.5 h-3 w-3" />
									)}
									Test All
								</Button>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
								{[
									{ key: "supabase", label: "Supabase", icon: Database },
									{ key: "pinecone", label: "Pinecone", icon: Brain },
									{ key: "gemini", label: "Groq AI", icon: Brain },
									{ key: "imap", label: "IMAP", icon: Mail },
									{ key: "smtp", label: "SMTP", icon: Mail },
								].map((svc) => (
									<div
										key={svc.key}
										className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-background/50"
									>
										<svc.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
										<span className="text-xs font-medium">{svc.label}</span>
										{status ? (
											status[svc.key as keyof ConnectionStatus] ? (
												<CheckCircle className="h-3.5 w-3.5 text-emerald-400 ml-auto" />
											) : (
												<XCircle className="h-3.5 w-3.5 text-red-400 ml-auto" />
											)
										) : (
											<div className="h-2 w-2 rounded-full bg-muted ml-auto" />
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Gmail Connection */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.12, duration: 0.3 }}
				>
					<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
						<CardContent className="p-4">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<Mail className="h-3.5 w-3.5 text-muted-foreground" />
									<h2 className="text-sm font-medium">Gmail Connection</h2>
								</div>
								{emailConfig?.connected && (
									<div className="flex items-center gap-1.5 text-emerald-400">
										<CheckCircle className="h-3.5 w-3.5" />
										<span className="text-xs font-medium">Connected</span>
									</div>
								)}
							</div>

							{loadingConfig ? (
								<div className="flex items-center justify-center py-6">
									<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
								</div>
							) : emailConfig?.connected ? (
								<div className="space-y-3">
									<div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
										<Mail className="h-4 w-4 text-emerald-400" />
										<div className="flex-1">
											<p className="text-sm font-medium">
												{emailConfig.config?.email}
											</p>
											<p className="text-[11px] text-muted-foreground">
												IMAP: {emailConfig.config?.imap_host}:
												{emailConfig.config?.imap_port} &bull; SMTP:{" "}
												{emailConfig.config?.smtp_host}:
												{emailConfig.config?.smtp_port}
											</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
											onClick={disconnectGmail}
											disabled={disconnecting}
										>
											{disconnecting ? (
												<Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
											) : (
												<Unplug className="mr-1.5 h-3 w-3" />
											)}
											Disconnect
										</Button>
									</div>
									<p className="text-[11px] text-muted-foreground">
										Your Gmail is connected. Emails will be automatically polled
										and processed.
									</p>
								</div>
							) : (
								<div className="space-y-3">
									<p className="text-xs text-muted-foreground">
										Connect your Gmail to receive and process support emails
										automatically. You need a{" "}
										<a
											href="https://myaccount.google.com/apppasswords"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary underline underline-offset-2"
										>
											Gmail App Password
										</a>{" "}
										(not your regular password).
									</p>
									<div className="space-y-2">
										<div>
											<label className="text-[11px] font-medium text-muted-foreground mb-1 block">
												Gmail Address
											</label>
											<Input
												type="email"
												placeholder="support@yourdomain.com"
												value={gmailEmail}
												onChange={(e) => setGmailEmail(e.target.value)}
												className="h-8 text-xs"
											/>
										</div>
										<div>
											<label className="text-[11px] font-medium text-muted-foreground mb-1 block">
												App Password
											</label>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="xxxx xxxx xxxx xxxx"
													value={gmailPassword}
													onChange={(e) => setGmailPassword(e.target.value)}
													className="h-8 text-xs pr-8"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
												>
													{showPassword ? (
														<EyeOff className="h-3.5 w-3.5" />
													) : (
														<Eye className="h-3.5 w-3.5" />
													)}
												</button>
											</div>
										</div>
									</div>
									<Button
										size="sm"
										className="h-8 text-xs"
										onClick={saveGmailConfig}
										disabled={savingEmail || !gmailEmail || !gmailPassword}
									>
										{savingEmail ? (
											<Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
										) : (
											<Mail className="mr-1.5 h-3 w-3" />
										)}
										Connect Gmail
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* SLA Policies */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15, duration: 0.3 }}
				>
					<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
						<CardContent className="p-4">
							<div className="flex items-center gap-2 mb-4">
								<Clock className="h-3.5 w-3.5 text-muted-foreground" />
								<h2 className="text-sm font-medium">SLA Policies</h2>
							</div>
							<div className="space-y-1.5">
								<div className="grid grid-cols-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 pb-1">
									<span>Severity</span>
									<span>First Response</span>
									<span>Resolution</span>
								</div>
								{slaDefaults.map((sla) => (
									<div
										key={sla.severity}
										className="grid grid-cols-3 items-center px-3 py-2 rounded-lg bg-background/50"
									>
										<span className={`text-xs font-medium ${sla.color}`}>
											<span
												className={`inline-block px-1.5 py-0.5 rounded ${sla.bg}`}
											>
												{sla.severity}
											</span>
										</span>
										<span className="text-xs text-muted-foreground">
											{sla.first_response}
										</span>
										<span className="text-xs text-muted-foreground">
											{sla.resolution}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Seed Data */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.25, duration: 0.3 }}
				>
					<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
						<CardContent className="p-4">
							<div className="flex items-center gap-2 mb-1">
								<Database className="h-3.5 w-3.5 text-muted-foreground" />
								<h2 className="text-sm font-medium">Seed Data</h2>
							</div>
							<p className="text-xs text-muted-foreground/60 mb-4">
								Populate the database with sample data for demo
							</p>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-xs border border-border/50"
									onClick={async () => {
										try {
											const res = await fetch("/api/seed", { method: "POST" });
											const data = await res.json();
											if (res.ok) {
												toast.success(
													`Seeded: ${data.counts.accounts} accounts, ${data.counts.contacts} contacts, ${data.counts.faqs} FAQs, ${data.counts.teams} teams`,
												);
											} else {
												toast.error(data.error || "Seed failed");
											}
										} catch {
											toast.error("Failed to seed data");
										}
									}}
								>
									<Database className="mr-1.5 h-3 w-3" />
									Seed Accounts & FAQs
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-xs border border-border/50"
									onClick={async () => {
										try {
											const res = await fetch("/api/seed/test-emails", {
												method: "POST",
											});
											const data = await res.json();
											if (res.ok) {
												toast.success(
													`Inserted ${data.inserted} test emails. Process them from the Email Queue.`,
												);
											} else {
												toast.error(
													data.error || "Failed to insert test emails",
												);
											}
										} catch {
											toast.error("Failed to insert test emails");
										}
									}}
								>
									<Mail className="mr-1.5 h-3 w-3" />
									Insert Test Emails
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* About */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.3 }}
				>
					<Card className="border-border/50 bg-card/50 backdrop-blur-sm">
						<CardContent className="p-4">
							<h2 className="text-sm font-medium mb-2">About IntelliDesk AI</h2>
							<div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
								<p>
									AI-powered B2B SaaS helpdesk for email classification,
									prioritization, and auto-response.
								</p>
								<p>Built with Next.js, Supabase, Pinecone, and Groq AI.</p>
								<p className="text-muted-foreground/50">Version 1.0.0</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</PageTransition>
	);
}
