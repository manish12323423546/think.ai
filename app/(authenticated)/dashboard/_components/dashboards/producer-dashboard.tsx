"use client"

import { motion } from "framer-motion"
import { 
  Film, 
  Users, 
  Calendar, 
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  TrendingUp,
  Target,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Roles } from "@/types/globals"

interface ProducerDashboardProps {
  userData: {
    name: string
    email: string
    avatar: string
    role: Roles
    permissions: string[]
    userId: string
  }
}

const producerStats = [
  { 
    label: "Active Projects", 
    value: "12", 
    icon: Film,
    change: "+2",
    changeType: "positive" as const
  },
  { 
    label: "Team Members", 
    value: "34", 
    icon: Users,
    change: "+5",
    changeType: "positive" as const
  },
  { 
    label: "Budget Utilized", 
    value: "68%", 
    icon: DollarSign,
    change: "+12%",
    changeType: "warning" as const
  },
  { 
    label: "On-Time Delivery", 
    value: "94%", 
    icon: Target,
    change: "+8%",
    changeType: "positive" as const
  }
]

const activeProjects = [
  {
    title: "The Silent Echo",
    status: "In Production",
    progress: 65,
    budget: "$125,000",
    team: 8,
    deadline: "Dec 15, 2024",
    priority: "high"
  },
  {
    title: "City Lights Remake",
    status: "Pre-Production",
    progress: 30,
    budget: "$200,000",
    team: 12,
    deadline: "Jan 20, 2025",
    priority: "medium"
  },
  {
    title: "Beyond Tomorrow",
    status: "Development",
    progress: 15,
    budget: "$75,000",
    team: 5,
    deadline: "Mar 10, 2025",
    priority: "low"
  }
]

const quickActions = [
  {
    name: "Create Project",
    description: "Start a new production",
    icon: Plus,
    href: "/dashboard/projects/create",
    color: "text-blue-500"
  },
  {
    name: "Team Management",
    description: "Manage team assignments",
    icon: Users,
    href: "/dashboard/team",
    color: "text-green-500"
  },
  {
    name: "Budget Tracking",
    description: "Monitor project budgets",
    icon: DollarSign,
    href: "/dashboard/budget",
    color: "text-yellow-500"
  },
  {
    name: "Schedule",
    description: "View project timelines",
    icon: Calendar,
    href: "/dashboard/schedule",
    color: "text-purple-500"
  }
]

const upcomingDeadlines = [
  {
    project: "The Silent Echo",
    task: "Final Cut Review",
    date: "Dec 8, 2024",
    priority: "high"
  },
  {
    project: "City Lights Remake",
    task: "Script Approval",
    date: "Dec 12, 2024",
    priority: "medium"
  },
  {
    project: "Beyond Tomorrow",
    task: "Budget Review",
    date: "Dec 18, 2024",
    priority: "low"
  }
]

export function ProducerDashboard({ userData }: ProducerDashboardProps) {
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
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Production Hub
            </h1>
            <p className="text-muted-foreground">
              Project management and team coordination - Welcome, {userData.name}
            </p>
          </div>
        </motion.div>
        
        <Badge variant="secondary" className="w-fit">
          Producer Access
        </Badge>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {producerStats.map((stat, index) => (
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
                        : stat.changeType === 'warning'
                        ? 'text-yellow-600'
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
        {/* Active Projects */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Projects</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/projects">View All</Link>
                </Button>
              </div>
              <CardDescription>
                Monitor your current productions and their progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={index}
                  className="p-4 rounded-lg border space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{project.title}</h4>
                    <Badge variant={project.priority === 'high' ? 'destructive' : project.priority === 'medium' ? 'default' : 'secondary'}>
                      {project.priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Status: {project.status}</div>
                    <div>Budget: {project.budget}</div>
                    <div>Team: {project.team} members</div>
                    <div>Due: {project.deadline}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
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
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common production tasks
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
                      <div className="text-left">
                        <div className="font-medium">{action.name}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
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