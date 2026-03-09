import React from "react";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { ArrowUpRight } from "lucide-react";

interface ProcessCardProps {
	icon: React.ElementType;
	title: string;
	description: string;
	className?: string;
}

const ProcessCard: React.FC<ProcessCardProps> = ({
	icon: Icon,
	title,
	description,
}) => (
	<GlowCard
		glowColor="blue"
		customSize={true}
		className="!aspect-auto w-full p-6 flex flex-col items-start justify-start gap-0"
	>
		<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#a1a1aa] transition-colors duration-300 group-hover:bg-[#818cf8] group-hover:text-white group-hover:border-[#818cf8]/60">
			<Icon className="h-6 w-6" />
		</div>

		<div className="flex flex-col relative z-10">
			<h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
			<p className="text-sm text-[#a1a1aa] leading-relaxed">{description}</p>
		</div>
	</GlowCard>
);

interface ProcessSectionProps {
	subtitle: string;
	title: string;
	description: string;
	buttonText: string;
	items: ProcessCardProps[];
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({
	subtitle,
	title,
	description,
	buttonText,
	items,
}) => {
	return (
		<section className="w-full py-24 md:py-32">
			<div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-3 md:gap-8 lg:gap-16">
				<div className="flex flex-col items-start justify-center text-center md:col-span-1 md:text-left">
					<span className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#818cf8]">
						{subtitle}
					</span>
					<h2 className="mb-4 text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl font-serif">
						<span className="metallic-text">How We Do It</span>
					</h2>
					<p className="mb-6 text-base text-[#a1a1aa]">{description}</p>
					<Button
						size="lg"
						className="hover:scale-105 duration-300 transition-all cursor-pointer bg-white text-[#09090b] hover:bg-white/90"
					>
						{buttonText}
						<ArrowUpRight className="ml-2 h-5 w-5" />
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
					{items.map((item, index) => (
						<ProcessCard key={index} {...item} />
					))}
				</div>
			</div>
		</section>
	);
};
