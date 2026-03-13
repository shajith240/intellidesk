"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
	{
		name: "Starter",
		description:
			"Great for small businesses and startups looking to get started with AI",
		price: 12,
		yearlyPrice: 99,
		buttonText: "Get started",
		buttonVariant: "outline" as const,
		includes: [
			"Free includes:",
			"Unlimted Cards",
			"Custom background & stickers",
			"2-factor authentication",
			"Free includes:",
			"Unlimted Cards",
			"Custom background & stickers",
			"2-factor authentication",
		],
	},
	{
		name: "Business",
		description:
			"Best value for growing businesses that need more advanced features",
		price: 48,
		yearlyPrice: 399,
		buttonText: "Get started",
		buttonVariant: "default" as const,
		popular: true,
		includes: [
			"Everything in Starter, plus:",
			"Advanced checklists",
			"Custom fields",
			"Servedless functions",
			"Everything in Starter, plus:",
			"Advanced checklists",
			"Custom fields",
			"Servedless functions",
		],
	},
	{
		name: "Enterprise",
		description:
			"Advanced plan with enhanced security and unlimited access for large teams",
		price: 96,
		yearlyPrice: 899,
		buttonText: "Get started",
		buttonVariant: "outline" as const,
		includes: [
			"Everything in Business, plus:",
			"Multi-board management",
			"Multi-board guest",
			"Attachment permissions",
			"Everything in Business, plus:",
			"Multi-board management",
			"Multi-board guest",
			"Attachment permissions",
		],
	},
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
	const [selected, setSelected] = useState("0");

	const handleSwitch = (value: string) => {
		setSelected(value);
		onSwitch(value);
	};

	return (
		<div className="flex justify-center">
			<div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
				<button
					onClick={() => handleSwitch("0")}
					className={cn(
						"relative z-10 w-fit h-10  rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
						selected === "0" ? "text-white" : "text-gray-200",
					)}
				>
					{selected === "0" && (
						<motion.span
							layoutId={"switch"}
							className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
						/>
					)}
					<span className="relative">Monthly</span>
				</button>

				<button
					onClick={() => handleSwitch("1")}
					className={cn(
						"relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
						selected === "1" ? "text-white" : "text-gray-200",
					)}
				>
					{selected === "1" && (
						<motion.span
							layoutId={"switch"}
							className="absolute top-0 left-0 h-10 w-full  rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
						/>
					)}
					<span className="relative flex items-center gap-2">Yearly</span>
				</button>
			</div>
		</div>
	);
};

export default function PricingSection6() {
	const [isYearly, setIsYearly] = useState(false);
	const pricingRef = useRef<HTMLDivElement>(null);

	const revealVariants = {
		visible: (i: number) => ({
			y: 0,
			opacity: 1,
			filter: "blur(0px)",
			transition: {
				delay: i * 0.4,
				duration: 0.5,
			},
		}),
		hidden: {
			filter: "blur(10px)",
			y: -20,
			opacity: 0,
		},
	};

	const togglePricingPeriod = (value: string) =>
		setIsYearly(Number.parseInt(value) === 1);

	return (
		<div className="mx-auto relative overflow-hidden" ref={pricingRef}>
			{/* Subtle sparkle background */}
			<div className="absolute top-0 left-0 right-0 h-72 overflow-hidden pointer-events-none [mask-image:radial-gradient(50%_50%,white,transparent)]">
				<SparklesComp
					density={1200}
					direction="bottom"
					speed={1}
					color="#FFFFFF"
					className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
				/>
			</div>

			{/* Subtle blue glow */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[400px] rounded-full opacity-[0.15]"
					style={{
						background: "radial-gradient(ellipse, #3131f5, transparent 70%)",
					}}
				/>
			</div>

			<article className="text-center mb-6 pt-24 md:pt-32 max-w-3xl mx-auto space-y-2 relative z-10">
				<h2 className="text-4xl lg:text-5xl font-medium font-serif">
					<span className="metallic-text">Plans that work best for you</span>
				</h2>

				<TimelineContent
					as="p"
					animationNum={0}
					timelineRef={pricingRef}
					customVariants={revealVariants}
					className="text-gray-300"
				>
					Trusted by millions, We help teams all around the world, Explore which
					option is right for you.
				</TimelineContent>

				<TimelineContent
					as="div"
					animationNum={1}
					timelineRef={pricingRef}
					customVariants={revealVariants}
				>
					<PricingSwitch onSwitch={togglePricingPeriod} />
				</TimelineContent>
			</article>

			<div className="grid md:grid-cols-3 max-w-5xl gap-4 py-6 pb-24 md:pb-32 mx-auto px-4 relative z-10">
				{plans.map((plan, index) => (
					<TimelineContent
						key={plan.name}
						as="div"
						animationNum={2 + index}
						timelineRef={pricingRef}
						customVariants={revealVariants}
					>
						<Card
							className={`relative text-white border-neutral-800 ${
								plan.popular
									? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_300px_0px_#0900ff] z-20"
									: "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 z-10"
							}`}
						>
							<CardHeader className="text-left ">
								<div className="flex justify-between">
									<h3 className="text-3xl mb-2">{plan.name}</h3>
								</div>
								<div className="flex items-baseline">
									<span className="text-4xl font-semibold ">
										$
										<NumberFlow
											format={{
												currency: "USD",
											}}
											value={isYearly ? plan.yearlyPrice : plan.price}
											className="text-4xl font-semibold"
										/>
									</span>
									<span className="text-gray-300 ml-1">
										/{isYearly ? "year" : "month"}
									</span>
								</div>
								<p className="text-sm text-gray-300 mb-4">{plan.description}</p>
							</CardHeader>

							<CardContent className="pt-0">
								<button
									className={`w-full mb-6 p-4 text-xl rounded-xl ${
										plan.popular
											? "bg-gradient-to-t from-blue-500 to-blue-600  shadow-lg shadow-blue-800 border border-blue-500 text-white"
											: plan.buttonVariant === "outline"
												? "bg-gradient-to-t from-neutral-950 to-neutral-600  shadow-lg shadow-neutral-900 border border-neutral-800 text-white"
												: ""
									}`}
								>
									{plan.buttonText}
								</button>

								<div className="space-y-3 pt-4 border-t border-neutral-700">
									<h4 className="font-medium text-base mb-3">
										{plan.includes[0]}
									</h4>
									<ul className="space-y-2">
										{plan.includes.slice(1).map((feature, featureIndex) => (
											<li
												key={featureIndex}
												className="flex items-center gap-2"
											>
												<span className="h-2.5 w-2.5 bg-neutral-500 rounded-full grid place-content-center"></span>
												<span className="text-sm text-gray-300">{feature}</span>
											</li>
										))}
									</ul>
								</div>
							</CardContent>
						</Card>
					</TimelineContent>
				))}
			</div>
		</div>
	);
}
