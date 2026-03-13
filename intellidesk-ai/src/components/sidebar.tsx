"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	Mail,
	Ticket,
	BookOpen,
	Settings,
	Search,
	Brain,
	ChevronLeft,
	ChevronRight,
	Sparkles,
	Sun,
	Moon,
	LogOut,
	User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/dashboard/emails", label: "Email Queue", icon: Mail },
	{ href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
	{ href: "/dashboard/knowledge-base", label: "Knowledge Base", icon: BookOpen },
	{ href: "/dashboard/search", label: "Search", icon: Search },
	{ href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const { theme, setTheme, resolvedTheme } = useTheme();
	const { data: session } = useSession();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	return (
		<aside
			className={cn(
				"relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
				collapsed ? "w-[68px]" : "w-[260px]",
			)}
		>
			{/* Subtle gradient overlay */}
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />

			{/* Logo */}
			<div className="relative flex h-16 items-center border-b border-sidebar-border px-4">
				<div className="flex items-center gap-2.5">
					<div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
						<Brain className="h-5 w-5 text-primary" />
						<div className="absolute -right-0.5 -top-0.5">
							<Sparkles className="h-3 w-3 text-primary/60" />
						</div>
					</div>
					<AnimatePresence>
						{!collapsed && (
							<motion.span
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.2 }}
								className="overflow-hidden whitespace-nowrap text-[15px] font-semibold tracking-tight"
							>
								Intelli<span className="text-primary">Desk</span>
							</motion.span>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Navigation */}
			<nav className="relative flex-1 space-y-0.5 px-2.5 py-4">
				{navItems.map((item) => {
					const isActive =
						item.href === "/dashboard"
							? pathname === "/dashboard"
							: pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
								isActive
									? "text-primary-foreground"
									: "text-muted-foreground hover:text-sidebar-foreground",
							)}
						>
							{/* Active background pill */}
							{isActive && (
								<motion.div
									layoutId="sidebar-active"
									className="absolute inset-0 rounded-lg bg-primary/15 ring-1 ring-primary/20"
									transition={{
										type: "spring",
										stiffness: 350,
										damping: 30,
									}}
								/>
							)}

							{/* Hover background */}
							{!isActive && (
								<div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-sidebar-accent/50" />
							)}

							<item.icon
								className={cn(
									"relative h-[18px] w-[18px] shrink-0 transition-colors duration-200",
									isActive
										? "text-primary"
										: "text-muted-foreground group-hover:text-sidebar-foreground",
								)}
							/>
							<AnimatePresence>
								{!collapsed && (
									<motion.span
										initial={{ opacity: 0, width: 0 }}
										animate={{ opacity: 1, width: "auto" }}
										exit={{ opacity: 0, width: 0 }}
										transition={{ duration: 0.2 }}
										className="relative overflow-hidden whitespace-nowrap"
									>
										{item.label}
									</motion.span>
								)}
							</AnimatePresence>
						</Link>
					);
				})}
			</nav>

			{/* User profile + Theme toggle + Collapse toggle */}
			<div className="relative border-t border-sidebar-border p-2.5 space-y-1">
				{session?.user && (
					<div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
						<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
							{session.user.name?.[0]?.toUpperCase() || (
								<User className="h-3.5 w-3.5" />
							)}
						</div>
						<AnimatePresence>
							{!collapsed && (
								<motion.div
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ duration: 0.2 }}
									className="flex min-w-0 flex-col overflow-hidden"
								>
									<span className="truncate text-[13px] font-medium leading-tight">
										{session.user.name}
									</span>
									<span className="truncate text-[11px] text-muted-foreground leading-tight">
										{session.user.role}
									</span>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}
				{session?.user && (
					<button
						onClick={() => signOut({ callbackUrl: "/login" })}
						className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
					>
						<LogOut className="h-[18px] w-[18px] shrink-0" />
						<AnimatePresence>
							{!collapsed && (
								<motion.span
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ duration: 0.2 }}
									className="overflow-hidden whitespace-nowrap"
								>
									Sign out
								</motion.span>
							)}
						</AnimatePresence>
					</button>
				)}
				<button
					onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
				>
					{mounted && resolvedTheme === "dark" ? (
						<Sun className="h-[18px] w-[18px] shrink-0" />
					) : (
						<Moon className="h-[18px] w-[18px] shrink-0" />
					)}
					<AnimatePresence>
						{!collapsed && (
							<motion.span
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.2 }}
								className="overflow-hidden whitespace-nowrap"
							>
								{mounted && resolvedTheme === "dark"
									? "Light Mode"
									: "Dark Mode"}
							</motion.span>
						)}
					</AnimatePresence>
				</button>
				<button
					onClick={() => setCollapsed(!collapsed)}
					className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
				>
					{collapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
				</button>
			</div>
		</aside>
	);
}
