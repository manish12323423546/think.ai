"use client"

import { motion } from "framer-motion"
import { Check, X, Film, Crown, Zap, ArrowRight, Shield, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PricingButton } from "@/components/payments/pricing-button"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for trying out Think AI",
    icon: Film,
    highlight: false,
    features: [
      "1 project",
      "Basic script breakdown",
      "Simple scheduling",
      "Community support",
      "5 storyboard generations",
      "Basic export options"
    ],
    limits: [
      "Limited to 50 pages per script",
      "Basic AI features only",
      "No team collaboration"
    ],
    cta: "Get Started Free",
    href: "/signup"
  },
  {
    name: "Indie Filmmaker",
    price: "$29",
    period: "/month",
    description: "Perfect for independent filmmakers and small productions",
    icon: Film,
    highlight: false,
    paymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY,
    features: [
      "Up to 5 projects",
      "Advanced AI script breakdown",
      "Smart scheduling algorithms",
      "Budget estimation tools",
      "50 storyboard generations/month",
      "Email support",
      "PDF exports",
      "Basic analytics"
    ],
    limits: [
      "Up to 3 team members",
      "Standard processing speed"
    ],
    cta: "Start Free Trial",
    href: "/signup"
  },
  {
    name: "Studio Pro",
    price: "$99",
    period: "/month",
    description: "Best for studios and production companies",
    icon: Crown,
    highlight: true,
    paymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY,
    features: [
      "Unlimited projects",
      "Premium AI features",
      "Advanced scheduling & optimization",
      "Complete budget management",
      "Unlimited storyboard generations",
      "Team collaboration (up to 20 users)",
      "Priority support",
      "Advanced analytics & reporting",
      "Custom integrations",
      "White-label options",
      "API access",
      "Advanced export formats"
    ],
    limits: [],
    cta: "Start Free Trial",
    href: "/signup"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large studios with custom requirements",
    icon: Zap,
    highlight: false,
    features: [
      "Everything in Studio Pro",
      "Unlimited team members",
      "Custom AI model training",
      "Dedicated account manager",
      "SLA guarantees",
      "On-premise deployment",
      "Custom integrations",
      "Advanced security features",
      "Training & onboarding",
      "24/7 priority support"
    ],
    limits: [],
    cta: "Contact Sales",
    href: "/contact"
  }
]

const comparisonFeatures = [
  {
    category: "Projects & Scripts",
    features: [
      {
        name: "Number of projects",
        starter: "1",
        indie: "5",
        studio: "Unlimited",
        enterprise: "Unlimited"
      },
      {
        name: "Script size limit",
        starter: "50 pages",
        indie: "200 pages",
        studio: "Unlimited",
        enterprise: "Unlimited"
      },
      {
        name: "File format support",
        starter: "Basic",
        indie: "All formats",
        studio: "All formats",
        enterprise: "All formats + Custom"
      }
    ]
  },
  {
    category: "AI Features",
    features: [
      {
        name: "Script breakdown accuracy",
        starter: "Basic (80%)",
        indie: "Advanced (90%)",
        studio: "Premium (95%)",
        enterprise: "Custom (98%+)"
      },
      {
        name: "Storyboard generations",
        starter: "5/month",
        indie: "50/month",
        studio: "Unlimited",
        enterprise: "Unlimited"
      },
      {
        name: "AI scheduling",
        starter: false,
        indie: true,
        studio: true,
        enterprise: true
      }
    ]
  },
  {
    category: "Collaboration",
    features: [
      {
        name: "Team members",
        starter: "1",
        indie: "3",
        studio: "20",
        enterprise: "Unlimited"
      },
      {
        name: "Real-time collaboration",
        starter: false,
        indie: true,
        studio: true,
        enterprise: true
      },
      {
        name: "Role-based permissions",
        starter: false,
        indie: true,
        studio: true,
        enterprise: true
      }
    ]
  }
]

const faqs = [
  {
    question: "Can I change my plan anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "Your data remains accessible for 30 days after cancellation. You can export all your projects and data during this period."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day free trial for all paid plans. If you're not satisfied, you can cancel within the trial period for a full refund."
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees for any plan. You only pay the monthly or annual subscription fee."
  },
  {
    question: "Can I get a custom plan?",
    answer: "Yes! Contact our sales team for custom pricing based on your specific needs and usage requirements."
  }
]

export default function PricingPage() {
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
              Choose Your
              <span className="block bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Production Plan
              </span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg leading-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Scale from indie projects to studio productions. Start with our free plan, 
              upgrade anytime. No hidden fees, cancel whenever you want.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-3xl p-8 ring-1 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground ring-primary scale-105"
                    : "bg-card text-card-foreground ring-border"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <plan.icon
                    className={`h-8 w-8 ${
                      plan.highlight ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                  <h3 className="text-lg leading-8 font-semibold">
                    {plan.name}
                  </h3>
                </div>

                <p className={`text-sm leading-6 mb-6 ${
                  plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {plan.description}
                </p>

                <p className="flex items-baseline gap-x-1 mb-8">
                  <span className={`text-4xl font-bold tracking-tight ${
                    plan.highlight ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm leading-6 font-semibold ${
                    plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {plan.period}
                  </span>
                </p>

                <ul className={`space-y-3 text-sm leading-6 mb-8 ${
                  plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {plan.features.map(feature => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className={`h-6 w-5 flex-none ${
                          plan.highlight ? "text-primary-foreground" : "text-primary"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                  {plan.limits.map(limit => (
                    <li key={limit} className="flex gap-x-3 opacity-60">
                      <X className="h-6 w-5 flex-none" />
                      {limit}
                    </li>
                  ))}
                </ul>

                {plan.paymentLink ? (
                  <PricingButton
                    paymentLink={plan.paymentLink}
                    className={`w-full ${
                      plan.highlight
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </PricingButton>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                    </Link>
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
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
              Compare Plans
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              See what's included in each plan
            </motion.p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-background rounded-lg">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Features</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold">Indie</th>
                  <th className="text-center p-4 font-semibold bg-primary/5">Studio Pro</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr className="border-b bg-muted/50">
                      <td colSpan={5} className="p-4 font-semibold text-sm uppercase tracking-wide">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b">
                        <td className="p-4">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.starter === 'boolean' ? (
                            feature.starter ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            feature.starter
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.indie === 'boolean' ? (
                            feature.indie ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            feature.indie
                          )}
                        </td>
                        <td className="p-4 text-center bg-primary/5">
                          {typeof feature.studio === 'boolean' ? (
                            feature.studio ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            feature.studio
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.enterprise === 'boolean' ? (
                            feature.enterprise ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            feature.enterprise
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <motion.h2 
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Pricing FAQ
            </motion.h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={faq.question}
                className="bg-card rounded-lg p-6 border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: "Secure & Private", description: "Bank-level security for your scripts" },
              { icon: Clock, title: "14-Day Free Trial", description: "Try any paid plan risk-free" },
              { icon: Users, title: "24/7 Support", description: "Get help whenever you need it" }
            ].map((item, index) => (
              <motion.div 
                key={item.title}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <item.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Add React import at the top
import React from "react"
