import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const faqs = [
  { q: "How does Deskly AI classify emails?", a: "Deskly uses Google Gemini to analyze each incoming email for category (billing, technical, general, etc.), priority (P1–P4), sentiment (positive, neutral, negative), and urgency. This happens automatically within seconds of receiving an email." },
  { q: "Do I need a special email setup?", a: "No. Just connect your Gmail account with an app password. Deskly polls your inbox via IMAP and sends replies via SMTP — no email forwarding or DNS changes required." },
  { q: "Is my data shared between organizations?", a: "Never. Deskly uses full multi-tenant isolation with row-level security in the database. Each organization's emails, tickets, customers, and settings are completely separated." },
  { q: "Can I customize the AI responses?", a: "Yes. The AI generates draft responses based on your knowledge base (FAQs) and past ticket resolutions. You can review, edit, and approve every response before it's sent." },
  { q: "What happens if I exceed the free tier limits?", a: "You'll receive a notification when you're approaching your limit. Your existing tickets remain accessible — you just won't be able to process new ones until you upgrade or the next billing cycle." },
  { q: "Can I use Deskly with non-Gmail email providers?", a: "Currently Deskly is optimized for Gmail, but any IMAP/SMTP-compatible email provider can be configured. Support for Outlook and custom SMTP servers is on our roadmap." },
];

const FAQItem = ({ q, a, open, toggle }: { q: string; a: string; open: boolean; toggle: () => void }) => (
  <div className="border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
    <button onClick={toggle} className="w-full flex items-center justify-between py-5 text-left gap-4">
      <span className="text-sm sm:text-base font-medium text-foreground">{q}</span>
      <ChevronDown size={18} className={`text-[#71717a] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
    </button>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease }}
          className="overflow-hidden"
        >
          <p className="pb-5 text-sm text-[#a1a1aa] leading-relaxed">{a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full py-28 sm:py-36 px-5 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-[#818cf8] uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance text-foreground">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-6 sm:px-8"
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} open={openIndex === i} toggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
