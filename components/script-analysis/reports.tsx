"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Timer,
  FileText,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react'

interface EighthsCalculatorReport {
  total_scenes: number
  total_eighths: number
  estimated_shoot_days: number
  total_pages: number
  complexity_breakdown: {
    simple: number
    moderate: number
    complex: number
  }
}

interface TimingAnalysis {
  processing_time: number
  scenes_processed: number
  average_time_per_scene: number
}

interface DepartmentSummary {
  total_departments_involved: number
  total_crew_size: number
  total_estimated_hours: number
  most_involved_department: string
  least_involved_department: string
}

interface ProcessingSummary {
  total_processing_time: string
  agents_used: number
  completed_stages: number
  status: string
  timestamp: string
}

interface ReportsProps {
  reports: {
    eighths_calculator: EighthsCalculatorReport
    timing_analysis: TimingAnalysis
    department_summary: DepartmentSummary
    processing_summary: ProcessingSummary
  }
}

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "text-blue-600" 
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: string
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
)

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    completed: { variant: "outline" as const, color: "text-green-600 border-green-600", icon: CheckCircle },
    failed: { variant: "destructive" as const, color: "", icon: AlertCircle },
    processing: { variant: "outline" as const, color: "text-blue-600 border-blue-600", icon: Timer }
  }
  
  const config = variants[status as keyof typeof variants] || variants.completed
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function Reports({ reports }: ReportsProps) {
  if (!reports) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Reports</CardTitle>
          <CardDescription>No reports available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Upload a script to generate reports
          </div>
        </CardContent>
      </Card>
    )
  }

  const { eighths_calculator, timing_analysis, department_summary, processing_summary } = reports

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Scenes"
          value={eighths_calculator?.total_scenes || 0}
          subtitle="Processed"
          icon={FileText}
          color="text-blue-600"
        />
        <MetricCard
          title="Shoot Days"
          value={eighths_calculator?.estimated_shoot_days?.toFixed(1) || "0"}
          subtitle="Estimated"
          icon={Calendar}
          color="text-green-600"
        />
        <MetricCard
          title="Total Crew"
          value={department_summary?.total_crew_size || 0}
          subtitle="Required"
          icon={Users}
          color="text-purple-600"
        />
        <MetricCard
          title="Processing Time"
          value={`${timing_analysis?.processing_time?.toFixed(1) || 0}s`}
          subtitle="Total"
          icon={Timer}
          color="text-orange-600"
        />
      </div>

      <Tabs defaultValue="eighths" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eighths">ADK Eighths</TabsTrigger>
          <TabsTrigger value="timing">Timing Analysis</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        {/* ADK Eighths Calculator Report */}
        <TabsContent value="eighths">
          <Card>
            <CardHeader>
              <CardTitle>🎬 ADK Eighths Calculator Report</CardTitle>
              <CardDescription>Industry-standard script timing and complexity analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{eighths_calculator?.total_scenes || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Scenes</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{eighths_calculator?.total_eighths || 0}</div>
                  <div className="text-sm text-muted-foreground">Script Eighths</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{eighths_calculator?.total_pages || 0}</div>
                  <div className="text-sm text-muted-foreground">Script Pages</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {eighths_calculator?.estimated_shoot_days?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Shoot Days</div>
                </div>
              </div>

              {/* Complexity Breakdown */}
              {eighths_calculator?.complexity_breakdown && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Scene Complexity Distribution</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Simple Scenes</span>
                        <span className="text-sm font-semibold">
                          {eighths_calculator.complexity_breakdown.simple} scenes
                        </span>
                      </div>
                      <Progress 
                        value={(eighths_calculator.complexity_breakdown.simple / eighths_calculator.total_scenes) * 100} 
                        className="h-3"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600">Moderate Scenes</span>
                        <span className="text-sm font-semibold">
                          {eighths_calculator.complexity_breakdown.moderate} scenes
                        </span>
                      </div>
                      <Progress 
                        value={(eighths_calculator.complexity_breakdown.moderate / eighths_calculator.total_scenes) * 100} 
                        className="h-3"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">Complex Scenes</span>
                        <span className="text-sm font-semibold">
                          {eighths_calculator.complexity_breakdown.complex} scenes
                        </span>
                      </div>
                      <Progress 
                        value={(eighths_calculator.complexity_breakdown.complex / eighths_calculator.total_scenes) * 100} 
                        className="h-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Industry Standards Note */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">Industry Standard Calculations</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Based on standard film industry metrics: 8 eighths per page, 9 minutes per eighth, 
                      60 eighths per shooting day, 12-hour crew days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Analysis */}
        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle>⏱️ Timing Analysis</CardTitle>
              <CardDescription>Processing performance and efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {timing_analysis?.processing_time?.toFixed(2) || 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Total Processing Time</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {timing_analysis?.scenes_processed || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Scenes Processed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {timing_analysis?.average_time_per_scene?.toFixed(2) || 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Time per Scene</div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Performance Insights</h4>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">Processing Speed</span>
                    <Badge variant="outline" className="text-green-600">
                      {timing_analysis?.scenes_processed && timing_analysis?.processing_time
                        ? `${(timing_analysis.scenes_processed / timing_analysis.processing_time * 60).toFixed(1)} scenes/min`
                        : "N/A"
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">Efficiency Rating</span>
                    <Badge variant="outline" className="text-blue-600">
                      {timing_analysis?.average_time_per_scene 
                        ? timing_analysis.average_time_per_scene < 1 ? "Excellent" 
                          : timing_analysis.average_time_per_scene < 3 ? "Good" 
                          : "Standard"
                        : "N/A"
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Summary */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>🏢 Department Summary</CardTitle>
              <CardDescription>Resource allocation and department coordination overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {department_summary?.total_departments_involved || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Departments</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {department_summary?.total_crew_size || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Crew</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {department_summary?.total_estimated_hours?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
              </div>

              {/* Department Insights */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Department Insights</h4>
                <div className="grid gap-4">
                  {department_summary?.most_involved_department && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span className="text-sm">Most Involved Department</span>
                      <Badge variant="outline" className="text-green-600">
                        {department_summary.most_involved_department.charAt(0).toUpperCase() + 
                         department_summary.most_involved_department.slice(1)}
                      </Badge>
                    </div>
                  )}
                  {department_summary?.least_involved_department && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span className="text-sm">Least Involved Department</span>
                      <Badge variant="outline" className="text-gray-600">
                        {department_summary.least_involved_department.charAt(0).toUpperCase() + 
                         department_summary.least_involved_department.slice(1)}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm">Average Crew per Department</span>
                    <Badge variant="outline" className="text-blue-600">
                      {department_summary?.total_crew_size && department_summary?.total_departments_involved
                        ? Math.round(department_summary.total_crew_size / department_summary.total_departments_involved)
                        : 0
                      } crew
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Summary */}
        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>🔄 Processing Summary</CardTitle>
              <CardDescription>Pipeline execution and agent performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Processing Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Processing Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {processing_summary?.timestamp ? new Date(processing_summary.timestamp).toLocaleString() : "Unknown"}
                  </p>
                </div>
                <StatusBadge status={processing_summary?.status || "unknown"} />
              </div>

              {/* Agent Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {processing_summary?.agents_used || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Agents Used</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {processing_summary?.completed_stages || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Stages</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {processing_summary?.total_processing_time || "Unknown"}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>

              {/* Agent Pipeline */}
              <div>
                <h4 className="text-lg font-semibold mb-4">3-Agent Sequential Pipeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-medium">ADK Eighths Calculator</div>
                      <div className="text-sm text-muted-foreground">Industry-standard timing analysis</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-medium">Scene Breakdown Cards</div>
                      <div className="text-sm text-muted-foreground">Production requirements analysis</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-medium">Department Coordinator</div>
                      <div className="text-sm text-muted-foreground">Resource allocation and crew planning</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}