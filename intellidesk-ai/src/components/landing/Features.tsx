import { motion } from "framer-motion";
import { Mail, Brain, Ticket, MessageSquare, Search, Shield } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const features = [
  { icon: Mail, title: "Smart Email Ingestion", desc: "Connect your Gmail in seconds. Deskly automatically pulls in support emails and processes them in real-time.", color: "text-[#60a5fa]", bg: "bg-[#3b82f6]/10" },
  { icon: Brain, title: "AI Classification", desc: "Every email is analyzed by AI to determine category, priority (P1–P4), sentiment, and urgency — no manual triage.", color: "text-[#818cf8]", bg: "bg-[#6366f1]/10" },
  { icon: Ticket, title: "Auto Ticket Creation", desc: "Tickets are created automatically with SLA timers, priority labels, and customer context — ready for your team.", color: "text-[#a78bfa]", bg: "bg-[#8b5cf6]/10" },
  { icon: MessageSquare, title: "AI-Drafted Responses", desc: "Intelligent response drafts that match your knowledge base and past resolutions. Review, edit, send — done.", color: "text-[#34d399]", bg: "bg-[#10b981]/10" },
  { icon: Search, title: "Semantic Search", desc: "Search across tickets, emails, and FAQs with natural language. Find related issues instantly with vector similarity.", color: "text-[#fbbf24]", bg: "bg-[#f59e0b]/10" },
  { icon: Shield, title: "Multi-Tenant Isolation", desc: "Every team gets their own isolated workspace. Data, emails, and settings are completely separated between organizations.", color: "text-[#fb7185]", bg: "bg-[#f43f5e]/10" },
];

const Features = () => (
  <section id="features" className="w-full py-28 sm:py-36 px-5 sm:px-8 lg:px-12">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="text-center mb-16"
      >
        <p className="text-sm font-semibold text-[#818cf8] uppercase tracking-widest mb-4">Features</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance text-foreground">
          Everything your helpdesk needs,{" "}
          <span className="gradient-text">powered by AI</span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#a1a1aa] leading-relaxed max-w-2xl mx-auto text-balance">
          From email to resolution — Deskly handles the entire support pipeline so your team can focus on what matters.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease, delay: i * 0.08 }}
            className="group rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-7 sm:p-8 transition-all duration-500 hover:-translate-y-1 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)]"
          >
            <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
              <f.icon size={22} className={f.color} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
