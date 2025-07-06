"use client"

import React, { useState, useEffect } from 'react'
import { History, FileSearch, BarChart2, Users, Database, Loader, AlertCircle, RefreshCw, Clock, Calendar, Cog, Shield, Cpu, MapPin, UserCheck, Navigation, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScriptData, type ScriptData } from '@/lib/contexts/script-data-context'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// API endpoint constant
const API_URL = 'http://localhost:8000/api'

// Storage keys
const STORAGE_KEYS = {
  SCRIPT_DATA: 'SCRIPT_DATA',
  ONE_LINER_DATA: 'ONE_LINER_DATA',
  CHARACTER_DATA: 'CHARACTER_DATA',
  SCHEDULE_DATA: 'SCHEDULE_DATA',
  BUDGET_DATA: 'BUDGET_DATA',
  STORYBOARD_DATA: 'STORYBOARD_DATA',
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

const NoDataMessage = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Database className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-xl font-medium mb-2">No script data available</h3>
    <p className="text-muted-foreground mb-4">
      Please upload a script first to view analysis results.
    </p>
    <Button asChild>
      <a href="/dashboard/admin/upload-script">Go to Upload</a>
    </Button>
  </div>
)

const ParserResults = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.parsed_data?.scenes) {
    return <NoDataMessage />
  }

  const { scenes, timeline } = scriptData.parsed_data

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎬 Script Parser Agent Results</CardTitle>
        <CardDescription>Foundational script parsing and structure analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{scenes.length}</div>
              <p className="text-sm text-muted-foreground">Total Scenes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {new Set(scenes.flatMap(s => s.main_characters || [])).size}
              </div>
              <p className="text-sm text-muted-foreground">Unique Characters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {new Set(scenes.map(s => s.location?.place)).size}
              </div>
              <p className="text-sm text-muted-foreground">Locations</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="text-lg font-medium mb-3">Scene Structure</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scenes.map((scene, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">Scene {scene.scene_number}</span>
                    <Badge variant="outline">{scene.location?.type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {scene.location?.place} - {scene.time}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {scene.dialogues?.length || 0} dialogue blocks
                    </span>
                    <span className="text-purple-600">
                      {scene.main_characters?.length || 0} characters
                    </span>
                  </div>
                  {scene.technical_cues?.length > 0 && (
                    <div className="text-xs mt-1 text-blue-600">
                      {scene.technical_cues.length} technical cues
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


const EighthsAnalysis = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.agent_outputs?.eighths_calculator) {
    return <NoDataMessage />
  }

  const eighthsData = scriptData.agent_outputs.eighths_calculator
  const breakdownData = eighthsData.eighths_breakdown || {}
  const standards = eighthsData.industry_standards || {}

  const sceneEighths = Object.entries(breakdownData)
    .filter(([key]) => key.startsWith('scene_'))
    .map(([key, data]: [string, any]) => ({
      scene: key.replace('scene_', ''),
      ...data
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>✅ Eighths Calculator Agent (INDUSTRY STANDARD)</CardTitle>
        <CardDescription>Professional eighths calculation and time estimation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry Standards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{standards.eighths_per_page || 8}</div>
              <p className="text-sm text-muted-foreground">Eighths per Page</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{standards.minutes_per_eighth || 9}</div>
              <p className="text-sm text-muted-foreground">Minutes per Eighth</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{standards.eighths_per_day || 60}</div>
              <p className="text-sm text-muted-foreground">Eighths per Day</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{standards.base_crew_hours || 12}</div>
              <p className="text-sm text-muted-foreground">Base Crew Hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Total Script Eighths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{breakdownData.total_script_eighths || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated {breakdownData.estimated_total_shoot_days || 0} shoot days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Average Complexity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sceneEighths.length > 0 ? 
                  (sceneEighths.reduce((acc, s) => acc + (s.complexity_factor || 1), 0) / sceneEighths.length).toFixed(1) 
                  : '0'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Complexity factor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Total Setup Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sceneEighths.reduce((acc, s) => acc + (s.setup_time || 0), 0).toFixed(1)}h
              </div>
              <p className="text-sm text-muted-foreground mt-1">Estimated setup</p>
            </CardContent>
          </Card>
        </div>

        {/* Scene Eighths Breakdown */}
        <div>
          <h3 className="text-lg font-medium mb-4">Scene-by-Scene Breakdown</h3>
          <div className="space-y-3">
            {sceneEighths.map((scene) => (
              <Card key={scene.scene}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">Scene {scene.scene}</h4>
                        <Badge variant="outline">{scene.eighths} eighths</Badge>
                        <Badge variant="secondary">
                          {scene.page_count?.toFixed(2) || 0} pages
                        </Badge>
                        <Badge variant={scene.complexity_factor > 1.5 ? "destructive" : "default"}>
                          {scene.complexity_factor}x complexity
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Base Time:</span>
                          <p className="font-medium">{scene.estimated_shoot_time}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual Time:</span>
                          <p className="font-medium">{scene.actual_time_estimate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Setup:</span>
                          <p className="font-medium">{scene.setup_time || 0}h</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Wrap:</span>
                          <p className="font-medium">{scene.wrap_time || 0}h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const StoryboardCoordinatorView = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.agent_outputs?.storyboard_coordinator) {
    return <NoDataMessage />
  }

  const storyboardData = scriptData.agent_outputs.storyboard_coordinator

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎨 Agent 6: Storyboard Coordinator</CardTitle>
        <CardDescription>5 Sub-Agents: 1 Operational + 4 To Be Implemented</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <FileSearch className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium">VisualParserAgent</p>
              <Badge variant="default" className="text-xs mt-1">✅ FOUNDATIONAL</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
              <p className="text-xs text-blue-600 mt-1">Superior multimodal capabilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <Navigation className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium">CinematographerAgent</p>
              <Badge variant="secondary" className="text-xs mt-1">🚧 SHOT LISTS</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
              <p className="text-xs text-purple-600 mt-1">Visual composition planning</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <Briefcase className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium">StoryboardArtistAgent</p>
              <Badge variant="secondary" className="text-xs mt-1">🚧 VISUAL PANELS</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
              <p className="text-xs text-green-600 mt-1">Native visual generation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium">PrevisCoordinatorAgent</p>
              <Badge variant="secondary" className="text-xs mt-1">🚧 ANIMATICS</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
              <p className="text-xs text-orange-600 mt-1">Video processing capabilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <Cog className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm font-medium">ProductionDesignerAgent</p>
              <Badge variant="secondary" className="text-xs mt-1">🚧 STYLE COORDINATION</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
              <p className="text-xs text-red-600 mt-1">Visual style development</p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Outputs */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Agent Outputs</h3>
          
          {/* VisualParserAgent Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                ✅ VisualParserAgent (FOUNDATIONAL) - Currently Operational
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "visual_requirements": {
                    "locations": ["Urban alley", "Office building"],
                    "visual_effects": ["Rain enhancement", "Neon lighting"]
                  },
                  "basic_storyboards": [{
                    "scene_number": 1,
                    "panels": [{"shot_type": "Wide establishing shot", "camera_angle": "Eye level"}]
                  }],
                  "visual_style": {"color_palette": ["Deep blues", "Amber highlights"]}
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* CinematographerAgent Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                🚧 CinematographerAgent (SHOT LISTS) - NEEDS IMPLEMENTATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "shot_list": {
                    "scene_3": {
                      "shot_3A": {
                        "scene_number": "3",
                        "shot_type": "Wide establishing shot",
                        "camera_angle": "Eye level",
                        "lens": "24mm",
                        "estimated_setup": "30 minutes"
                      }
                    }
                  },
                  "camera_requirements": {
                    "primary_camera": "RED Komodo",
                    "lens_package": "Zeiss CP.3 Prime Set"
                  },
                  "technical_tests": {"low_light_performance": "Test needed for night exteriors"}
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* StoryboardArtistAgent Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                🚧 StoryboardArtistAgent (VISUAL PANELS) - NEEDS IMPLEMENTATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "storyboard_panels": {
                    "scene_1": {
                      "panel_1": {
                        "shot_type": "Wide establishing shot",
                        "description": "Rain-soaked alley with neon reflections",
                        "lighting": "Atmospheric neon and street lighting",
                        "mood": "Noir, mysterious, foreboding"
                      }
                    }
                  },
                  "visual_continuity": {
                    "color_consistency": "Maintain blue/amber palette",
                    "lighting_continuity": "Practical neon as key source"
                  }
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* PrevisCoordinatorAgent Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                🚧 PrevisCoordinatorAgent (ANIMATICS) - NEEDS IMPLEMENTATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "animatics": {
                    "chase_sequence": {
                      "duration": "3:45",
                      "shot_count": 23,
                      "camera_moves": ["Drone establishing", "Car interior tracking"]
                    }
                  },
                  "concept_visualization": {
                    "key_moments": ["Detective's revelation", "Final confrontation"],
                    "visual_references": ["Blade Runner 2049 color palette"]
                  }
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* ProductionDesignerAgent Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                🚧 ProductionDesignerAgent (STYLE COORDINATION) - NEEDS IMPLEMENTATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "visual_style_guide": {
                    "color_palette": {
                      "primary": ["Deep blues", "Charcoal grays", "Amber highlights"],
                      "forbidden": ["Bright reds", "Saturated greens"]
                    }
                  },
                  "department_coordination": {
                    "set_decoration": ["Period-appropriate signage", "Practical neon"],
                    "costume_integration": ["Dark, muted colors"]
                  },
                  "construction_requirements": {
                    "built_sets": ["Police station interior", "Crime boss office"]
                  }
                }, null, 2)}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

const SceneBreakdownAnalysis = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.agent_outputs?.breakdown_specialist) {
    return <NoDataMessage />
  }

  const breakdownData = scriptData.agent_outputs.breakdown_specialist

  return (
    <Card>
      <CardHeader>
        <CardTitle>✅ Breakdown Specialist Agent (AD WORKFLOW)</CardTitle>
        <CardDescription>Professional scene breakdown cards and scheduling analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time of Day Summary */}
        {breakdownData.time_of_day_breakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(breakdownData.time_of_day_breakdown).filter(([key, data]: [string, any]) => 
              ['DAY', 'NIGHT', 'DUSK', 'DAWN'].includes(key) && data.percentage > 0
            ).map(([timeOfDay, data]: [string, any]) => (
              <Card key={timeOfDay}>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{data.percentage}%</div>
                  <p className="text-sm text-muted-foreground">{timeOfDay}</p>
                  <p className="text-xs text-muted-foreground">{data.scenes.length} scenes</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Scene Breakdown Cards */}
        {breakdownData.scene_breakdown_cards && (
          <div>
            <h3 className="text-lg font-medium mb-4">Scene Breakdown Cards</h3>
            <div className="space-y-4">
              {breakdownData.scene_breakdown_cards.slice(0, 5).map((card: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Scene {card.scene_number}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{card.time_of_day}</Badge>
                        <Badge>{card.eighths} eighths</Badge>
                      </div>
                    </div>
                    <CardDescription>{card.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Cast</h4>
                        <p>Speaking: {card.cast?.speaking?.length || 0}</p>
                        <p>Non-speaking: {card.cast?.non_speaking?.length || 0}</p>
                        <p>Extras: {card.extras?.count || 0}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Technical</h4>
                        <p>Equipment: {card.special_equipment?.length || 0} items</p>
                        <p>Vehicles: {card.vehicles?.length || 0}</p>
                        <p>Page Count: {card.page_count?.toFixed(2) || 0}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Departments</h4>
                        <p>Props: {Object.values(card.props || {}).flat().length} items</p>
                        <p>Weather: {card.weather?.effects_needed?.length || 0} effects</p>
                        {card.safety_notes?.length > 0 && (
                          <p className="text-yellow-600">Safety: {card.safety_notes.length} concerns</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const DepartmentPlanning = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.agent_outputs?.department_coordinator) {
    return <NoDataMessage />
  }

  const deptData = scriptData.agent_outputs.department_coordinator

  return (
    <Card>
      <CardHeader>
        <CardTitle>✅ Department Coordinator Agent (CREW NEEDS)</CardTitle>
        <CardDescription>Department coordination and crew requirements analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Department Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['camera_department', 'sound_department', 'art_department', 'costume_department'].map(dept => {
            const deptInfo = deptData[dept]
            const deptName = dept.replace('_department', '').toUpperCase()
            
            return (
              <Card key={dept}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{deptName}</h4>
                  {deptInfo && (
                    <div className="space-y-1 text-sm">
                      {deptInfo.equipment_needed && (
                        <p>Equipment: {deptInfo.equipment_needed.length} items</p>
                      )}
                      {deptInfo.scene_requirements && (
                        <p>Scenes: {deptInfo.scene_requirements.length}</p>
                      )}
                      {deptInfo.recording_scenarios && (
                        <p>Recording: {deptInfo.recording_scenarios.dialogue_scenes} dialogue scenes</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Crew Requirements */}
        {deptData.crew_requirements && (
          <div>
            <h3 className="text-lg font-medium mb-4">Crew Requirements by Scene</h3>
            <div className="space-y-3">
              {deptData.crew_requirements.slice(0, 3).map((req: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Scene {req.scene}</h4>
                      <div className="flex gap-2">
                        <Badge>Total Crew: {req.total_crew}</Badge>
                        <Badge variant="outline">{req.total_hours.toFixed(1)}h total</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">Essential Crew</h5>
                        {Object.entries(req.essential_crew).map(([role, count]) => (
                          <div key={role} className="flex justify-between">
                            <span className="capitalize">{role.replace('_', ' ')}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Technical Crew</h5>
                        {Object.entries(req.technical_crew).map(([role, count]) => (
                          <div key={role} className="flex justify-between">
                            <span className="capitalize">{role.replace('_', ' ')}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const ProductionAnalysis = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData?.agent_outputs?.production_analyzer) {
    return <NoDataMessage />
  }

  const prodData = scriptData.agent_outputs.production_analyzer

  return (
    <Card>
      <CardHeader>
        <CardTitle>✅ Production Analyzer Agent (RISK ASSESSMENT)</CardTitle>
        <CardDescription>Complexity scoring, risk assessment, and production analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Complexity Overview */}
        {prodData.complexity_analysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{prodData.complexity_analysis.average_complexity}</div>
                <p className="text-sm text-muted-foreground">Avg Complexity</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{prodData.complexity_analysis.high_complexity_scenes?.length || 0}</div>
                <p className="text-sm text-muted-foreground">High Complexity</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{prodData.risk_assessment?.overall_risk_level || 'Medium'}</div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{prodData.feasibility_assessment?.overall_feasibility || 'Feasible'}</div>
                <p className="text-sm text-muted-foreground">Feasibility</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Risk Assessment */}
        {prodData.risk_assessment && (
          <div>
            <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">High Risk Scenes</CardTitle>
                </CardHeader>
                <CardContent>
                  {prodData.risk_assessment.high_risk_scenes?.slice(0, 5).map((scene: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span>Scene {scene.scene}</span>
                      <Badge variant={scene.complexity >= 8 ? "destructive" : "secondary"}>
                        {scene.complexity}/10
                      </Badge>
                    </div>
                  )) || <p className="text-muted-foreground">No high-risk scenes identified</p>}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(prodData.risk_assessment.risk_categories || {}).map(([category, risks]: [string, any]) => (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline">{Array.isArray(risks) ? risks.length : 0}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {prodData.recommendations && (
          <div>
            <h3 className="text-lg font-medium mb-4">Production Recommendations</h3>
            <div className="space-y-2">
              {prodData.recommendations.map((rec: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{rec.category}</h4>
                        <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                      </div>
                      <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const OverviewDashboard = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData) {
    return <NoDataMessage />
  }

  const agentStatus = scriptData.ui_metadata?.agent_status || {}
  const statistics = scriptData.statistics || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 5-Agent Pipeline Overview</CardTitle>
        <CardDescription>Comprehensive summary from all specialized agents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Status */}
        <div>
          <h3 className="text-lg font-medium mb-4">Agent Processing Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(agentStatus).map(([agent, success]: [string, any]) => (
              <Card key={agent}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium capitalize">
                      {agent.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {success ? 'Completed' : 'Failed'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Statistics */}
        <div>
          <h3 className="text-lg font-medium mb-4">Production Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{statistics.total_scenes || 0}</div>
                <p className="text-sm text-muted-foreground">Total Scenes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{statistics.eighths_summary?.total_eighths || 0}</div>
                <p className="text-sm text-muted-foreground">Total Eighths</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{statistics.eighths_summary?.estimated_days || 0}</div>
                <p className="text-sm text-muted-foreground">Shoot Days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{statistics.crew_summary?.average_crew_size || 0}</div>
                <p className="text-sm text-muted-foreground">Avg Crew Size</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Processing Details */}
        {scriptData.processing_status && (
          <div>
            <h3 className="text-lg font-medium mb-4">Processing Details</h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pipeline Duration:</span>
                    <span>{scriptData.processing_status.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Stages:</span>
                    <span>{scriptData.processing_status.completed_stages?.length || 0}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Stage:</span>
                    <span className="capitalize">{scriptData.processing_status.current_stage || 'N/A'}</span>
                  </div>
                  {scriptData.processing_status.errors?.length > 0 && (
                    <div className="text-red-600">
                      Errors: {scriptData.processing_status.errors.length}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const SchedulingCoordinator = ({ scriptData }: { scriptData: ScriptData | null }) => {
  if (!scriptData) {
    return <NoDataMessage />
  }

  // Mock scheduling data structure based on our new agents
  const schedulingData = {
    schedule_parser: {
      total_scenes: scriptData.parsed_data?.scenes?.length || 0,
      location_count: new Set(scriptData.parsed_data?.scenes?.map(s => s.location?.place)).size || 0,
      cast_requirements: {
        principals: 8,
        day_players: 15
      },
      estimated_days: Math.ceil((scriptData.parsed_data?.scenes?.length || 0) / 3.5)
    },
    assistant_director: {
      stripboard_scenes: scriptData.parsed_data?.scenes?.length || 0,
      doop_reports: new Set(scriptData.parsed_data?.scenes?.flatMap(s => s.main_characters || [])).size || 0,
      call_sheets_generated: Math.ceil((scriptData.parsed_data?.scenes?.length || 0) / 3.5),
      optimization_score: 85
    },
    location_optimizer: {
      location_groups: new Set(scriptData.parsed_data?.scenes?.map(s => s.location?.place)).size || 0,
      equipment_moves: Math.max(0, (new Set(scriptData.parsed_data?.scenes?.map(s => s.location?.place)).size || 0) - 1),
      logistics_efficiency: 92,
      cost_savings: 15
    },
    crew_allocator: {
      departments: 8,
      total_crew_size: 18,
      optimal_allocation: 95,
      schedule_conflicts: 2
    },
    production_calendar: {
      project_duration: "18 weeks",
      pre_production: "6 weeks",
      principal_photography: "5 weeks",
      post_production: "10 weeks",
      critical_milestones: 12
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Scheduling Coordinator - 5 Sub-Agents</CardTitle>
        <CardDescription>Advanced scheduling optimization with specialized AI agents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <FileSearch className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Schedule Parser</p>
              <Badge variant="outline" className="text-xs mt-1">FOUNDATIONAL</Badge>
              <p className="text-xs text-muted-foreground mt-1">GPT-4.1 mini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <UserCheck className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Assistant Director</p>
              <Badge variant="outline" className="text-xs mt-1">DOOP/STRIPBOARD</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium">Location Optimizer</p>
              <Badge variant="outline" className="text-xs mt-1">LOGISTICS</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium">Crew Allocator</p>
              <Badge variant="outline" className="text-xs mt-1">DEPT SCHEDULING</Badge>
              <p className="text-xs text-muted-foreground mt-1">GPT-4.1 mini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <Calendar className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm font-medium">Production Calendar</p>
              <Badge variant="outline" className="text-xs mt-1">TIMELINE MGMT</Badge>
              <p className="text-xs text-muted-foreground mt-1">Gemini 2.5 Flash</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{schedulingData.schedule_parser.total_scenes}</div>
              <p className="text-sm text-muted-foreground">Total Scenes</p>
              <p className="text-xs text-blue-600">{schedulingData.schedule_parser.estimated_days} shoot days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{schedulingData.schedule_parser.location_count}</div>
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="text-xs text-orange-600">{schedulingData.location_optimizer.equipment_moves} equipment moves</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{schedulingData.crew_allocator.total_crew_size}</div>
              <p className="text-sm text-muted-foreground">Total Crew</p>
              <p className="text-xs text-green-600">{schedulingData.crew_allocator.departments} departments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{schedulingData.production_calendar.project_duration}</div>
              <p className="text-sm text-muted-foreground">Project Duration</p>
              <p className="text-xs text-red-600">{schedulingData.production_calendar.critical_milestones} milestones</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Agent Outputs */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Agent Outputs</h3>
          
          {/* Schedule Parser Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                Schedule Parser Agent Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "scheduling_elements": {
                    "total_scenes": schedulingData.schedule_parser.total_scenes,
                    "location_count": schedulingData.schedule_parser.location_count,
                    "cast_requirements": schedulingData.schedule_parser.cast_requirements
                  },
                  "basic_schedule": [{"day": 1, "date": "2024-03-15", "location": "Downtown Office"}],
                  "crew_allocation": {"director": "All shooting days"}
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* Assistant Director Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Assistant Director Agent Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "stripboard": {
                    "scene_3": {
                      "color_code": "blue",
                      "scene_number": "3",
                      "location": "Office Building - Interior",
                      "time": "DAY",
                      "pages": "2 1/8",
                      "cast": ["JOHN_DOE", "SARAH_JONES"],
                      "special_equipment": ["Steadicam"]
                    }
                  },
                  "doop_reports": {
                    "JOHN_DOE": {
                      "work_days": [1, 2, 3, 5, 6, 8, 9, 12, 15, 16, 18, 20],
                      "weekly_layout": {"week_1": {"mon": "Work", "tue": "Work", "wed": "Travel"}}
                    }
                  },
                  "call_sheets": {
                    "day_1": {
                      "date": "March 15, 2024",
                      "scenes": ["3A", "3B", "4A"],
                      "cast_call_times": {"JOHN_DOE": "07:00"}
                    }
                  }
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* Location Optimizer Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Optimizer Agent Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "location_grouping": {
                    "downtown_office": {"scenes": [3, 7, 12], "estimated_days": 2},
                    "warehouse_district": {"scenes": [1, 8, 15], "estimated_days": 3}
                  },
                  "logistics_planning": {
                    "equipment_moves": [{"from": "Office", "to": "Warehouse", "time": "2 hours", "cost": "$1,200"}],
                    "crew_transportation": {"shuttle_required": true}
                  },
                  "permit_requirements": {
                    "downtown_office": ["Interior shooting permit", "Parking permits"],
                    "street_scenes": ["City filming permit", "Police coordination"]
                  }
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* Crew Allocator Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Crew Allocator Agent Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "department_schedules": {
                    "camera": {
                      "day_1": {"crew_size": 4, "special_equipment": ["Steadicam"], "prep_time": "2 hours"}
                    },
                    "sound": {
                      "day_1": {"crew_size": 2, "challenges": ["Office ambient noise"]}
                    },
                    "lighting": {
                      "day_1": {"crew_size": 3, "setup": "Natural window light + LED panels"}
                    }
                  },
                  "crew_availability": {
                    "conflicts": [],
                    "recommendations": ["Gaffer available for extended days"]
                  }
                }, null, 2)}
              </div>
            </CardContent>
          </Card>

          {/* Production Calendar Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Production Calendar Agent Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-muted p-3 rounded">
                {JSON.stringify({
                  "master_timeline": {
                    "pre_production": {"start": "Feb 1", "end": "Mar 10", "duration": "6 weeks"},
                    "principal_photography": {"start": "Mar 15", "end": "Apr 20", "duration": "5 weeks"}
                  },
                  "critical_milestones": {
                    "script_lock": "Jan 15",
                    "cast_finalized": "Feb 20",
                    "locations_secured": "Mar 1"
                  },
                  "contingency_planning": {
                    "weather_delays": {"buffer_days": 3, "alternative_scenes": [2, 6, 10]}
                  }
                }, null, 2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div>
          <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Schedule Optimization</span>
                  <Badge variant="outline">{schedulingData.assistant_director.optimization_score}%</Badge>
                </div>
                <Progress value={schedulingData.assistant_director.optimization_score} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Logistics Efficiency</span>
                  <Badge variant="outline">{schedulingData.location_optimizer.logistics_efficiency}%</Badge>
                </div>
                <Progress value={schedulingData.location_optimizer.logistics_efficiency} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Crew Allocation</span>
                  <Badge variant="outline">{schedulingData.crew_allocator.optimal_allocation}%</Badge>
                </div>
                <Progress value={schedulingData.crew_allocator.optimal_allocation} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ScriptAnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  
  const { scriptData, updateScriptData } = useScriptData()

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
    if (!scriptData) {
      toast.error('No script data available. Please upload a script first.')
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
    return <NoDataMessage />
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Script Analysis
              </h1>
              <p className="text-muted-foreground">
                Analyze your script for technical requirements, scene breakdowns, and more.
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
          
          {scriptData && (
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
          Script Analysis Dashboard
        </Badge>
      </div>
      
      {/* Agent Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Script Parser</p>
              <Badge variant="outline" className="text-xs">FOUNDATIONAL</Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Eighths Calculator</p>
              <Badge variant="outline" className="text-xs">INDUSTRY STANDARD</Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Breakdown Specialist</p>
              <Badge variant="outline" className="text-xs">AD WORKFLOW</Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Dept Coordinator</p>
              <Badge variant="outline" className="text-xs">CREW NEEDS</Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Production Analyzer</p>
              <Badge variant="outline" className="text-xs">RISK ASSESSMENT</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="parser" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="parser" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            Parser Results
          </TabsTrigger>
          <TabsTrigger value="eighths" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Eighths Analysis
          </TabsTrigger>
          <TabsTrigger value="storyboard" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Storyboard
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scene Breakdown
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Dept Planning
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Production Analysis
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="parser" className="mt-6">
          {isRegenerating ? (
            <div className="relative">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-muted-foreground">Regenerating analysis...</p>
                </div>
              </div>
              <ParserResults scriptData={scriptData} />
            </div>
          ) : (
            <ParserResults scriptData={scriptData} />
          )}
        </TabsContent>
        
        <TabsContent value="eighths" className="mt-6">
          <EighthsAnalysis scriptData={scriptData} />
        </TabsContent>
        
        <TabsContent value="storyboard" className="mt-6">
          <StoryboardCoordinatorView scriptData={scriptData} />
        </TabsContent>
        
        <TabsContent value="breakdown" className="mt-6">
          <SceneBreakdownAnalysis scriptData={scriptData} />
        </TabsContent>
        
        <TabsContent value="departments" className="mt-6">
          <DepartmentPlanning scriptData={scriptData} />
        </TabsContent>
        
        <TabsContent value="production" className="mt-6">
          <ProductionAnalysis scriptData={scriptData} />
        </TabsContent>
        
        <TabsContent value="scheduling" className="mt-6">
          <SchedulingCoordinator scriptData={scriptData} />
        </TabsContent>
        
        <TabsContent value="overview" className="mt-6">
          <OverviewDashboard scriptData={scriptData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}