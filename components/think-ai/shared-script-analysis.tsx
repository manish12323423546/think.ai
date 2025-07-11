"use client"

import React, { useState, useEffect } from 'react'
import { History, FileSearch, BarChart2, Users, Database, Loader, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScriptData, type ScriptData } from '@/lib/contexts/script-data-context'
import { useRole } from '@/hooks/use-roles'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoleGate } from '@/components/auth/role-gate'
import { Roles } from '@/types/globals'

// API endpoint constant
const API_URL = 'https://thinkaiback.onrender.com/api'

// Storage keys
const STORAGE_KEYS = {
  SCRIPT_DATA: 'SCRIPT_DATA',
  ONE_LINER_DATA: 'ONE_LINER_DATA',
  CHARACTER_DATA: 'CHARACTER_DATA',
  SCHEDULE_DATA: 'SCHEDULE_DATA',
  BUDGET_DATA: 'BUDGET_DATA',
  STORYBOARD_DATA: 'STORYBOARD_DATA',
}

// Role-specific configurations
const ROLE_CONFIGS = {
  writer: {
    title: 'Script Analysis - Writer Dashboard',
    description: 'Analyze your script structure and character development',
    badge: 'Writer Access - Script Analysis Tools',
    color: 'purple',
    uploadLink: '/dashboard/writer/upload-script',
    allowedTabs: ['timeline', 'scenes', 'technical'],
    readOnly: false
  },
  producer: {
    title: 'Script Analysis - Producer Dashboard',
    description: 'Complete script analysis for production planning',
    badge: 'Producer Access - Full Analysis Suite',
    color: 'blue',
    uploadLink: '/dashboard/producer/upload-script',
    allowedTabs: ['timeline', 'scenes', 'technical', 'departments'],
    readOnly: false
  },
  director: {
    title: 'Script Analysis - Director Dashboard',
    description: 'Creative script analysis and planning',
    badge: 'Director Access - Creative Analysis Tools',
    color: 'green',
    uploadLink: '/dashboard/director/upload-script',
    allowedTabs: ['timeline', 'scenes', 'technical', 'departments'],
    readOnly: false
  },
  storyboard_artist: {
    title: 'Script Analysis - Storyboard Artist Dashboard',
    description: 'Script analysis for visual planning',
    badge: 'Storyboard Artist Access - Visual Planning Analysis',
    color: 'orange',
    uploadLink: '/dashboard/admin/upload-script',
    allowedTabs: ['timeline', 'scenes'],
    readOnly: true
  },
  team_member: {
    title: 'Script Analysis - Team Member Dashboard',
    description: 'Basic script overview and information',
    badge: 'Team Member Access - Read-Only Analysis',
    color: 'gray',
    uploadLink: '/dashboard/admin/upload-script',
    allowedTabs: ['timeline'],
    readOnly: true
  },
  admin: {
    title: 'Script Analysis - Admin Dashboard',
    description: 'Complete script analysis with all features',
    badge: 'Admin Access - Full System Control',
    color: 'red',
    uploadLink: '/dashboard/admin/upload-script',
    allowedTabs: ['timeline', 'scenes', 'technical', 'departments'],
    readOnly: false
  }
}

const LoadingMessage = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Loader className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
    <h3 className="text-xl font-medium mb-2">Loading script analysis...</h3>
    <p className="text-muted-foreground">
      Please wait while we process your script.
    </p>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-xl font-medium mb-2">Error Loading Analysis</h3>
    <p className="text-red-500 mb-4">{message}</p>
  </div>
)

const NoDataMessage = ({ uploadLink }: { uploadLink: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Database className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-xl font-medium mb-2">No script data available</h3>
    <p className="text-muted-foreground mb-4">
      Please upload a script first to view analysis results.
    </p>
    <Button asChild>
      <a href={uploadLink}>Go to Upload</a>
    </Button>
  </div>
)

const TimelineAnalysis = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.parsed_data?.timeline) {
    return <NoDataMessage uploadLink="/dashboard/upload-script" />
  }

  const { timeline } = scriptData.parsed_data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Analysis</CardTitle>
        <CardDescription>Script timing and scene breakdown</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Duration:</span>
                    <span className="font-medium">{timeline.total_duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Scenes:</span>
                    <span className="font-medium">{timeline.scene_breakdown.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Scene Duration:</span>
                    <span className="font-medium">{timeline.average_scene_duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Pages:</span>
                    <span className="font-medium">{timeline.total_pages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h4 className="text-lg font-medium mb-3">Scene Breakdown</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeline.scene_breakdown.map((scene, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">Scene {scene.scene_number}</span>
                        <span className="text-sm text-muted-foreground">
                          {scene.start_time} - {scene.end_time}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{scene.location}</span>
                        <span className="text-purple-600">
                          {scene.characters?.length > 0 
                            ? `${scene.characters.length} characters` 
                            : "No characters"}
                        </span>
                      </div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        Complexity: {scene.technical_complexity} | Setup: {scene.setup_time} min
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="h-60 bg-muted/20 rounded-lg p-4 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Timeline visualization would be displayed here
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SceneAnalysis = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.parsed_data?.scenes) {
    return <NoDataMessage uploadLink="/dashboard/upload-script" />
  }

  const { scenes } = scriptData.parsed_data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scene Analysis</CardTitle>
        <CardDescription>Detailed breakdown of each scene</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {scenes.map((scene, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-lg">Scene {scene.scene_number}</h4>
                  <div className="text-sm text-muted-foreground">
                    {scene.location?.place} - {scene.time}
                  </div>
                </div>
                
                <Badge variant="outline">
                  Complexity: {scene.complexity_score || 1}
                </Badge>
              </div>
              
              <div className="mb-4">
                <p className="text-foreground">
                  {scene.description || 'No description available'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {scene.technical_cues && scene.technical_cues.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Technical Cues:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {scene.technical_cues.map((cue, i) => (
                          <li key={i} className="text-muted-foreground">{cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-muted-foreground mb-1">Characters:</h5>
                    <div className="flex flex-wrap gap-1">
                      {(scene.main_characters || []).map((character, i) => (
                        <Badge key={i} variant="secondary">
                          {character}
                        </Badge>
                      ))}
                      {(!scene.main_characters || scene.main_characters.length === 0) && (
                        <span className="text-muted-foreground text-xs">No characters listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}

const TechnicalRequirements = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.metadata?.global_requirements) {
    return <NoDataMessage uploadLink="/dashboard/upload-script" />
  }

  const { global_requirements } = scriptData.metadata

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Requirements</CardTitle>
        <CardDescription>Equipment, props, and special effects needed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {global_requirements.equipment.map((item, index) => (
                  <li key={index} className="text-muted-foreground">{item}</li>
                ))}
                {global_requirements.equipment.length === 0 && (
                  <li className="text-muted-foreground italic">No equipment specified</li>
                )}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Props</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {global_requirements.props.map((item, index) => (
                  <li key={index} className="text-muted-foreground">{item}</li>
                ))}
                {global_requirements.props.length === 0 && (
                  <li className="text-muted-foreground italic">No props specified</li>
                )}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {global_requirements.special_effects.map((item, index) => (
                  <li key={index} className="text-muted-foreground">{item}</li>
                ))}
                {global_requirements.special_effects.length === 0 && (
                  <li className="text-muted-foreground italic">No special effects specified</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

const DepartmentAnalysis = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.parsed_data?.scenes) {
    return <NoDataMessage uploadLink="/dashboard/upload-script" />
  }

  // Extract department notes from all scenes
  const allDepartments = new Set<string>()
  
  scriptData.parsed_data.scenes.forEach(scene => {
    if (scene.department_notes) {
      Object.keys(scene.department_notes).forEach(dept => {
        allDepartments.add(dept.toUpperCase())
      })
    }
  })
  
  const departments = Array.from(allDepartments)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Analysis</CardTitle>
        <CardDescription>Department-specific requirements and notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {departments.map(dept => (
                  <div key={dept} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="font-medium">{dept}</div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
                
                {departments.length === 0 && (
                  <div className="text-center text-muted-foreground p-4">
                    No department information available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              {scriptData.validation?.validation_report?.technical_validation?.department_conflicts ? (
                <div className="space-y-2">
                  {scriptData.validation.validation_report.technical_validation.department_conflicts.map((conflict, index) => (
                    <Card key={index} className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-3">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium mb-1">Scene {conflict.scene_number} Conflict</div>
                            <p className="text-sm">{conflict.conflict}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {scriptData.validation.validation_report.technical_validation.department_conflicts.length === 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-3 text-center">
                        <p>No department conflicts detected</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-3 text-center">
                    <p>Validation data not available</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

interface SharedScriptAnalysisProps {
  allowedRoles: Roles[]
  requiredPermission: string
}

export function SharedScriptAnalysis({ allowedRoles, requiredPermission }: SharedScriptAnalysisProps) {
  const { role } = useRole()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  
  const { scriptData, updateScriptData } = useScriptData()

  // Get role-specific configuration
  const config = ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS] || ROLE_CONFIGS.team_member

  // Add offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const regenerateAnalysis = async () => {
    if (!scriptData || config.readOnly) {
      toast.error(config.readOnly ? 'Read-only access - regeneration not allowed' : 'No script data available. Please upload a script first.')
      return
    }

    try {
      setIsRegenerating(true)
      setError(null)

      // Make the API call to re-analyze the script
      const response = await fetch(`${API_URL}/script/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: 'Sample script content', // In real implementation, get original content
          validation_level: 'lenient'
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to regenerate analysis')
      }

      // Save to local storage
      localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(result.data))
      
      // Update context with new analysis
      updateScriptData(result.data)
      
      toast.success('Script analysis regenerated successfully!')

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate analysis'
      console.error('Error regenerating analysis:', error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsRegenerating(false)
    }
  }

  useEffect(() => {
    const loadScriptData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (!scriptData) {
          setError('No script data found. Please upload and process a script first.')
        }
      } catch (err) {
        console.error('Error loading script data:', err)
        setError('Failed to load script data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadScriptData()
  }, [scriptData])

  if (isLoading && !scriptData) {
    return <LoadingMessage />
  }

  if (error && !scriptData) {
    return <ErrorMessage message={error} />
  }

  if (!scriptData) {
    return <NoDataMessage uploadLink={config.uploadLink} />
  }

  return (
    <RoleGate roles={allowedRoles}>
      <div className="h-full overflow-y-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`bg-${config.color}-500 text-white p-2 rounded-lg`}>
                <FileSearch className="h-6 w-6" />
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
            
            {/* Show offline warning */}
            {isOffline && (
              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                Offline Mode
              </Badge>
            )}
            
            {scriptData && !config.readOnly && (
              <Button
                onClick={regenerateAnalysis}
                disabled={isRegenerating || isOffline}
                variant="outline"
              >
                {isRegenerating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Analysis
                  </>
                )}
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
        
        {/* Analysis Tabs */}
        <Tabs defaultValue={config.allowedTabs[0]} className="w-full">
          <TabsList className={`grid w-full grid-cols-${config.allowedTabs.length}`}>
            {config.allowedTabs.includes('timeline') && (
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            )}
            {config.allowedTabs.includes('scenes') && (
              <TabsTrigger value="scenes" className="flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                Scene Analysis
              </TabsTrigger>
            )}
            {config.allowedTabs.includes('technical') && (
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Technical
              </TabsTrigger>
            )}
            {config.allowedTabs.includes('departments') && (
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Departments
              </TabsTrigger>
            )}
          </TabsList>
          
          {config.allowedTabs.includes('timeline') && (
            <TabsContent value="timeline" className="mt-6">
              {isRegenerating ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center">
                      <Loader className={`h-8 w-8 animate-spin mx-auto mb-4 text-${config.color}-600`} />
                      <p className="text-muted-foreground">Regenerating analysis...</p>
                    </div>
                  </div>
                  <TimelineAnalysis scriptData={scriptData} />
                </div>
              ) : (
                <TimelineAnalysis scriptData={scriptData} />
              )}
            </TabsContent>
          )}
          
          {config.allowedTabs.includes('scenes') && (
            <TabsContent value="scenes" className="mt-6">
              <SceneAnalysis scriptData={scriptData} />
            </TabsContent>
          )}
          
          {config.allowedTabs.includes('technical') && (
            <TabsContent value="technical" className="mt-6">
              <TechnicalRequirements scriptData={scriptData} />
            </TabsContent>
          )}
          
          {config.allowedTabs.includes('departments') && (
            <TabsContent value="departments" className="mt-6">
              <DepartmentAnalysis scriptData={scriptData} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </RoleGate>
  )
}