"use client"

import { motion } from "framer-motion"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Headphones, 
  Users, 
  ArrowRight,
  Send,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { createComponentLogger } from "@/lib/logger"
import { useState } from "react"

const contactOptions = [
  {
    icon: MessageSquare,
    title: "General Inquiries",
    description: "Questions about Think AI and our services",
    contact: "hello@thinkai.com",
    action: "Send Email"
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Technical support and account assistance",
    contact: "support@thinkai.com",
    action: "Get Support"
  },
  {
    icon: Users,
    title: "Sales & Partnerships",
    description: "Enterprise deals and partnership opportunities",
    contact: "sales@thinkai.com",
    action: "Contact Sales"
  }
]

const officeInfo = [
  {
    icon: MapPin,
    title: "Headquarters",
    details: ["123 Innovation Drive", "Los Angeles, CA 90028", "United States"]
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+1 (555) 123-4567", "Mon-Fri 9AM-6PM PST"]
  },
  {
    icon: Clock,
    title: "Support Hours",
    details: ["24/7 for Pro & Enterprise", "Business hours for others"]
  }
]

const faqs = [
  {
    question: "How quickly do you respond to inquiries?",
    answer: "We aim to respond to all inquiries within 24 hours. Enterprise customers receive priority support with faster response times."
  },
  {
    question: "Do you offer phone support?",
    answer: "Phone support is available for Studio Pro and Enterprise customers. Indie plan users can access email and chat support."
  },
  {
    question: "Can I schedule a demo?",
    answer: "Yes! Contact our sales team to schedule a personalized demo of Think AI's features for your production needs."
  },
  {
    question: "Do you provide training?",
    answer: "We offer comprehensive onboarding and training sessions for Enterprise customers, plus extensive documentation for all users."
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    const logger = createComponentLogger('ContactPage')
    logger.info('Contact form submitted', {
      metadata: {
        name: formData.name,
        email: formData.email,
        messageLength: formData.message.length
      }
    })
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
              Get in Touch with
              <span className="block bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Our Team
              </span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg leading-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Whether you have questions, need support, or want to explore how Think AI 
              can transform your production workflow, we're here to help.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {contactOptions.map((option, index) => (
              <motion.div
                key={option.title}
                className="bg-card rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <option.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {option.title}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">{option.description}</p>
                <p className="text-sm font-medium text-foreground mb-4">{option.contact}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`mailto:${option.contact}`}>
                    {option.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8">
                Send us a message
              </h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700">
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What can we help you with?"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your needs..."
                      rows={5}
                      className="mt-2"
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Office Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8">
                Office Information
              </h2>
              
              <div className="space-y-8">
                {officeInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-muted-foreground">{detail}</p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Map placeholder */}
              <motion.div
                className="mt-12 h-64 bg-muted rounded-lg flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Interactive map coming soon</p>
                </div>
              </motion.div>
            </motion.div>
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
              Contact FAQ
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Quick answers to common questions about getting in touch
            </motion.p>
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
              Ready to get started?
            </motion.h2>
            <motion.p 
              className="mt-6 text-lg leading-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Don't wait for the perfect moment. Start transforming your pre-production workflow today.
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
                <Link href="/features">
                  Explore Features
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
