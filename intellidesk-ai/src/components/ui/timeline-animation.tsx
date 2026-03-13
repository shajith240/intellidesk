"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
	children: ReactNode;
	animationNum: number;
	timelineRef: React.RefObject<HTMLElement | null>;
	customVariants?: Variants;
	className?: string;
	as?: "div" | "p" | "span" | "section" | "article";
}

export function TimelineContent({
	children,
	animationNum,
	timelineRef,
	customVariants,
	className,
	as = "div",
}: TimelineContentProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, {
		once: true,
		margin: "0px 0px -100px 0px",
	});

	const defaultVariants: Variants = {
		hidden: {
			opacity: 0,
			y: 20,
			filter: "blur(10px)",
		},
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			transition: {
				delay: i * 0.3,
				duration: 0.5,
			},
		}),
	};

	const variants = customVariants || defaultVariants;
	const Tag = motion[as] ?? motion.div;

	return (
		<Tag
			ref={ref as any}
			custom={animationNum}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={variants}
			className={cn(className)}
		>
			{children}
		</Tag>
	);
}
