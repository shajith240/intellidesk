import { motion } from "framer-motion";
import { Mail, Cpu, Reply, BarChart3 } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const steps = [
  { icon: Mail, gradient: "from-[#3b82f6] to-[#6366f1]", step: "01", title: "Connect Your Gmail", desc: "Link your support inbox in the Settings page. Just enter your Gmail address and an app password — takes under a minute." },
  { icon: Cpu, gradient: "from-[#6366f1] to-[#8b5cf6]", step: "02", title: "AI Classifies & Prioritizes", desc: "Every incoming email is analyzed by Gemini AI to detect category, sentiment, urgency, and priority. Tickets are created automatically." },
  { icon: Reply, gradient: "from-[#8b5cf6] to-[#ec4899]", step: "03", title: "Get Smart Responses", desc: "AI drafts contextual replies using your knowledge base and past tickets. One click to review, edit, and send from the dashboard." },
  { icon: BarChart3, gradient: "from-[#ec4899] to-[#f43f5e]", step: "04", title: "Track & Improve", desc: "Monitor SLA compliance, resolution times, and ticket volume. The more you use Deskly, the smarter your support becomes." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="w-full py-28 sm:py-36 px-5 sm:px-8 lg:px-12">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="text-center mb-16"
      >
        <p className="text-sm font-semibold text-[#818cf8] uppercase tracking-widest mb-4">How It Works</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance text-foreground">
          From inbox to resolution in{" "}
          <span className="gradient-text">four steps</span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#a1a1aa] leading-relaxed max-w-2xl mx-auto text-balance">
          No complex setup. No training required. Connect your email and let AI handle the rest.
        </p>
      </motion.div>

      <div className="relative space-y-4 sm:space-y-5">
        {/* Vertical connector line (desktop) */}
        <div className="hidden md:block absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-[#6366f1]/30 via-[#8b5cf6]/20 to-transparent" />

        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease, delay: i * 0.1 }}
            className="flex items-start gap-5 sm:gap-7 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 sm:p-8 transition-all duration-500 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)]"
          >
            <div className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center relative z-10`}>
              <s.icon size={24} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#71717a] uppercase tracking-widest mb-1">Step {s.step}</p>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
