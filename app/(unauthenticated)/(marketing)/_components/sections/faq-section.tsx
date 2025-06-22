"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useState } from "react"
import { SectionWrapper } from "./section-wrapper"

const faqs = [
  {
    question: "What file formats does Think AI support for script upload?",
    answer:
      "Think AI accepts multiple script formats including .txt, .pdf, .docx, and .fdx (Final Draft). You can also paste your script directly into our editor. The AI automatically parses and analyzes your script regardless of format."
  },
  {
    question: "How accurate is the AI script breakdown?",
    answer:
      "Our AI achieves 90%+ accuracy in identifying scenes, characters, props, and locations. The system learns from industry-standard breakdowns and continuously improves. You can always review and edit the AI suggestions to ensure perfect accuracy for your production."
  },
  {
    question: "Can I collaborate with my team on Think AI?",
    answer:
      "Absolutely! Think AI supports role-based collaboration with specific access levels for Directors, Producers, Writers, and Crew Members. Team members can work simultaneously on different aspects of pre-production with real-time updates."
  },
  {
    question: "How does the AI scheduling work?",
    answer:
      "The scheduling AI considers multiple factors including location availability, cast schedules, equipment needs, and setup requirements. It optimizes shoot sequences to minimize travel time, reduce costs, and maximize efficiency while respecting your constraints."
  },
  {
    question: "What about data security and script confidentiality?",
    answer:
      "We take security seriously. All scripts and project data are encrypted in transit and at rest. We use enterprise-grade security measures and never share your content with third parties. Your intellectual property remains completely confidential."
  },
  {
    question: "Can I export my production data?",
    answer:
      "Yes! Think AI provides comprehensive export options including PDF reports for budgets, schedules, and call sheets. Storyboards can be exported as image bundles or PDFs. All data remains accessible even if you cancel your subscription."
  }
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (question: string) => {
    setOpenItems(prev =>
      prev.includes(question)
        ? prev.filter(item => item !== question)
        : [...prev, question]
    )
  }

  return (
    <SectionWrapper id="faq">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="text-foreground text-2xl leading-10 font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            className="text-muted-foreground mt-6 text-base leading-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to know about Think AI's film pre-production platform. 
            Need more help? Contact our support team.
          </motion.p>
          <dl className="mt-10 space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Collapsible
                  open={openItems.includes(faq.question)}
                  onOpenChange={() => toggleItem(faq.question)}
                >
                  <CollapsibleTrigger className="flex w-full items-start justify-between text-left">
                    <span className="text-foreground text-base leading-7 font-semibold">
                      {faq.question}
                    </span>
                    <motion.span
                      className="ml-6 flex h-7 items-center"
                      animate={{
                        rotate: openItems.includes(faq.question) ? 45 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus
                        className="text-muted-foreground h-6 w-6"
                        aria-hidden="true"
                      />
                    </motion.span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 pr-12">
                    <motion.p
                      className="text-muted-foreground text-base leading-7"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                    </motion.p>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
