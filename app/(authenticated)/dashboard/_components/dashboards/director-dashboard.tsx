"use client"

import { motion } from "framer-motion"
import { 
  Trophy, 
  Users, 
  Film, 
  CheckCircle,
  Clock,
  Star,
  Eye,
  MessageCircle,
  TrendingUp,
  Calendar,
  Flag,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Roles } from "@/types/globals"

interface DirectorDashboardProps {
  userData: {
    name: string
    email: string
    avatar: string
    role: Roles
    permissions: string[]
    userId: string
  }
}

const directorStats = [
  { 
    label: "Active Projects", 
    value: "6", 
    icon: Film,
    change: "+1",
    changeType: "positive" as const
  },
  { 
    label: "Team Members", 
    value: "28", 
    icon: Users,
    change: "+4",
    changeType: "positive" as const
  },
  { 
    label: "Completion Rate", 
    value: "89%", 
    icon: TrendingUp,
    change: "+12%",
    changeType: "positive" as const
  },
  { 
    label: "Pending Reviews", 
    value: "7", 
    icon: Eye,
    change: "-2",
    changeType: "positive" as const
  }
]

const projectsRequiringAttention = [
  {
    title: "The Silent Echo",
    issue: "Script revision approval needed",
    priority: "high",
    dueDate: "Today",
    team: "Writing Team"
  },
  {
    title: "City Lights Remake",
    issue: "Budget reallocation decision",
    priority: "medium",
    dueDate: "Dec 10",
    team: "Production Team"
  },
  {
    title: "Beyond Tomorrow",
    issue: "Cast selection final approval",
    priority: "medium",
    dueDate: "Dec 12",
    team: "Casting Team"
  }
]

const quickActions = [
  {
    name: "Review Scripts",
    description: "Scripts awaiting approval",
    icon: Eye,
    href: "/dashboard/reviews/scripts",
    color: "text-blue-500",
    count: 3
  },
  {
    name: "Team Messages",
    description: "Team communications",
    icon: MessageCircle,
    href: "/dashboard/messages",
    color: "text-green-500",
    count: 8
  },
  {
    name: "Project Calendar",
    description: "Upcoming milestones",
    icon: Calendar,
    href: "/dashboard/calendar",
    color: "text-purple-500",
    count: 5
  },
  {
    name: "Creative Decisions",
    description: "Decisions pending",
    icon: Flag,
    href: "/dashboard/decisions",
    color: "text-orange-500",
    count: 2
  }
]

const recentDecisions = [
  {
    project: "The Silent Echo",
    decision: "Approved final storyboard designs",
    time: "2 hours ago",
    impact: "High"
  },
  {
    project: "City Lights Remake",
    decision: "Selected lead actor",
    time: "1 day ago",
    impact: "High"
  },
  {
    project: "Beyond Tomorrow",
    decision: "Approved location change",
    time: "2 days ago",
    impact: "Medium"
  }
]

export function DirectorDashboard({ userData }: DirectorDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-indigo-500 text-white p-2 rounded-lg">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Director's Command
            </h1>
            <p className="text-muted-foreground">
              Creative leadership and project oversight - Welcome, {userData.name}
            </p>
          </div>
        </motion.div>
        
        <Badge variant="secondary" className="w-fit">
          Director Access
        </Badge>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {directorStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {stat.change} this month
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Projects Requiring Attention */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Requires Your Attention
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/attention">View All</Link>
                </Button>
              </div>
              <CardDescription>
                Projects and decisions waiting for your input
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectsRequiringAttention.map((item, index) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-lg border space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant={item.priority === 'high' ? 'destructive' : 'default'}>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.issue}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Team: {item.team}</span>
                    <span>Due: {item.dueDate}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      Review
                    </Button>
                    <Button size="sm" variant="outline">
                      Delegate
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Decisions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Decisions</CardTitle>
              <CardDescription>
                Your latest creative and strategic decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDecisions.map((decision, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{decision.decision}</p>
                    <p className="text-xs text-muted-foreground">{decision.project}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{decision.time}</p>
                    <Badge variant={decision.impact === 'High' ? 'default' : 'secondary'}>
                      {decision.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Director Actions</CardTitle>
              <CardDescription>
                Your leadership tools and decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                    <Link href={action.href}>
                      <action.icon className={`mr-3 h-5 w-5 ${action.color}`} />
                      <div className="text-left flex-1">
                        <div className="font-medium">{action.name}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                      {action.count > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {action.count}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 