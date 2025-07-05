"use client"

import React from 'react'
import { Layout, Download, FileText, Users, Calendar, BarChart2, Layers, CheckCircle } from 'lucide-react'
import { useScriptData } from '@/lib/contexts/script-data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function ProjectOverviewPage() {
  const { 
    scriptData, 
    oneLinerData, 
    characterData, 
    scheduleData, 
    budgetData, 
    storyboardData 
  } = useScriptData()

  const completedSteps = [
    { name: 'Script Upload', completed: !!scriptData, href: '/dashboard/admin/upload-script' },
    { name: 'Script Analysis', completed: !!scriptData, href: '/dashboard/admin/script-analysis' },
    { name: 'One-Liner', completed: !!oneLinerData, href: '/dashboard/admin/one-liner' },
    { name: 'Character Breakdown', completed: !!characterData, href: '/dashboard/admin/character-breakdown' },
    { name: 'Schedule', completed: !!scheduleData, href: '/dashboard/admin/schedule' },
    { name: 'Budget', completed: !!budgetData, href: '/dashboard/admin/budget' },
    { name: 'Storyboard', completed: !!storyboardData, href: '/dashboard/admin/storyboard' }
  ]

  const completionPercentage = (completedSteps.filter(step => step.completed).length / completedSteps.length) * 100

  const exportProject = () => {
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
    a.download = 'project-export.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!scriptData) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No project data available</h3>
            <p className="text-muted-foreground mb-4">
              Please upload a script to get started.
            </p>
            <Button asChild>
              <a href="/dashboard/admin/upload-script">Upload Script</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white p-2 rounded-lg">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Project Overview
              </h1>
              <p className="text-muted-foreground">
                Complete project summary and export options
              </p>
            </div>
          </div>
          
          <Button onClick={exportProject} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Project
          </Button>
        </div>
        
        <Badge variant="secondary" className="w-fit">
          Project Dashboard
        </Badge>
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
                  {!step.completed && (
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
              {scriptData.parsed_data.scenes.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Characters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {characterData ? Object.keys(characterData.characters).length : Object.keys(scriptData.characters).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shoot Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduleData ? scheduleData.schedule.length : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetData ? `$${budgetData.budget.total.toLocaleString()}` : '-'}
            </div>
          </CardContent>
        </Card>
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
            <Button asChild variant="outline" className="h-auto p-4">
              <a href="/dashboard/admin/script-analysis" className="flex flex-col items-center">
                <FileText className="h-6 w-6 mb-2" />
                <span>Script Analysis</span>
              </a>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <a href="/dashboard/admin/character-breakdown" className="flex flex-col items-center">
                <Users className="h-6 w-6 mb-2" />
                <span>Characters</span>
              </a>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <a href="/dashboard/admin/schedule" className="flex flex-col items-center">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Schedule</span>
              </a>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <a href="/dashboard/admin/storyboard" className="flex flex-col items-center">
                <Layers className="h-6 w-6 mb-2" />
                <span>Storyboard</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}