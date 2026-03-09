import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GradientText from "@/components/ui/gradient-text";

const HeroCubeScene = lazy(() => import("./HeroCubeScene"));

const ease = [0.25, 0.1, 0.25, 1] as const;

const stats = [
	{
		label: "Open Tickets",
		value: "24",
		color: "bg-[#6366f1]/10 text-[#818cf8]",
	},
	{
		label: "Avg Response",
		value: "< 2min",
		color: "bg-[#10b981]/10 text-[#34d399]",
	},
	{
		label: "Auto-Resolved",
		value: "67%",
		color: "bg-[#8b5cf6]/10 text-[#a78bfa]",
	},
	{
		label: "SLA Met",
		value: "98.5%",
		color: "bg-[#3b82f6]/10 text-[#60a5fa]",
	},
];

const tickets = [
	{
		priority: "bg-[#ef4444]",
		label: "P1",
		subject: "Cannot access billing dashboard after upgrade",
		status: "Auto-responding",
		statusColor: "text-[#34d399] bg-[#10b981]/10",
	},
	{
		priority: "bg-[#f97316]",
		label: "P2",
		subject: "Integration with Slack not syncing messages",
		status: "Classified",
		statusColor: "text-[#818cf8] bg-[#6366f1]/10",
	},
	{
		priority: "bg-[#eab308]",
		label: "P3",
		subject: "How to export ticket data to CSV format?",
		status: "Matched FAQ",
		statusColor: "text-[#fbbf24] bg-[#eab308]/10",
	},
];

const Hero = () => {
	return (
		<>
			{/* ══════════ HERO — text + cube only ══════════ */}
			<section className="relative w-full h-screen flex flex-col overflow-hidden">
				{/* Spotlight floor glow */}
				<div
					className="pointer-events-none absolute inset-0 z-0"
					style={{
						background:
							"radial-gradient(ellipse 70% 55% at 65% 80%, rgba(23, 56, 255, 0.07) 0%, transparent 70%)",
					}}
				/>

				{/* Split layout — text left, 3D right */}
				<div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-12 pt-24 sm:pt-28 lg:pt-32 pb-20 flex-1 flex items-center">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center w-full">
						{/* LEFT — Text content */}
						<div className="flex flex-col items-start">
							<motion.h1
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-80px" }}
								transition={{ duration: 0.7, ease, delay: 0.08 }}
								className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] font-medium tracking-tight leading-[1.2] font-serif overflow-visible"
							>
								<span className="metallic-text">Customer</span>
								<br />
								<span className="metallic-text">support that</span>
								<br />
								<GradientText
									className="italic inline-block !backdrop-blur-none"
									colors={['#3f0fff', '#f631f0', '#B19EEF']}
									animationSpeed={14.5}
									showBorder={false}
								>
									resolves itself
								</GradientText>
							</motion.h1>

							<motion.p
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-80px" }}
								transition={{ duration: 0.7, ease, delay: 0.16 }}
								className="mt-6 text-base sm:text-lg text-[#71717a] max-w-md leading-relaxed"
							>
								Deskly AI reads your support emails, classifies them by priority,
								creates tickets, and drafts intelligent responses — all before
								your team even sees them.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-80px" }}
								transition={{ duration: 0.7, ease, delay: 0.24 }}
								className="mt-10 flex flex-col sm:flex-row gap-4"
							>
								<button
									className="group relative inline-flex items-center justify-center gap-2 font-medium px-8 py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 overflow-hidden text-white"
									style={{
										background:
											"linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #818cf8 100%)",
										boxShadow:
											"0 0 20px -4px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)",
									}}
								>
									<span className="relative z-10 flex items-center gap-2">
										Get Started
										<ArrowRight
											size={16}
											className="group-hover:translate-x-0.5 transition-transform"
										/>
									</span>
								</button>
								<button
									className="inline-flex items-center justify-center gap-2 font-medium text-sm px-8 py-3.5 rounded-xl transition-all border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-[#d4d4d8] hover:text-white"
									style={{
										background:
											"linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
										boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
									}}
								>
									Documentation
								</button>
							</motion.div>
						</div>

						{/* RIGHT — 3D Cube Scene */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true, margin: "-80px" }}
							transition={{ duration: 1.0, ease, delay: 0.2 }}
							className="relative w-full h-[400px] sm:h-[450px] lg:h-[520px]"
						>
							{/* 1. Back Glow — large radial behind the cube */}
						<div
							className="pointer-events-none absolute z-0"
							style={{
								right: "20%",
								top: "50%",
								transform: "translateY(-50%)",
								width: "700px",
								height: "700px",
								background:
									"radial-gradient(circle, rgba(80,120,255,0.25) 0%, rgba(80,120,255,0.15) 20%, rgba(80,120,255,0.05) 40%, transparent 65%)",
								filter: "blur(120px)",
							}}
						/>

						{/* 2. Side Spotlight — directional from right */}
						<div
							className="pointer-events-none absolute z-0"
							style={{
								right: "5%",
								top: "40%",
								width: "500px",
								height: "500px",
								background:
									"radial-gradient(ellipse at center, rgba(120,140,255,0.18), rgba(120,140,255,0.08), transparent 60%)",
								filter: "blur(100px)",
							}}
						/>

						{/* 3. Top Ambient Spotlight — white light from above */}
						<div
							className="pointer-events-none absolute z-0"
							style={{
								top: "-200px",
								right: "20%",
								width: "600px",
								height: "400px",
								background:
									"radial-gradient(ellipse, rgba(255,255,255,0.12), rgba(255,255,255,0.05), transparent 70%)",
								filter: "blur(120px)",
							}}
						/>

						{/* 4. Bottom Reflection Light */}
						<div
							className="pointer-events-none absolute z-0"
							style={{
								bottom: "-100px",
								right: "20%",
								width: "600px",
								height: "300px",
								background:
									"radial-gradient(ellipse, rgba(70,90,255,0.25), rgba(70,90,255,0.1), transparent 70%)",
								filter: "blur(120px)",
							}}
						/>

						{/* Cube canvas — clipped */}
						<div className="absolute inset-0 z-10 overflow-hidden">
							<Suspense fallback={null}>
								<HeroCubeScene className="absolute inset-0" />
							</Suspense>
						</div>
						</motion.div>
					</div>
				</div>

				{/* Bottom fade */}
				<div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent z-20 pointer-events-none" />
			</section>

			{/* ══════════ DASHBOARD PREVIEW — separate section ══════════ */}
			<section className="relative w-full overflow-hidden bg-[#09090b]">
				<div className="relative z-10 max-w-6xl mx-auto w-full px-5 sm:px-8 lg:px-12 py-20">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.9, ease, delay: 0.1 }}
						className="w-full"
					>
						<div
							className="rounded-3xl p-1.5 bg-[rgba(24,24,27,0.8)] border border-[rgba(255,255,255,0.08)]"
							style={{
								boxShadow: "0 0 60px -12px rgba(99, 102, 241, 0.4)",
							}}
						>
							<div className="bg-[#09090b] rounded-2xl overflow-hidden">
								{/* Browser bar */}
								<div className="flex items-center gap-3 px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
									<div className="flex gap-1.5">
										<div className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.08)]" />
										<div className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.08)]" />
										<div className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.08)]" />
									</div>
									<div className="flex-1 flex justify-center">
										<div className="bg-[rgba(255,255,255,0.04)] rounded-lg px-4 py-1 text-xs text-[#71717a]">
											app.deskly.ai/dashboard
										</div>
									</div>
								</div>

								<div className="p-4 sm:p-6 space-y-4">
									{/* Stats */}
									<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
										{stats.map((stat) => (
											<div
												key={stat.label}
												className={`${stat.color} rounded-xl p-4`}
											>
												<p className="text-xs opacity-70">{stat.label}</p>
												<p className="text-lg font-bold mt-1">{stat.value}</p>
											</div>
										))}
									</div>

									{/* Ticket rows (desktop only) */}
									<div className="hidden lg:block space-y-2">
										{tickets.map((t, i) => (
											<div
												key={i}
												className="flex items-center gap-4 bg-[rgba(255,255,255,0.02)] rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.04)]"
											>
												<div className="flex items-center gap-2">
													<div
														className={`w-2.5 h-2.5 rounded-full ${t.priority}`}
													/>
													<span className="text-xs font-mono text-[#71717a]">
														{t.label}
													</span>
												</div>
												<span className="text-sm text-[#a1a1aa] truncate flex-1">
													{t.subject}
												</span>
												<span
													className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.statusColor}`}
												>
													{t.status}
												</span>
											</div>
										))}
									</div>
								</div>

								{/* Fade bottom */}
								<div className="h-12 bg-gradient-to-t from-[#09090b] to-transparent" />
							</div>
						</div>
					</motion.div>
				</div>
			</section>
		</>
	);
};

export default Hero;
