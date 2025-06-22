import { Mail, Film, Book, MessageCircle, Video, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const supportOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help with your Think AI account and projects",
    contact: "support@thinkai.com",
    responseTime: "Within 24 hours",
    color: "text-blue-600"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    contact: "Available in app",
    responseTime: "During business hours",
    color: "text-green-600"
  },
  {
    icon: Video,
    title: "Video Call Support",
    description: "Schedule a one-on-one session for complex issues",
    contact: "Premium plans only",
    responseTime: "By appointment",
    color: "text-purple-600"
  }
]

const resources = [
  {
    icon: Book,
    title: "Documentation",
    description: "Comprehensive guides and tutorials",
    href: "/features",
    color: "text-orange-600"
  },
  {
    icon: Film,
    title: "Video Tutorials",
    description: "Learn Think AI with step-by-step videos",
    href: "/features",
    color: "text-red-600"
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Common questions and answers",
    href: "/contact",
    color: "text-indigo-600"
  }
]

const commonTopics = [
  {
    title: "Script Upload & Analysis",
    description: "Learn how to upload scripts and understand AI analysis results",
    tags: ["AI", "Scripts", "Analysis"]
  },
  {
    title: "Storyboard Generation",
    description: "Creating and customizing AI-generated storyboards",
    tags: ["Storyboards", "AI", "Visuals"]
  },
  {
    title: "Production Scheduling",
    description: "Using smart scheduling features for your film projects",
    tags: ["Scheduling", "Production", "Planning"]
  },
  {
    title: "Budget Management",
    description: "Setting up and managing project budgets with AI insights",
    tags: ["Budget", "Finance", "Planning"]
  },
  {
    title: "Team Collaboration",
    description: "Inviting team members and managing project permissions",
    tags: ["Collaboration", "Teams", "Permissions"]
  }
]

export default async function SupportPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          Support Center
        </h1>
        <p className="text-muted-foreground">
          Get help with Think AI's film pre-production platform
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Support Options */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact Support</h2>
            <div className="grid gap-4">
              {supportOptions.map((option, index) => (
                <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                      <option.icon className={`h-6 w-6 ${option.color}`} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">{option.title}</h3>
                        <p className="text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{option.contact}</p>
                          <p className="text-xs text-muted-foreground">Response time: {option.responseTime}</p>
                        </div>
                        {option.contact.includes("@") && (
                          <Button size="sm" asChild>
                            <a href={`mailto:${option.contact}`}>
                              Contact
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Topics */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Common Help Topics</h2>
            <div className="space-y-3">
              {commonTopics.map((topic, index) => (
                <div key={index} className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-medium mb-2">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {topic.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources & Quick Links */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resources</h2>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="w-full h-auto p-4 justify-start"
                  asChild
                >
                  <Link href={resource.href}>
                    <resource.icon className={`h-5 w-5 mr-3 ${resource.color}`} />
                    <div className="text-left">
                      <div className="font-medium">{resource.title}</div>
                      <div className="text-sm text-muted-foreground">{resource.description}</div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Support Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                <span className="text-sm font-medium">2.3 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resolution Rate</span>
                <span className="text-sm font-medium">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                <span className="text-sm font-medium">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Critical Issues?
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              For production-critical issues affecting active film projects, contact our emergency support line.
            </p>
            <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300">
              Emergency Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
