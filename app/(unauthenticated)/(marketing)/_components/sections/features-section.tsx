"use client"

import { motion } from "framer-motion"
import {
  FileText,
  Calendar,
  DollarSign,
  ImageIcon,
  Users,
  BarChart3
} from "lucide-react"
import { SectionWrapper } from "./section-wrapper"

const features = [
  {
    name: "AI Script Breakdown",
    description:
      "Automated script analysis extracting scenes, characters, props, locations, and technical requirements with intelligent metadata generation.",
    icon: FileText
  },
  {
    name: "Smart Scheduling",
    description:
      "AI-powered scene scheduling that optimizes shoot sequences based on locations, cast availability, and production constraints.",
    icon: Calendar
  },
  {
    name: "Budget Automation",
    description:
      "Intelligent budget estimation with category-wise breakdowns, cost optimization suggestions, and contingency planning.",
    icon: DollarSign
  },
  {
    name: "AI Storyboards",
    description:
      "Generate professional storyboard sketches from scene descriptions using advanced text-to-image AI models.",
    icon: ImageIcon
  },
  {
    name: "Team Collaboration",
    description:
      "Role-based access for directors, producers, writers, and crew members with real-time project collaboration.",
    icon: Users
  },
  {
    name: "Production Analytics",
    description:
      "Comprehensive project insights, timeline tracking, budget analysis, and production readiness reports.",
    icon: BarChart3
  }
]

export function FeaturesSection() {
  return (
    <SectionWrapper className="relative" id="features">
      <div className="bg-[radial-gradient(45%_45%_at_50%_50%,theme(colors.brand-primary/20),transparent)] absolute inset-0 -z-10 opacity-20 dark:opacity-40" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            id="features-heading"
            className="text-primary text-base leading-7 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Complete Pre-Production Suite
          </motion.h2>
          <motion.p
            className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need from script to shoot
          </motion.p>
          <motion.p
            className="text-muted-foreground mt-6 text-lg leading-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Streamline your film pre-production workflow with AI-powered tools 
            designed for modern filmmakers, studios, and creative professionals.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="group relative flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                <motion.div
                  className="bg-card ring-border w-fit rounded-lg p-2 ring-1"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <feature.icon
                    className="text-primary h-6 w-6"
                    aria-hidden="true"
                  />
                </motion.div>

                <dt className="text-foreground mt-4 flex items-center gap-x-3 text-base leading-7 font-semibold">
                  {feature.name}
                  <motion.div
                    className="from-primary/50 h-px flex-1 bg-gradient-to-r to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    style={{ transformOrigin: "left" }}
                  />
                </dt>

                <dd className="text-muted-foreground mt-4 flex flex-auto flex-col text-base leading-7">
                  <p className="flex-auto">{feature.description}</p>
                </dd>

                <motion.div
                  className="bg-accent/50 absolute -inset-x-4 -inset-y-2 scale-95 rounded-2xl opacity-0"
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
