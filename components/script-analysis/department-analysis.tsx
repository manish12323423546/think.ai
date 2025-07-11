"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Camera, 
  Volume2, 
  Lightbulb, 
  Palette, 
  Shirt, 
  Zap, 
  Users, 
  Clock, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  CheckCircle
} from 'lucide-react'

interface DepartmentData {
  scenes_requiring_department: Array<{
    scene_number: string
    involvement_level: "basic" | "moderate" | "heavy"
    estimated_hours: number
    complexity: string
    specific_requirements: string[]
  }>
  equipment_needed: string[]
  crew_requirements: {
    base_crew_size: number
    complexity_factor: number
    recommended_roles: string[]
    total_department_hours: number
    crew_efficiency: number
  }
  special_needs: string[]
  scheduling_notes: string[]
  estimated_hours: number
  complexity_breakdown: {
    simple: number
    moderate: number
    complex: number
  }
}

interface DepartmentAnalysisProps {
  departmentAnalysis: {
    camera?: DepartmentData
    sound?: DepartmentData
    lighting?: DepartmentData
    art?: DepartmentData
    wardrobe?: DepartmentData
    special_effects?: DepartmentData
  }
  resourceAllocation?: {
    total_crew_needed: number
    peak_crew_scenes: Array<{
      scene_number: string
      crew_size: number
      estimated_hours: number
    }>
  }
  coordinationRecommendations?: string[]
}

const DepartmentIcon = ({ department }: { department: string }) => {
  const icons = {
    camera: Camera,
    sound: Volume2,
    lighting: Lightbulb,
    art: Palette,
    wardrobe: Shirt,
    special_effects: Zap
  }
  
  const Icon = icons[department as keyof typeof icons] || Users
  return <Icon className="w-5 h-5" />
}

const InvolvementBadge = ({ level }: { level: string }) => {
  const variants = {
    basic: { variant: "outline" as const, color: "text-gray-600" },
    moderate: { variant: "outline" as const, color: "text-blue-600" },
    heavy: { variant: "outline" as const, color: "text-red-600" }
  }
  
  const config = variants[level as keyof typeof variants] || variants.basic
  
  return (
    <Badge variant={config.variant} className={config.color}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  )
}

const DepartmentCard = ({ 
  name, 
  data, 
  isExpanded, 
  onToggle 
}: { 
  name: string
  data: DepartmentData
  isExpanded: boolean
  onToggle: () => void
}) => {
  const totalScenes = data.scenes_requiring_department.length
  const totalHours = data.estimated_hours
  const crewSize = data.crew_requirements.base_crew_size

  return (
    <Card className="border border-border">
      <CardHeader 
        className="cursor-pointer" 
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DepartmentIcon department={name} />
            <div>
              <CardTitle className="text-lg">{name.charAt(0).toUpperCase() + name.slice(1)}</CardTitle>
              <CardDescription>
                {totalScenes} scenes • {totalHours}h • {crewSize} crew
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalScenes > 0 && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{totalScenes}</div>
                <div className="text-xs text-muted-foreground">Scenes</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{totalHours}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{crewSize}</div>
                <div className="text-xs text-muted-foreground">Crew Size</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{data.crew_requirements.crew_efficiency.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Efficiency</div>
              </div>
            </div>

            {/* Complexity Breakdown */}
            {totalScenes > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Scene Complexity</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Simple</span>
                    <span className="text-sm">{data.complexity_breakdown.simple}</span>
                  </div>
                  <Progress 
                    value={(data.complexity_breakdown.simple / totalScenes) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-600">Moderate</span>
                    <span className="text-sm">{data.complexity_breakdown.moderate}</span>
                  </div>
                  <Progress 
                    value={(data.complexity_breakdown.moderate / totalScenes) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Complex</span>
                    <span className="text-sm">{data.complexity_breakdown.complex}</span>
                  </div>
                  <Progress 
                    value={(data.complexity_breakdown.complex / totalScenes) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            )}

            {/* Crew Requirements */}
            <div>
              <h4 className="text-sm font-medium mb-3">Recommended Crew</h4>
              <div className="flex flex-wrap gap-2">
                {data.crew_requirements.recommended_roles.map((role, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Equipment Needed */}
            {data.equipment_needed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Equipment Required</h4>
                <div className="flex flex-wrap gap-2">
                  {data.equipment_needed.map((equipment, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Special Needs */}
            {data.special_needs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Special Requirements</h4>
                <div className="space-y-1">
                  {data.special_needs.map((need, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {need}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scene Involvement - Enhanced */}
            {totalScenes > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Scene Involvement Details</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.scenes_requiring_department.slice(0, 5).map((scene, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Scene {scene.scene_number}</span>
                        <div className="flex items-center gap-2">
                          <InvolvementBadge level={scene.involvement_level} />
                          <span className="text-sm text-muted-foreground">{scene.estimated_hours}h</span>
                        </div>
                      </div>
                      
                      {/* Scene Complexity */}
                      <div className="text-xs text-muted-foreground mb-2">
                        Complexity: {scene.complexity}
                      </div>
                      
                      {/* Specific Requirements - Enhanced */}
                      {scene.specific_requirements && scene.specific_requirements.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Specific Requirements:
                          </div>
                          <div className="space-y-1">
                            {scene.specific_requirements.map((req, reqIndex) => (
                              <div key={reqIndex} className="text-xs bg-blue-50 dark:bg-blue-950/20 p-1.5 rounded text-blue-800 dark:text-blue-200">
                                • {req}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* No requirements indicator */}
                      {(!scene.specific_requirements || scene.specific_requirements.length === 0) && (
                        <div className="text-xs text-muted-foreground italic">
                          Standard {name} department involvement
                        </div>
                      )}
                    </div>
                  ))}
                  {data.scenes_requiring_department.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      +{data.scenes_requiring_department.length - 5} more scenes
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scheduling Notes - Enhanced */}
            {data.scheduling_notes && data.scheduling_notes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Scheduling Notes</h4>
                <div className="space-y-2">
                  {data.scheduling_notes.map((note, index) => (
                    <div key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border-l-2 border-yellow-400">
                      📅 {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function DepartmentAnalysis({ 
  departmentAnalysis, 
  resourceAllocation, 
  coordinationRecommendations 
}: DepartmentAnalysisProps) {
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())

  const toggleDepartment = (dept: string) => {
    const newExpanded = new Set(expandedDepartments)
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept)
    } else {
      newExpanded.add(dept)
    }
    setExpandedDepartments(newExpanded)
  }

  if (!departmentAnalysis || Object.keys(departmentAnalysis).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🏢 Department Analysis</CardTitle>
          <CardDescription>No department analysis available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Upload a script to generate department analysis
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate overall statistics
  const activeDepartments = Object.entries(departmentAnalysis).filter(
    ([_, data]) => data && data.scenes_requiring_department.length > 0
  )
  const totalCrew = Object.values(departmentAnalysis).reduce(
    (sum, data) => sum + (data?.crew_requirements.base_crew_size || 0), 0
  )
  const totalHours = Object.values(departmentAnalysis).reduce(
    (sum, data) => sum + (data?.estimated_hours || 0), 0
  )

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>🏢 Department Overview</CardTitle>
          <CardDescription>Resource allocation and coordination summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{activeDepartments.length}</div>
              <div className="text-sm text-muted-foreground">Active Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalCrew}</div>
              <div className="text-sm text-muted-foreground">Total Crew</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {resourceAllocation?.peak_crew_scenes.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Peak Crew Scenes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="resource-allocation">Resource Allocation</TabsTrigger>
          <TabsTrigger value="coordination">Coordination</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          {Object.entries(departmentAnalysis).map(([deptName, deptData]) => {
            if (!deptData) return null
            
            return (
              <DepartmentCard
                key={deptName}
                name={deptName}
                data={deptData}
                isExpanded={expandedDepartments.has(deptName)}
                onToggle={() => toggleDepartment(deptName)}
              />
            )
          })}
        </TabsContent>

        <TabsContent value="resource-allocation">
          <Card>
            <CardHeader>
              <CardTitle>📊 Resource Allocation</CardTitle>
              <CardDescription>Crew distribution and peak requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Peak Crew Scenes */}
              {resourceAllocation?.peak_crew_scenes && resourceAllocation.peak_crew_scenes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Peak Crew Scenes</h4>
                  <div className="space-y-2">
                    {resourceAllocation.peak_crew_scenes.map((scene, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <span className="font-medium">Scene {scene.scene_number}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {scene.crew_size} crew
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {scene.estimated_hours}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Department Distribution */}
              <div>
                <h4 className="text-sm font-medium mb-3">Department Distribution</h4>
                <div className="space-y-3">
                  {activeDepartments.map(([deptName, deptData]) => {
                    const percentage = totalCrew > 0 ? (deptData.crew_requirements.base_crew_size / totalCrew) * 100 : 0
                    return (
                      <div key={deptName}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize">{deptName}</span>
                          <span className="text-sm">{deptData.crew_requirements.base_crew_size} crew</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coordination">
          <Card>
            <CardHeader>
              <CardTitle>🤝 Coordination Recommendations</CardTitle>
              <CardDescription>Inter-department coordination and workflow optimization</CardDescription>
            </CardHeader>
            <CardContent>
              {coordinationRecommendations && coordinationRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {coordinationRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No coordination recommendations available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}