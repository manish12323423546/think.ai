"use client"

import React from 'react'
import { Layout, Download, FileText, Users, Calendar, BarChart2, Layers, CheckCircle, AlertCircle } from 'lucide-react'
import { useScriptData } from '@/lib/contexts/script-data-context'
import { useRole } from '@/hooks/use-roles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RoleGate } from '@/components/auth/role-gate'
import { Roles } from '@/types/globals'

// Role-specific configurations
const ROLE_CONFIGS = {
  writer: {
    title: 'Project Overview - Writer Dashboard',
    description: 'Track your script development progress',
    badge: 'Writer Access - Script Development Tools',
    color: 'purple',
    uploadLink: '/dashboard/writer/upload-script',
    allowedSteps: ['Script Upload', 'Script Analysis', 'One-Liner', 'Character Breakdown'],
    readOnly: false
  },
  producer: {
    title: 'Project Overview - Producer Dashboard',
    description: 'Complete project management and tracking',
    badge: 'Producer Access - Full Project Management',
    color: 'blue',
    uploadLink: '/dashboard/producer/upload-script',
    allowedSteps: ['Script Upload', 'Script Analysis', 'One-Liner', 'Character Breakdown', 'Schedule', 'Budget', 'Storyboard'],
    readOnly: false
  },
  director: {
    title: 'Project Overview - Director Dashboard',
    description: 'Creative oversight and project planning',
    badge: 'Director Access - Creative Project Tools',
    color: 'green',
    uploadLink: '/dashboard/director/upload-script',
    allowedSteps: ['Script Upload', 'Script Analysis', 'One-Liner', 'Character Breakdown', 'Schedule', 'Storyboard'],
    readOnly: false
  },
  storyboard_artist: {
    title: 'Project Overview - Storyboard Artist Dashboard',
    description: 'Visual planning project overview',
    badge: 'Storyboard Artist Access - Visual Planning',
    color: 'orange',
    uploadLink: '/dashboard/admin/upload-script',
    allowedSteps: ['Script Upload', 'Script Analysis', 'Character Breakdown', 'Storyboard'],
    readOnly: true
  },
  team_member: {
    title: 'Project Overview - Team Member Dashboard',
    description: 'Basic project information and progress',
    badge: 'Team Member Access - Read-Only Overview',
    color: 'gray',
    uploadLink: '/dashboard/admin/upload-script',
    allowedSteps: ['Script Upload', 'Script Analysis'],
    readOnly: true
  },
  admin: {
    title: 'Project Overview - Admin Dashboard',
    description: 'Complete project summary and export options',
    badge: 'Admin Access - Full System Control',
    color: 'red',
    uploadLink: '/dashboard/admin/upload-script',
    allowedSteps: ['Script Upload', 'Script Analysis', 'One-Liner', 'Character Breakdown', 'Schedule', 'Budget', 'Storyboard'],
    readOnly: false
  }
}

interface SharedProjectOverviewProps {
  allowedRoles: Roles[]
  requiredPermission: string
  viewMode?: 'full' | 'limited'
}

export function SharedProjectOverview({ allowedRoles, requiredPermission, viewMode = 'full' }: SharedProjectOverviewProps) {
  const { role } = useRole()
  const { 
    scriptData, 
    oneLinerData, 
    characterData, 
    scheduleData, 
    budgetData, 
    storyboardData 
  } = useScriptData()

  // Get role-specific configuration
  const config = ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS] || ROLE_CONFIGS.team_member

  // Create steps based on role permissions
  const allSteps = [
    { name: 'Script Upload', completed: !!scriptData, href: `${config.uploadLink}` },
    { name: 'Script Analysis', completed: !!scriptData, href: `/dashboard/${role}/script-analysis` },
    { name: 'One-Liner', completed: !!oneLinerData, href: `/dashboard/${role}/one-liner` },
    { name: 'Character Breakdown', completed: !!characterData, href: `/dashboard/${role}/character-breakdown` },
    { name: 'Schedule', completed: !!scheduleData, href: `/dashboard/${role}/schedule` },
    { name: 'Budget', completed: !!budgetData, href: `/dashboard/${role}/budget` },
    { name: 'Storyboard', completed: !!storyboardData, href: `/dashboard/${role}/storyboard` }
  ]

  const completedSteps = allSteps.filter(step => config.allowedSteps.includes(step.name))
  const completionPercentage = completedSteps.length > 0 ? (completedSteps.filter(step => step.completed).length / completedSteps.length) * 100 : 0

  const exportProject = () => {
    if (config.readOnly) {
      return
    }

    const projectData = {
      scriptData,
      oneLinerData,
      characterData,
      scheduleData,
      budgetData,
      storyboardData,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${role}-project-export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!scriptData) {
    return (
      <RoleGate roles={allowedRoles}>
        <div className="h-full overflow-y-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No project data available</h3>
              <p className="text-muted-foreground mb-4">
                Please upload a script to get started.
              </p>
              <Button asChild>
                <a href={config.uploadLink}>Upload Script</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </RoleGate>
    )
  }

  return (
    <RoleGate roles={allowedRoles}>
      <div className="h-full overflow-y-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`bg-${config.color}-500 text-white p-2 rounded-lg`}>
                <Layout className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {config.title}
                </h1>
                <p className="text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
            
            {!config.readOnly && (
              <Button onClick={exportProject} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Project
              </Button>
            )}
          </div>
          
          <Badge variant="secondary" className="w-fit">
            {config.badge}
          </Badge>
          
          {config.readOnly && (
            <Badge variant="outline" className="w-fit bg-yellow-50 border-yellow-200 text-yellow-700">
              Read-Only Access
            </Badge>
          )}
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Completion</CardTitle>
            <CardDescription>
              Track your progress through the pre-production workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {completedSteps.map((step, index) => (
                <Card key={index} className={step.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {step.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm">{step.name}</h4>
                    {!step.completed && !config.readOnly && (
                      <Button asChild size="sm" variant="outline" className="mt-2">
                        <a href={step.href}>Complete</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scenes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scriptData.parsed_data?.scenes?.length || 0}
              </div>
            </CardContent>
          </Card>

          {config.allowedSteps.includes('Character Breakdown') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Characters</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {characterData ? Object.keys(characterData.characters || {}).length : Object.keys(scriptData.characters || {}).length}
                </div>
              </CardContent>
            </Card>
          )}

          {config.allowedSteps.includes('Schedule') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shoot Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scheduleData ? scheduleData.schedule?.length || 0 : '-'}
                </div>
              </CardContent>
            </Card>
          )}

          {config.allowedSteps.includes('Budget') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {budgetData ? `$${budgetData.budget?.total?.toLocaleString() || 0}` : '-'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump to different sections of your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {config.allowedSteps.includes('Script Analysis') && (
                <Button asChild variant="outline" className="h-auto p-4">
                  <a href={`/dashboard/${role}/script-analysis`} className="flex flex-col items-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Script Analysis</span>
                  </a>
                </Button>
              )}
              
              {config.allowedSteps.includes('Character Breakdown') && (
                <Button asChild variant="outline" className="h-auto p-4">
                  <a href={`/dashboard/${role}/character-breakdown`} className="flex flex-col items-center">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Characters</span>
                  </a>
                </Button>
              )}
              
              {config.allowedSteps.includes('Schedule') && (
                <Button asChild variant="outline" className="h-auto p-4">
                  <a href={`/dashboard/${role}/schedule`} className="flex flex-col items-center">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span>Schedule</span>
                  </a>
                </Button>
              )}
              
              {config.allowedSteps.includes('Storyboard') && (
                <Button asChild variant="outline" className="h-auto p-4">
                  <a href={`/dashboard/${role}/storyboard`} className="flex flex-col items-center">
                    <Layers className="h-6 w-6 mb-2" />
                    <span>Storyboard</span>
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  )
}