import { Header } from "@/components/ui/header-1";
import Hero from "@/components/landing/Hero";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";
import { ProcessSection } from "@/components/ui/how-we-do-it-process-overview";
import PricingSection6 from "@/components/ui/pricing-section";
import FAQs from "@/components/ui/text-reveal-faqs";
import CTA from "@/components/landing/CTA";
import { FlickeringFooter } from "@/components/ui/flickering-footer";
import {
	Mail,
	Cpu,
	MessageSquareReply,
	BookOpen,
	ShieldCheck,
	BarChart3,
} from "lucide-react";

const processItems = [
	{
		icon: Mail,
		title: "Email Ingestion",
		description: "Automatic Capture",
	},
	{
		icon: Cpu,
		title: "AI Classification",
		description: "Smart Routing & Priority",
	},
	{
		icon: MessageSquareReply,
		title: "Response Generation",
		description: "AI-Drafted Replies",
	},
	{
		icon: BookOpen,
		title: "Knowledge Base",
		description: "Self-Learning Context",
	},
	{
		icon: ShieldCheck,
		title: "SLA Tracking",
		description: "Quality Assurance",
	},
	{
		icon: BarChart3,
		title: "Analytics & Reports",
		description: "Performance Insights",
	},
];

const SectionGlow = ({ className = "" }: { className?: string }) => (
	<div
		className={`relative w-full h-px pointer-events-none ${className}`}
		aria-hidden="true"
	>
		<div className="absolute left-1/2 -translate-x-1/2 w-2/3 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-[#818cf8]/30 to-transparent" />
		<div className="absolute left-1/2 -translate-x-1/2 w-1/2 max-w-xl h-8 -top-4 bg-[#818cf8]/[0.04] blur-xl rounded-full" />
	</div>
);

const Index = () => {
	return (
		<div className="relative overflow-x-hidden bg-[#09090b] min-h-screen">
			{/* Grid pattern */}
			<div className="fixed inset-0 grid-pattern pointer-events-none z-0" />

			<div className="relative z-10">
			<Header />
			<Hero />

			<FeaturesSectionWithHoverEffects />

			{/* Soft glow divider between Features and Process */}
			<SectionGlow className="my-12" />

			<ProcessSection
				subtitle="Our Process"
				title="How We Do It"
				description="From inbox to resolution — Deskly AI automates every step of your support workflow with intelligent classification, response generation, and continuous learning."
				buttonText="Learn More"
				items={processItems}
			/>

			<PricingSection6 />

			<FAQs />

			{/* Soft glow divider between FAQs and CTA */}
			<SectionGlow className="my-12" />

			<CTA />
			<FlickeringFooter />
		</div>
	</div>
	);
};

export default Index;
