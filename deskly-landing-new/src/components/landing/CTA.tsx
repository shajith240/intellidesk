import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const CTA = () => (
  <section className="w-full py-28 sm:py-36 px-5 sm:px-8 lg:px-12">
    <div className="relative max-w-4xl mx-auto text-center">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6366f1]/[0.08] rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="relative z-10"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-balance font-serif">
          <span className="metallic-text">Ready to automate your</span>{" "}
          <span className="gradient-text italic inline-block" style={{ paddingRight: '0.15em' }}>customer support</span>
          <span className="metallic-text">?</span>
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#a1a1aa] leading-relaxed max-w-2xl mx-auto text-balance">
          Join hundreds of teams who save hours every week with AI-powered email triage and response drafting. Start free — no credit card required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#818cf8] text-primary-foreground font-semibold px-8 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-[#6366f1]/20 hover:-translate-y-0.5">
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="inline-flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] backdrop-blur-sm text-[#d4d4d8] hover:text-foreground font-semibold px-8 py-4 rounded-2xl transition-all">
            Talk to Sales
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTA;
