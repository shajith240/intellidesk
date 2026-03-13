'use client';
import Link from 'next/link';
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const plans = [
	{
		name: "Starter",
		price: "Free",
		desc: "For small teams getting started with AI support.",
		features: [
			"1 connected inbox",
			"100 tickets/month",
			"AI classification & routing",
			"Basic dashboard",
			"Email support",
		],
		cta: "Get Started Free",
		href: "/signup",
		highlight: false,
	},
	{
		name: "Pro",
		price: "$49",
		period: "/mo",
		desc: "For growing teams that need automation at scale.",
		features: [
			"5 connected inboxes",
			"Unlimited tickets",
			"AI auto-responses",
			"SLA tracking & alerts",
			"Knowledge base (FAQ)",
			"Semantic search",
			"Priority support",
		],
		cta: "Start Free Trial",
		href: "/signup",
		highlight: true,
	},
	{
		name: "Enterprise",
		price: "Custom",
		desc: "For large organizations needing full customization.",
		features: [
			"Unlimited inboxes",
			"Unlimited tickets",
			"Custom AI model tuning",
			"Advanced analytics",
			"SSO & SAML",
			"Dedicated account manager",
			"SLA guarantee",
			"On-premise option",
		],
		cta: "Contact Sales",
		href: "/signup",
		highlight: false,
	},
];

const Pricing = () => (
	<section id="pricing" className="w-full py-28 sm:py-36 px-5 sm:px-8 lg:px-12">
		<div className="max-w-6xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-80px" }}
				transition={{ duration: 0.7, ease }}
				className="text-center mb-16"
			>
				<p className="text-sm font-semibold text-[#818cf8] uppercase tracking-widest mb-4">
					Pricing
				</p>
				<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance text-foreground">
					Simple pricing,{" "}
					<span className="gradient-text">powerful results</span>
				</h2>
				<p className="mt-5 text-base sm:text-lg text-[#a1a1aa] leading-relaxed max-w-2xl mx-auto text-balance">
					Start free and scale as your team grows. No hidden fees, no surprises.
				</p>
			</motion.div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
				{plans.map((plan, i) => (
					<motion.div
						key={plan.name}
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.6, ease, delay: i * 0.1 }}
						className={`relative rounded-2xl p-7 sm:p-8 transition-all duration-500 flex flex-col ${
							plan.highlight
								? "border border-[#6366f1]/30 bg-[#6366f1]/5 shadow-2xl shadow-[#6366f1]/10 md:-translate-y-4"
								: "border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)]"
						}`}
					>
						{plan.highlight && (
							<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6366f1] text-primary-foreground uppercase tracking-widest font-bold text-xs px-4 py-1.5 rounded-full">
								Most Popular
							</div>
						)}

						<h3 className="text-xl font-semibold text-foreground">
							{plan.name}
						</h3>
						<div className="mt-4 flex items-baseline gap-1">
							<span className="text-4xl font-bold text-foreground">
								{plan.price}
							</span>
							{plan.period && (
								<span className="text-[#71717a]">{plan.period}</span>
							)}
						</div>
						<p className="mt-3 text-sm text-[#a1a1aa]">{plan.desc}</p>

						<ul className="mt-8 space-y-3 flex-1">
							{plan.features.map((f) => (
								<li
									key={f}
									className="flex items-start gap-3 text-sm text-[#a1a1aa]"
								>
									<Check size={16} className="text-[#818cf8] shrink-0 mt-0.5" />
									{f}
								</li>
							))}
						</ul>

						<Link
							href={plan.href}
							className={`mt-8 w-full py-3.5 rounded-xl font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 ${
								plan.highlight
									? "text-white hover:-translate-y-0.5"
									: "border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-[#d4d4d8] hover:text-white"
							}`}
							style={
								plan.highlight
									? {
											background:
												"linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #818cf8 100%)",
											boxShadow:
												"0 0 20px -4px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)",
										}
									: {
											background:
												"linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
											boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
										}
							}
						>
							{plan.cta}
							{plan.highlight && <ArrowRight size={16} />}
						</Link>
					</motion.div>
				))}
			</div>
		</div>
	</section>
);

export default Pricing;
