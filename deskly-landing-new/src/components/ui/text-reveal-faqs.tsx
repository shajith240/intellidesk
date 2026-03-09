"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function FAQs() {
	const faqItems = [
		{
			id: "item-1",
			question: "What is Deskly AI?",
			answer:
				"Deskly AI is a modern, AI-powered helpdesk platform that automates ticket classification, response generation, and customer support workflows to help teams resolve issues faster and more efficiently.",
		},
		{
			id: "item-2",
			question: "Which platforms does Deskly AI support?",
			answer:
				"Deskly AI integrates seamlessly with email, web, and modern JavaScript frameworks. It supports automated email ingestion, smart routing, and works with your existing tools out of the box.",
		},
		{
			id: "item-3",
			question: "Can I customize Deskly AI workflows?",
			answer:
				"Yes! All Deskly AI workflows are fully customizable. You can configure classification rules, response templates, SLA tracking, and routing logic to match your team's specific needs.",
		},
		{
			id: "item-4",
			question: "Does Deskly AI integrate with third-party tools?",
			answer:
				"Absolutely. Deskly AI includes ready-to-use integrations for popular tools and services, making it easy to connect your helpdesk with analytics, authentication, and workflow platforms.",
		},
		{
			id: "item-5",
			question: "Is there documentation and support available?",
			answer:
				"Yes, Deskly AI comes with comprehensive documentation, live examples, and tutorials. Our community and support channels are available to help you get started and resolve any issues.",
		},
	];

	return (
		<section className="py-24 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
				<div className="grid gap-8 md:grid-cols-5 md:gap-12">
					<div className="md:col-span-2">
						<h2 className="text-4xl lg:text-5xl font-medium font-serif">
						<span className="metallic-text">Frequently Asked Questions</span>
					</h2>
						<p className="text-[#a1a1aa] mt-4 text-balance text-lg">
							Everything you need to know about Deskly AI
						</p>
						<p className="text-[#a1a1aa] mt-6 hidden md:block">
							Can't find what you're looking for? Reach out to our{" "}
							<a href="#" className="text-blue-500 font-medium hover:underline">
								support team
							</a>{" "}
							for assistance.
						</p>
					</div>

					<div className="md:col-span-3">
						<Accordion type="single" collapsible>
							{faqItems.map((item) => (
								<AccordionItem
									key={item.id}
									value={item.id}
									className="border-b border-white/[0.06]"
								>
									<AccordionTrigger className="cursor-pointer text-base font-medium text-white hover:no-underline">
										{item.question}
									</AccordionTrigger>
									<AccordionContent>
										<BlurredStagger text={item.answer} />
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>

					<p className="text-[#a1a1aa] mt-6 md:hidden">
						Can't find what you're looking for? Contact our{" "}
						<a href="#" className="text-blue-500 font-medium hover:underline">
							support team
						</a>
					</p>
				</div>
			</div>
		</section>
	);
}

export const BlurredStagger = ({ text = "" }: { text: string }) => {
	const headingText = text;

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.015,
			},
		},
	};

	const letterAnimation = {
		hidden: {
			opacity: 0,
			filter: "blur(10px)",
		},
		show: {
			opacity: 1,
			filter: "blur(0px)",
		},
	};

	return (
		<>
			<div className="w-full">
				<motion.p
					variants={container}
					initial="hidden"
					animate="show"
					className="text-base leading-relaxed break-words whitespace-normal text-[#a1a1aa]"
				>
					{headingText.split("").map((char, index) => (
						<motion.span
							key={index}
							variants={letterAnimation}
							transition={{ duration: 0.3 }}
							className="inline-block"
						>
							{char === " " ? "\u00A0" : char}
						</motion.span>
					))}
				</motion.p>
			</div>
		</>
	);
};
