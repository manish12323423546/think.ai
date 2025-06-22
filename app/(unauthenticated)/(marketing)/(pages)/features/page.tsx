"use client"

import { motion } from "framer-motion"
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  ImageIcon, 
  Users, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Upload,
  Brain,
  Clock,
  Shield,
  Zap,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const mainFeatures = [
  {
    name: "AI Script Breakdown",
    description: "Transform your screenplay into actionable production data with our advanced AI that understands film terminology and industry standards.",
    icon: FileText,
    features: [
      "Automatic scene extraction and numbering",
      "Character identification and arc tracking",
      "Props, costumes, and set requirements",
      "Location and time-of-day analysis",
      "Special effects and technical requirements",
      "Dialogue and action balance metrics"
    ]
  },
  {
    name: "Smart Scheduling",
    description: "Optimize your shooting schedule with AI that considers all production constraints and maximizes efficiency.",
    icon: Calendar,
    features: [
      "Location-based scene grouping",
      "Cast availability optimization",
      "Equipment and crew scheduling",
      "Weather and daylight considerations",
      "Setup and breakdown time estimation",
      "Conflict detection and resolution"
    ]
  },
  {
    name: "Budget Intelligence",
    description: "Get accurate budget estimates powered by real industry data and AI-driven cost analysis.",
    icon: DollarSign,
    features: [
      "Above and below the line costs",
      "Location and equipment pricing",
      "Crew rate calculations",
      "Insurance and permit estimates",
      "Contingency planning",
      "Cost optimization suggestions"
    ]
  },
  {
    name: "AI Storyboards",
    description: "Generate professional storyboard sketches from scene descriptions using cutting-edge image generation.",
    icon: ImageIcon,
    features: [
      "Text-to-image generation",
      "Multiple art styles available",
      "Shot composition suggestions",
      "Camera angle recommendations",
      "Lighting and mood visualization",
      "Easy editing and refinement"
    ]
  },
  {
    name: "Team Collaboration",
    description: "Coordinate your entire production team with role-based access and real-time collaboration tools.",
    icon: Users,
    features: [
      "Role-based permissions system",
      "Real-time project updates",
      "Comment and feedback system",
      "Version control and history",
      "Task assignment and tracking",
      "Communication hub"
    ]
  },
  {
    name: "Production Analytics",
    description: "Make data-driven decisions with comprehensive insights into every aspect of your production.",
    icon: BarChart3,
    features: [
      "Production timeline analysis",
      "Budget vs. actual tracking",
      "Resource utilization reports",
      "Team productivity metrics",
      "Risk assessment indicators",
      "Progress visualization"
    ]
  }
]

const additionalFeatures = [
  {
    icon: Upload,
    title: "Multiple File Formats",
    description: "Support for .txt, .pdf, .docx, and .fdx files"
  },
  {
    icon: Brain,
    title: "Continuous Learning",
    description: "AI models that improve with each project"
  },
  {
    icon: Clock,
    title: "Real-time Processing",
    description: "Instant analysis and feedback on changes"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and data protection"
  },
  {
    icon: Zap,
    title: "Fast Performance",
    description: "Lightning-fast processing of large scripts"
  },
  {
    icon: Target,
    title: "Industry Accuracy",
    description: "Trained on professional film data"
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Powerful Features for
              <span className="block bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Every Production
              </span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg leading-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover how Think AI's comprehensive suite of tools transforms your 
              pre-production workflow from script to shooting schedule.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-20">
            {mainFeatures.map((feature, index) => (
              <motion.div 
                key={feature.name}
                className={`lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                      {feature.name}
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <div className="space-y-3">
                    {feature.features.map((item, itemIndex) => (
                      <motion.div 
                        key={item}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: itemIndex * 0.1 }}
                      >
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className={`mt-12 lg:mt-0 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 h-80 flex items-center justify-center">
                    <feature.icon className="h-32 w-32 text-primary/30" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <motion.h2 
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Built for Professionals
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Additional features that make Think AI the complete solution
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-background rounded-lg p-6 shadow-sm border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h2 
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Seamless Integration
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Works with your existing tools and workflows
            </motion.p>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {["Final Draft", "Movie Magic", "StudioBinder", "Celtx"].map((tool, index) => (
              <motion.div 
                key={tool}
                className="bg-muted/50 rounded-lg p-6 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="text-lg font-semibold text-muted-foreground">{tool}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h2 
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Experience the Future of Pre-Production
            </motion.h2>
            <motion.p 
              className="mt-6 text-lg leading-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Start your free trial today and see how Think AI can transform your workflow
            </motion.p>
            <motion.div 
              className="mt-10 flex items-center justify-center gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
