"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

/* ─── Easing presets (Framer-website style) ───────────────────────── */
export const ease = {
	smooth: [0.25, 0.1, 0.25, 1] as const,
	spring: { type: "spring" as const, stiffness: 300, damping: 30 },
	springBouncy: { type: "spring" as const, stiffness: 400, damping: 25 },
	springGentle: { type: "spring" as const, stiffness: 200, damping: 30 },
	out: [0.16, 1, 0.3, 1] as const,
};

/* ─── Stagger container ───────────────────────────────────────────── */
export const staggerContainer = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.06,
			delayChildren: 0.1,
		},
	},
};

/* ─── Fade in from below ──────────────────────────────────────────── */
export const fadeInUp = {
	hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
	show: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.5, ease: ease.out },
	},
};

/* ─── Fade in from side ───────────────────────────────────────────── */
export const fadeInLeft = {
	hidden: { opacity: 0, x: -20 },
	show: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.4, ease: ease.out },
	},
};

/* ─── Scale up ────────────────────────────────────────────────────── */
export const scaleIn = {
	hidden: { opacity: 0, scale: 0.95 },
	show: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.35, ease: ease.out },
	},
};

/* ─── Animated page wrapper ───────────────────────────────────────── */
export function PageTransition({ children }: { children: ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: ease.out }}
		>
			{children}
		</motion.div>
	);
}

/* ─── Stagger list wrapper ────────────────────────────────────────── */
export function StaggerList({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="show"
			className={className}
		>
			{children}
		</motion.div>
	);
}

/* ─── Stagger item (use inside StaggerList) ───────────────────────── */
export function StaggerItem({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div variants={fadeInUp} className={className}>
			{children}
		</motion.div>
	);
}

/* ─── Hover card (scale + glow on hover) ──────────────────────────── */
export function HoverCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			whileHover={{ y: -2, transition: { duration: 0.2 } }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

/* ─── Animated counter ────────────────────────────────────────────── */
export function AnimatedNumber({
	value,
	className,
}: {
	value: number;
	className?: string;
}) {
	return (
		<motion.span
			key={value}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: ease.out }}
			className={className}
		>
			{value}
		</motion.span>
	);
}

/* ─── Pulse dot indicator ─────────────────────────────────────────── */
export function PulseDot({ color = "bg-green-500" }: { color?: string }) {
	return (
		<span className="relative flex h-2.5 w-2.5">
			<span
				className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-50`}
			/>
			<span
				className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`}
			/>
		</span>
	);
}

/* ─── Shimmer loading effect ──────────────────────────────────────── */
export function Shimmer({ className }: { className?: string }) {
	return (
		<div
			className={`relative overflow-hidden rounded-xl bg-muted ${className}`}
		>
			<div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
		</div>
	);
}

/* ─── Glow background for hero elements ───────────────────────────── */
export function GlowEffect({ className }: { className?: string }) {
	return (
		<div
			className={`pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${className}`}
			style={{
				background:
					"radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--primary-glow), transparent 40%)",
			}}
		/>
	);
}
