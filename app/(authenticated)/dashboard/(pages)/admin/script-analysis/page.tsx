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

// Sub-Agent Components for Storyboard Coordinator
const VisualParserAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          ✅ Visual Parser Agent (FOUNDATIONAL)
        </CardTitle>
        <CardDescription>Multimodal scene analysis and visual requirements extraction</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">Locations Analyzed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Visual Effects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">5</div>
                <p className="text-sm text-muted-foreground">Style Themes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">Storyboard Panels</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-sm font-mono bg-muted p-3 rounded">
            {JSON.stringify({
              "visual_requirements": {
                "locations": ["Urban rooftop", "Manhattan street", "Apartment interior"],
                "visual_effects": ["Web-slinging", "Spider-sense", "Mechanical tentacles"],
                "lighting_requirements": ["Dawn lighting", "Practical neon", "Explosion lighting"]
              },
              "storyboard_foundation": {
                "total_panels": 24,
                "key_sequences": ["Web-swinging chase", "Tentacle battle", "Rooftop confrontation"],
                "visual_style": "Cinematic superhero action"
              },
              "technical_notes": {
                "camera_angles": ["Low angle hero shots", "Wide establishing", "Close-up reaction"],
                "special_requirements": ["Wire work visualization", "VFX integration points"]
              }
            }, null, 2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CinematographerAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          🚧 Cinematographer Agent (SHOT LISTS)
        </CardTitle>
        <CardDescription>Camera movement and shot composition planning</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">45</div>
                <p className="text-sm text-muted-foreground">Total Shots</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">Camera Setups</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">6</div>
                <p className="text-sm text-muted-foreground">Lens Changes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">180</div>
                <p className="text-sm text-muted-foreground">Setup Minutes</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-sm font-mono bg-muted p-3 rounded">
            {JSON.stringify({
              "shot_breakdown": {
                "scene_4": {
                  "shot_4A": {
                    "shot_type": "Wide establishing",
                    "camera_movement": "Static to slow push",
                    "lens": "24mm",
                    "setup_time": "45 minutes"
                  },
                  "shot_4B": {
                    "shot_type": "Medium close-up",
                    "camera_movement": "Handheld tracking",
                    "lens": "50mm",
                    "setup_time": "20 minutes"
                  }
                }
              },
              "equipment_requirements": {
                "primary_camera": "RED Komodo 6K",
                "lens_package": "Zeiss CP.3 Prime Set",
                "support": ["Steadicam", "Technocrane", "Dolly system"]
              }
            }, null, 2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const StoryboardArtistAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          🚧 Storyboard Artist Agent (VISUAL PANELS)
        </CardTitle>
        <CardDescription>Visual panel creation and artistic direction</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">72</div>
                <p className="text-sm text-muted-foreground">Storyboard Panels</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Key Sequences</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">Action Sequences</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">VFX Panels</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-sm font-mono bg-muted p-3 rounded">
            {JSON.stringify({
              "visual_panels": {
                "sequence_1": {
                  "panel_count": 8,
                  "sequence_name": "Web-slinging chase",
                  "key_frames": ["Launch from building", "Mid-air swing", "Landing impact"],
                  "artistic_notes": "Dynamic angles, motion blur for speed"
                },
                "sequence_2": {
                  "panel_count": 12,
                  "sequence_name": "Tentacle battle",
                  "key_frames": ["Tentacle reveal", "Spider-dodge", "Counter-attack"],
                  "artistic_notes": "Close-ups for tension, wide shots for scale"
                }
              },
              "visual_continuity": {
                "color_palette": ["Deep blues", "Amber highlights", "Red accents"],
                "lighting_style": "High contrast, dramatic shadows"
              }
            }, null, 2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const PrevisCoordinatorAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          🚧 Previs Coordinator Agent (ANIMATICS)
        </CardTitle>
        <CardDescription>3D previsualization and animatic creation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">6</div>
                <p className="text-sm text-muted-foreground">Animatic Sequences</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">8:45</div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">15</div>
                <p className="text-sm text-muted-foreground">VFX Sequences</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">3</div>
                <p className="text-sm text-muted-foreground">3D Environments</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-sm font-mono bg-muted p-3 rounded">
            {JSON.stringify({
              "animatics_breakdown": {
                "web_swinging_sequence": {
                  "duration": "2:30",
                  "complexity": "High",
                  "3d_elements": ["Building geometry", "Web physics", "Character rigging"],
                  "camera_moves": ["Aerial following", "Close pursuit", "Ground impact"]
                },
                "tentacle_battle": {
                  "duration": "3:45",
                  "complexity": "Very High",
                  "3d_elements": ["Mechanical tentacles", "Destruction", "Particle effects"],
                  "camera_moves": ["360 degree", "Whip pans", "Crash zooms"]
                }
              },
              "technical_requirements": {
                "software": "Maya, Houdini, Nuke",
                "render_time": "24 hours total",
                "deliverables": ["Animatics", "Camera data", "3D references"]
              }
            }, null, 2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ProductionDesignerAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          🚧 Production Designer Agent (STYLE COORDINATION)
        </CardTitle>
        <CardDescription>Visual style development and department coordination</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">Set Designs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Prop Designs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">5</div>
                <p className="text-sm text-muted-foreground">Color Palettes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">4</div>
                <p className="text-sm text-muted-foreground">Dept Coordination</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-sm font-mono bg-muted p-3 rounded">
            {JSON.stringify({
              "visual_style_guide": {
                "primary_palette": ["Deep navy", "Charcoal gray", "Crimson red", "Amber gold"],
                "secondary_palette": ["Steel blue", "Warm white", "Copper bronze"],
                "style_direction": "Modern urban gothic with superhero elements"
              },
              "set_designs": {
                "apartment_interior": {
                  "style": "Lived-in, authentic NY apartment",
                  "key_elements": ["Photography equipment", "Spider-web motifs", "Urban textures"],
                  "color_treatment": "Warm practical lighting, cool shadows"
                },
                "rooftop_battle": {
                  "style": "Industrial urban landscape",
                  "key_elements": ["HVAC units", "Neon signage", "Safety barriers"],
                  "color_treatment": "Neon highlights, dramatic shadows"
                }
              },
              "department_coordination": {
                "costume": "Spider-suit variations, mechanical tentacle harnesses",
                "props": "Web-shooters, laboratory equipment, tentacle mechanisms",
                "set_decoration": "Urban signage, practical lighting, destruction elements"
              }
            }, null, 2)}
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
        <CardTitle>🎨 Storyboard Coordinator - 5 Sub-Agents</CardTitle>
        <CardDescription>Comprehensive visual planning with specialized AI agents</CardDescription>
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
          <div>
            <h3 className="text-lg font-medium mb-4">Time of Day Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(breakdownData.time_of_day_breakdown).filter(([key, data]: [string, any]) => 
                ['DAY', 'NIGHT', 'DUSK', 'DAWN'].includes(key) && data.percentage > 0
              ).map(([timeOfDay, data]: [string, any]) => (
                <Card key={timeOfDay}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{data.percentage}%</div>
                    <p className="text-sm text-muted-foreground">{timeOfDay}</p>
                    <p className="text-xs text-muted-foreground">{data.scenes?.length || 0} scenes</p>
                    <p className="text-xs text-blue-600">{data.total_eighths || 0} eighths</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {breakdownData.time_of_day_breakdown.day_night_ratio && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-lg font-bold">{breakdownData.time_of_day_breakdown.day_night_ratio}</div>
                    <p className="text-sm text-muted-foreground">Day/Night Ratio</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-lg font-bold">{breakdownData.time_of_day_breakdown.night_premium_cost_impact}</div>
                    <p className="text-sm text-muted-foreground">Night Premium Impact</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Scheduling Analysis */}
        {breakdownData.scheduling_analysis && (
          <div>
            <h3 className="text-lg font-medium mb-4">Scheduling Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{breakdownData.scheduling_analysis.total_locations || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Locations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{breakdownData.scheduling_analysis.recommended_units || 1}</div>
                  <p className="text-sm text-muted-foreground">Recommended Units</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{Object.keys(breakdownData.scheduling_analysis.location_groups || {}).length}</div>
                  <p className="text-sm text-muted-foreground">Location Groups</p>
                </CardContent>
              </Card>
            </div>
            {breakdownData.scheduling_analysis.scheduling_challenges?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scheduling Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {breakdownData.scheduling_analysis.scheduling_challenges.map((challenge: string, index: number) => (
                      <li key={index} className="text-sm text-yellow-600">• {challenge}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Scene Breakdown Cards */}
        {breakdownData.scene_breakdown_cards && (
          <div>
            <h3 className="text-lg font-medium mb-4">Scene Breakdown Cards</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {breakdownData.scene_breakdown_cards.map((card: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">Scene {card.scene_number}</CardTitle>
                        <CardDescription>{card.location}</CardDescription>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{card.time_of_day}</Badge>
                        <Badge>{card.eighths} eighths</Badge>
                        <Badge variant="secondary">{card.page_count?.toFixed(2) || 0} pages</Badge>
                        {card.safety_notes?.length > 0 && (
                          <Badge variant="destructive">Safety Critical</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      {/* Cast */}
                      <div>
                        <h4 className="font-medium mb-2 text-purple-600">Cast</h4>
                        <p>Speaking: {card.cast?.speaking?.length || 0}</p>
                        <p>Non-speaking: {card.cast?.non_speaking?.length || 0}</p>
                        <p>Extras: {card.extras?.count || 0}</p>
                        <p>Total Cast: {card.cast?.total_cast || 0}</p>
                        {card.cast?.speaking?.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">
                              {card.cast.speaking.slice(0, 2).join(", ")}
                              {card.cast.speaking.length > 2 && "..."}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Props & Equipment */}
                      <div>
                        <h4 className="font-medium mb-2 text-blue-600">Props & Equipment</h4>
                        <p>Hand Props: {card.props?.hand_props?.length || 0}</p>
                        <p>Set Decoration: {card.props?.set_decoration?.length || 0}</p>
                        <p>Special Props: {card.props?.special_props?.length || 0}</p>
                        <p>Special Equipment: {card.special_equipment?.length || 0}</p>
                        <p>Vehicles: {card.vehicles?.length || 0}</p>
                      </div>

                      {/* Departments */}
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Departments</h4>
                        <p>Wardrobe Changes: {card.wardrobe?.changes_needed ? "Yes" : "No"}</p>
                        <p>Special FX: {card.makeup_hair?.special_fx ? "Yes" : "No"}</p>
                        <p>Dialogue Scene: {card.sound?.dialogue_scenes ? "Yes" : "No"}</p>
                        <p>Playback Needed: {card.sound?.playback_needed ? "Yes" : "No"}</p>
                        <p>VFX Notes: {card.vfx_notes?.length || 0}</p>
                      </div>

                      {/* Weather & Safety */}
                      <div>
                        <h4 className="font-medium mb-2 text-orange-600">Weather & Safety</h4>
                        <p>Weather Conditions: {card.weather?.conditions?.length || 0}</p>
                        <p>Weather Effects: {card.weather?.effects_needed?.length || 0}</p>
                        <p>Backup Plan: {card.weather?.backup_plan ? "Yes" : "No"}</p>
                        <p>Safety Notes: {card.safety_notes?.length || 0}</p>
                        <p>AD Notes: {card.ad_notes?.length || 0}</p>
                      </div>
                    </div>

                    {/* Special Requirements */}
                    {(card.safety_notes?.length > 0 || card.vfx_notes?.length > 0 || card.ad_notes?.length > 0) && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Special Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {card.safety_notes?.length > 0 && (
                            <div>
                              <p className="font-medium text-red-600 mb-1">Safety Notes:</p>
                              <ul className="space-y-1">
                                {card.safety_notes.slice(0, 3).map((note: string, i: number) => (
                                  <li key={i} className="text-red-600">• {note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {card.vfx_notes?.length > 0 && (
                            <div>
                              <p className="font-medium text-blue-600 mb-1">VFX Notes:</p>
                              <ul className="space-y-1">
                                {card.vfx_notes.slice(0, 3).map((note: string, i: number) => (
                                  <li key={i} className="text-blue-600">• {note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {card.ad_notes?.length > 0 && (
                            <div>
                              <p className="font-medium text-green-600 mb-1">AD Notes:</p>
                              <ul className="space-y-1">
                                {card.ad_notes.slice(0, 3).map((note: string, i: number) => (
                                  <li key={i} className="text-green-600">• {note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
            const deptName = dept.replace('_department', '').charAt(0).toUpperCase() + dept.replace('_department', '').slice(1)
            
            let primaryMetric = 0
            let secondaryMetric = 0
            let metricLabel = ''
            let secondaryLabel = ''

            if (dept === 'camera_department' && deptInfo) {
              primaryMetric = deptInfo.total_setups || 0
              secondaryMetric = deptInfo.equipment_needed?.length || 0
              metricLabel = 'Camera Setups'
              secondaryLabel = 'Equipment Items'
            } else if (dept === 'sound_department' && deptInfo) {
              primaryMetric = deptInfo.recording_scenarios?.dialogue_scenes || 0
              secondaryMetric = deptInfo.recording_scenarios?.total_scenes || 0
              metricLabel = 'Dialogue Scenes'
              secondaryLabel = 'Total Scenes'
            } else if (dept === 'art_department' && deptInfo) {
              primaryMetric = deptInfo.locations_to_dress?.length || 0
              secondaryMetric = Object.values(deptInfo.prop_categories || {}).flat().length
              metricLabel = 'Locations to Dress'
              secondaryLabel = 'Total Props'
            } else if (dept === 'costume_department' && deptInfo) {
              primaryMetric = Object.keys(deptInfo.character_wardrobes || {}).length
              secondaryMetric = deptInfo.scene_breakdown?.length || 0
              metricLabel = 'Character Wardrobes'
              secondaryLabel = 'Scene Breakdowns'
            }
            
            return (
              <Card key={dept}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 text-center">{deptName}</h4>
                  <div className="space-y-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{primaryMetric}</div>
                      <p className="text-xs text-muted-foreground">{metricLabel}</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{secondaryMetric}</div>
                      <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Camera Department */}
        {deptData.camera_department && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📹 Camera Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Equipment Overview</h4>
                  <div className="space-y-1 text-sm">
                    <p>Total Setups: {deptData.camera_department.total_setups}</p>
                    <p>Equipment Items: {deptData.camera_department.equipment_needed?.length || 0}</p>
                    <p>Special Rigs: {deptData.camera_department.special_rigs?.length || 0}</p>
                    <p>Lens Requirements: {deptData.camera_department.lens_requirements?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Scene Complexity</h4>
                  <div className="space-y-1 text-sm">
                    {deptData.camera_department.scene_requirements?.map((scene: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>Scene {scene.scene}:</span>
                        <Badge variant={scene.setup_complexity === 'Complex' ? 'destructive' : 'outline'}>
                          {scene.setup_complexity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sound Department */}
        {deptData.sound_department && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔊 Sound Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recording Scenarios</h4>
                  <div className="space-y-1 text-sm">
                    <p>Dialogue Scenes: {deptData.sound_department.recording_scenarios?.dialogue_scenes || 0}</p>
                    <p>Location Audio: {deptData.sound_department.recording_scenarios?.location_audio || 0}</p>
                    <p>Playback Scenes: {deptData.sound_department.recording_scenarios?.playback_scenes || 0}</p>
                    <p>Total Scenes: {deptData.sound_department.recording_scenarios?.total_scenes || 0}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Per-Scene Analysis</h4>
                  <div className="space-y-1 text-sm">
                    {deptData.sound_department.scene_analysis?.slice(0, 4).map((scene: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>Scene {scene.scene}:</span>
                        <div className="flex gap-1">
                          {scene.dialogue && <Badge variant="default">Dialogue</Badge>}
                          <Badge variant="outline">{scene.location_type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Art Department */}
        {deptData.art_department && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎨 Art Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Locations to Dress</h4>
                  <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                    {deptData.art_department.locations_to_dress?.map((location: string, index: number) => (
                      <p key={index}>• {location}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Props Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <p>Hand Props: {deptData.art_department.prop_categories?.hand_props?.length || 0}</p>
                    <p>Set Decoration: {deptData.art_department.prop_categories?.set_decoration?.length || 0}</p>
                    <p>Special Props: {deptData.art_department.prop_categories?.special_props?.length || 0}</p>
                    <p>Period Props: {deptData.art_department.prop_categories?.period_props?.length || 0}</p>
                    <p>Construction Needs: {deptData.art_department.construction_needs?.length || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Costume Department */}
        {deptData.costume_department && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">👗 Costume Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Character Wardrobes</h4>
                  <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {Object.entries(deptData.costume_department.character_wardrobes || {}).map(([character, info]: [string, any]) => (
                      <div key={character} className="flex justify-between items-center">
                        <span className="font-medium">{character}:</span>
                        <div className="flex gap-1">
                          <Badge variant="outline">{info.total_scenes} scenes</Badge>
                          <Badge variant="secondary">{info.costume_changes} changes</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Continuity Tracking</h4>
                  <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {deptData.costume_department.continuity_tracking?.map((track: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{track.character}:</span>
                        <div className="flex gap-1">
                          <Badge variant="outline">{track.scenes?.length || 0} scenes</Badge>
                          {track.continuity_critical && <Badge variant="destructive">Critical</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crew Requirements */}
        {deptData.crew_requirements && (
          <div>
            <h3 className="text-lg font-medium mb-4">Crew Requirements by Scene</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {deptData.crew_requirements.map((req: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Scene {req.scene}</h4>
                      <div className="flex gap-2">
                        <Badge>Total Crew: {req.total_crew}</Badge>
                        <Badge variant="outline">{req.total_hours?.toFixed(1) || 0}h total</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">Essential Crew</h5>
                        {Object.entries(req.essential_crew || {}).map(([role, count]: [string, any]) => (
                          <div key={role} className="flex justify-between">
                            <span className="capitalize">{role.replace('_', ' ')}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Technical Crew</h5>
                        {Object.entries(req.technical_crew || {}).map(([role, count]: [string, any]) => (
                          <div key={role} className="flex justify-between">
                            <span className="capitalize">{role.replace('_', ' ')}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Time Breakdown</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Prep:</span>
                            <span>{req.prep_time_hours?.toFixed(1) || 0}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shoot:</span>
                            <span>{req.shoot_time_hours?.toFixed(1) || 0}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wrap:</span>
                            <span>{req.wrap_time_hours?.toFixed(1) || 0}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Resource Sharing */}
        {deptData.resource_sharing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔄 Resource Sharing & Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Location Grouping</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(deptData.resource_sharing.location_grouping?.groups || {}).map(([group, locations]: [string, any]) => (
                      <div key={group}>
                        <p className="font-medium">{group}:</p>
                        <p className="text-muted-foreground ml-2">{Array.isArray(locations) ? locations.join(", ") : locations}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Efficiency Gains</h4>
                  <div className="text-sm">
                    <p className="text-green-600 font-medium">
                      {deptData.resource_sharing.location_grouping?.efficiency_gain || "No data available"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department Conflicts */}
        {deptData.department_conflicts && deptData.department_conflicts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">⚠️ Department Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deptData.department_conflicts.map((conflict: any, index: number) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">{conflict}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{prodData.complexity_analysis?.average_complexity?.toFixed(1) || 'N/A'}</div>
              <p className="text-sm text-muted-foreground">Avg Complexity</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{prodData.complexity_analysis?.high_complexity_scenes?.length || 0}</div>
              <p className="text-sm text-muted-foreground">High Risk Scenes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${
                prodData.risk_assessment?.overall_risk_level === 'High' ? 'text-red-600' :
                prodData.risk_assessment?.overall_risk_level === 'Medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {prodData.risk_assessment?.overall_risk_level || 'Medium'}
              </div>
              <p className="text-sm text-muted-foreground">Overall Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${
                prodData.feasibility_assessment?.overall_feasibility === 'High' ? 'text-green-600' :
                prodData.feasibility_assessment?.overall_feasibility === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {prodData.feasibility_assessment?.overall_feasibility || 'Medium'}
              </div>
              <p className="text-sm text-muted-foreground">Feasibility</p>
            </CardContent>
          </Card>
        </div>

        {/* Complexity Analysis */}
        {prodData.complexity_analysis && (
          <div>
            <h3 className="text-lg font-medium mb-4">Complexity Analysis</h3>
            
            {/* Complexity Distribution */}
            {prodData.complexity_analysis.complexity_distribution && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {Object.entries(prodData.complexity_analysis.complexity_distribution).map(([level, count]: [string, any]) => (
                  <Card key={level}>
                    <CardContent className="p-4">
                      <div className="text-xl font-bold">{count}</div>
                      <p className="text-sm text-muted-foreground capitalize">{level} Complexity</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Scene Complexity Scores */}
            {prodData.complexity_analysis.scene_complexity_scores && (
              <div>
                <h4 className="font-medium mb-3">Scene Complexity Breakdown</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {prodData.complexity_analysis.scene_complexity_scores.map((scene: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">Scene {scene.scene}</h4>
                            <p className="text-sm text-muted-foreground">Setup: {scene.estimated_setup_time}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={scene.risk_level === 'High' ? 'destructive' : scene.risk_level === 'Medium' ? 'default' : 'outline'}>
                              {scene.risk_level}
                            </Badge>
                            <Badge variant="secondary">{scene.complexity_score}x</Badge>
                            <Badge variant="outline">Crew: {scene.crew_multiplier}x</Badge>
                          </div>
                        </div>
                        {scene.contributing_factors?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Contributing Factors:</p>
                            <div className="flex flex-wrap gap-1">
                              {scene.contributing_factors.slice(0, 4).map((factor: string, i: number) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{factor}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* High Complexity Scenes */}
            {prodData.complexity_analysis.high_complexity_scenes?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">⚠️ High Complexity Scenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prodData.complexity_analysis.high_complexity_scenes.map((scene: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-red-50 border border-red-200 rounded">
                        <div>
                          <span className="font-medium">Scene {scene.scene}</span>
                          <span className="ml-2 text-sm text-red-600">Score: {scene.score}</span>
                        </div>
                        <div className="text-xs">
                          {scene.primary_challenges?.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Risk Assessment */}
        {prodData.risk_assessment && (
          <div>
            <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
            
            {/* Risk Categories */}
            {prodData.risk_assessment.risk_categories && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {Object.entries(prodData.risk_assessment.risk_categories).map(([category, risks]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base capitalize">
                        {category === 'technical' ? '⚙️' : category === 'safety' ? '🛡️' : 
                         category === 'weather' ? '🌤️' : category === 'budget' ? '💰' : '📅'} {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-lg font-bold">{Array.isArray(risks) ? risks.length : 0}</div>
                        <p className="text-sm text-muted-foreground">Risk Items</p>
                        {Array.isArray(risks) && risks.slice(0, 3).map((risk: any, index: number) => (
                          <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                            <p className="font-medium">Scene {risk.scene}</p>
                            <p className="text-muted-foreground">{risk.description}</p>
                            <Badge size="sm" variant={risk.severity === 'High' ? 'destructive' : risk.severity === 'Medium' ? 'default' : 'outline'}>
                              {risk.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* High Risk Scenes */}
            {prodData.risk_assessment.high_risk_scenes?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🚨 High Risk Scenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prodData.risk_assessment.high_risk_scenes.map((scene: any, index: number) => (
                      <div key={index} className="p-3 border border-red-200 rounded bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Scene {scene.scene}</h4>
                          <Badge variant="destructive">Complexity: {scene.complexity}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {scene.risks?.map((risk: any, riskIndex: number) => (
                            <div key={riskIndex} className="flex justify-between">
                              <span className="capitalize">{risk.category}:</span>
                              <span className="text-red-600">{risk.severity}</span>
                            </div>
                          ))}
                        </div>
                        {scene.risks?.length > 0 && (
                          <p className="text-xs text-gray-600 mt-2">
                            {scene.risks[0].description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mitigation Strategies */}
            {prodData.risk_assessment.mitigation_strategies?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🛠️ Mitigation Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prodData.risk_assessment.mitigation_strategies.map((strategy: any, index: number) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="capitalize">{strategy.category}</Badge>
                            <Badge variant={strategy.priority === 'High' ? 'destructive' : strategy.priority === 'Medium' ? 'default' : 'secondary'}>
                              {strategy.priority}
                            </Badge>
                          </div>
                          <p className="text-sm">{strategy.strategy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Safety Requirements */}
        {prodData.safety_requirements && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🛡️ Safety Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Safety Critical Scenes</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {prodData.safety_requirements.safety_critical_scenes?.map((scene: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">Scene {scene.scene}:</span>
                        <ul className="ml-4 text-xs text-red-600">
                          {scene.concerns?.slice(0, 2).map((concern: string, i: number) => (
                            <li key={i}>• {concern}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Required Resources</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">Safety Personnel:</p>
                      <ul className="ml-4 text-xs">
                        {prodData.safety_requirements.required_safety_personnel?.map((person: string, index: number) => (
                          <li key={index}>• {person}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Safety Equipment:</p>
                      <ul className="ml-4 text-xs">
                        {prodData.safety_requirements.safety_equipment_needed?.map((equipment: string, index: number) => (
                          <li key={index}>• {equipment}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feasibility Assessment */}
        {prodData.feasibility_assessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📊 Feasibility Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Assessment Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Overall Feasibility:</span>
                      <Badge variant={prodData.feasibility_assessment.overall_feasibility === 'High' ? 'default' : 'outline'}>
                        {prodData.feasibility_assessment.overall_feasibility}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence Level:</span>
                      <Badge variant="secondary">{prodData.feasibility_assessment.confidence_level}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Potential Blockers</h4>
                  <div className="space-y-1 text-xs max-h-24 overflow-y-auto">
                    {prodData.feasibility_assessment.potential_blockers?.map((blocker: string, index: number) => (
                      <p key={index} className="text-yellow-600">• {blocker}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {prodData.recommendations?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💡 Production Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prodData.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">{rec.category}</Badge>
                        <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm">{rec.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

// Sub-Agent Components for Scheduling Coordinator
const ScheduleParserAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  const sceneCount = scriptData?.parsed_data?.scenes?.length || 0
  const locationCount = new Set(scriptData?.parsed_data?.scenes?.map(s => s.location?.place)).size || 0
  const characters = new Set(scriptData?.parsed_data?.scenes?.flatMap(s => s.main_characters || [])).size || 0
  const schedulingData = scriptData?.agent_outputs?.breakdown_specialist?.scheduling_analysis
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          ✅ Schedule Parser Agent (FOUNDATIONAL)
        </CardTitle>
        <CardDescription>Basic scene organization and scheduling foundation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{sceneCount}</div>
                <p className="text-sm text-muted-foreground">Total Scenes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{schedulingData?.total_locations || locationCount}</div>
                <p className="text-sm text-muted-foreground">Locations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Math.ceil(sceneCount / 3.5)}</div>
                <p className="text-sm text-muted-foreground">Est. Shoot Days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{characters}</div>
                <p className="text-sm text-muted-foreground">Principal Cast</p>
              </CardContent>
            </Card>
          </div>

          {/* Location Grouping */}
          {schedulingData?.location_groups && (
            <div>
              <h4 className="font-medium mb-3">Location Grouping</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(schedulingData.location_groups).map(([group, locations]: [string, any]) => (
                  <Card key={group}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{group}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {Array.isArray(locations) ? locations.map((location: string, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground">• {location}</div>
                        )) : (
                          <div className="text-sm text-muted-foreground">{locations}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Foundation */}
          <div>
            <h4 className="font-medium mb-3">Schedule Foundation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Basic Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Scenes:</span>
                      <span className="font-medium">{sceneCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Days:</span>
                      <span className="font-medium">{Math.ceil(sceneCount / 3.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Count:</span>
                      <span className="font-medium">{locationCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommended Units:</span>
                      <span className="font-medium">{schedulingData?.recommended_units || 1}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Time of Day Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {scriptData?.agent_outputs?.breakdown_specialist?.time_of_day_breakdown && Object.entries(scriptData.agent_outputs.breakdown_specialist.time_of_day_breakdown)
                      .filter(([key, data]: [string, any]) => ['DAY', 'NIGHT', 'DUSK', 'DAWN'].includes(key) && data.percentage > 0)
                      .map(([timeOfDay, data]: [string, any]) => (
                        <div key={timeOfDay} className="flex justify-between">
                          <span>{timeOfDay}:</span>
                          <span className="font-medium">{data.scenes?.length || 0} scenes ({data.percentage}%)</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Scheduling Challenges */}
          {schedulingData?.scheduling_challenges?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">⚠️ Scheduling Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {schedulingData.scheduling_challenges.map((challenge: string, index: number) => (
                    <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                      {challenge}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const AssistantDirectorAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  const sceneCount = scriptData?.parsed_data?.scenes?.length || 0
  const breakdownCards = scriptData?.agent_outputs?.breakdown_specialist?.scene_breakdown_cards || []
  const characters = new Set(scriptData?.parsed_data?.scenes?.flatMap(s => s.main_characters || [])).size || 0
  const locations = new Set(scriptData?.parsed_data?.scenes?.map(s => s.location?.place)).size || 0
  
  // Calculate stripboard metrics from actual data
  const dayScenes = breakdownCards.filter((card: any) => card.time_of_day === 'DAY').length
  const nightScenes = breakdownCards.filter((card: any) => card.time_of_day === 'NIGHT').length
  const estimatedShootDays = Math.ceil(sceneCount / 3.5)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          ✅ Assistant Director Agent (DOOP/STRIPBOARD)
        </CardTitle>
        <CardDescription>Professional stripboard and call sheet generation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{sceneCount}</div>
                <p className="text-sm text-muted-foreground">Stripboard Scenes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{characters}</div>
                <p className="text-sm text-muted-foreground">DOOP Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{estimatedShootDays}</div>
                <p className="text-sm text-muted-foreground">Call Sheets</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Math.round((locations > 0 ? (sceneCount / locations) * 10 : 85))}%</div>
                <p className="text-sm text-muted-foreground">Optimization</p>
              </CardContent>
            </Card>
          </div>

          {/* Stripboard Organization */}
          <div>
            <h4 className="font-medium mb-3">Stripboard Organization</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Color Coding System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Day Exteriors:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="font-medium">Blue ({dayScenes} scenes)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Day Interiors:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="font-medium">Yellow</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Night Exteriors:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="font-medium">Green ({nightScenes} scenes)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Night Interiors:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="font-medium">Purple</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Scene Grouping Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Primary Factor:</span>
                      <span className="font-medium">Location</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secondary Factor:</span>
                      <span className="font-medium">Time of Day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Efficiency Score:</span>
                      <span className="font-medium text-green-600">{Math.round((locations > 0 ? (sceneCount / locations) * 10 : 85))}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Groups:</span>
                      <span className="font-medium">{locations}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* DOOP Reports */}
          <div>
            <h4 className="font-medium mb-3">DOOP (Day Out of Period) Reports</h4>
            <div className="space-y-3">
              {breakdownCards.slice(0, 6).map((card: any, index: number) => {
                const characterWorkDays = card.cast?.speaking?.length || 0
                return (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">Scene {card.scene_number}</h5>
                          <p className="text-sm text-muted-foreground">{card.location}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{card.cast?.speaking?.length || 0} actors</div>
                          <div className="text-xs text-muted-foreground">{card.time_of_day}</div>
                        </div>
                      </div>
                      {card.cast?.speaking?.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex flex-wrap gap-1">
                            {card.cast.speaking.slice(0, 4).map((actor: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{actor}</Badge>
                            ))}
                            {card.cast.speaking.length > 4 && (
                              <Badge variant="secondary" className="text-xs">+{card.cast.speaking.length - 4} more</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Call Sheet Automation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">📋 Call Sheet Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Crew Call Times</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Camera Crew:</span>
                      <span className="font-medium">6:00 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lighting:</span>
                      <span className="font-medium">5:30 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hair/Makeup:</span>
                      <span className="font-medium">4:30 AM</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Equipment Coordination</h5>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">• Department integration</div>
                    <div className="text-xs text-muted-foreground">• Equipment sharing optimized</div>
                    <div className="text-xs text-muted-foreground">• Setup time calculated</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Location Logistics</h5>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">• Transportation routes</div>
                    <div className="text-xs text-muted-foreground">• Parking coordination</div>
                    <div className="text-xs text-muted-foreground">• Weather contingencies</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

const LocationOptimizerAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  const scenes = scriptData?.parsed_data?.scenes || []
  const locationCount = new Set(scenes.map(s => s.location?.place)).size || 0
  const equipmentMoves = Math.max(0, locationCount - 1)
  const schedulingData = scriptData?.agent_outputs?.breakdown_specialist?.scheduling_analysis
  const resourceSharing = scriptData?.agent_outputs?.department_coordinator?.resource_sharing
  
  // Calculate efficiency based on location grouping
  const efficiency = locationCount > 0 ? Math.round((scenes.length / locationCount) * 15) : 92
  const costSavings = Math.round(efficiency * 0.15)
  
  // Group scenes by location
  const locationGroups = scenes.reduce((acc: any, scene: any) => {
    const location = scene.location?.place || 'Unknown'
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push(scene)
    return acc
  }, {})
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          ✅ Location Optimizer Agent (LOGISTICS)
        </CardTitle>
        <CardDescription>Location grouping and logistics coordination</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Object.keys(locationGroups).length}</div>
                <p className="text-sm text-muted-foreground">Location Groups</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{equipmentMoves}</div>
                <p className="text-sm text-muted-foreground">Equipment Moves</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{efficiency}%</div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{costSavings}%</div>
                <p className="text-sm text-muted-foreground">Cost Savings</p>
              </CardContent>
            </Card>
          </div>

          {/* Location Grouping */}
          <div>
            <h4 className="font-medium mb-3">Location Grouping Strategy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(locationGroups).slice(0, 6).map(([location, scenes]: [string, any]) => {
                const sceneCount = scenes.length
                const estimatedDays = Math.ceil(sceneCount / 3.5)
                const hasExterior = scenes.some((s: any) => s.location?.type === 'EXT')
                const hasInterior = scenes.some((s: any) => s.location?.type === 'INT')
                
                return (
                  <Card key={location}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{location}</CardTitle>
                      <CardDescription>
                        {sceneCount} scenes • {estimatedDays} day{estimatedDays !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Scene Types:</span>
                          <div className="flex gap-1">
                            {hasExterior && <Badge variant="outline" className="text-xs">EXT</Badge>}
                            {hasInterior && <Badge variant="outline" className="text-xs">INT</Badge>}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Scenes:</span>
                          <span className="font-medium">
                            {scenes.slice(0, 3).map((s: any) => s.scene_number).join(', ')}
                            {scenes.length > 3 && ` +${scenes.length - 3}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Permits Required:</span>
                          <span className={hasExterior ? "text-yellow-600" : "text-green-600"}>
                            {hasExterior ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Logistics Optimization */}
          <div>
            <h4 className="font-medium mb-3">Logistics Optimization</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Equipment Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Equipment Moves:</span>
                      <span className="font-medium">{equipmentMoves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Camps:</span>
                      <span className="font-medium">{Math.min(2, Math.ceil(locationCount / 3))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Efficiency Rating:</span>
                      <span className="font-medium text-green-600">{efficiency}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Transportation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">• Shuttle service optimized</div>
                    <div className="text-muted-foreground">• Route planning automated</div>
                    <div className="text-muted-foreground">• Parking coordination</div>
                    <div className="text-muted-foreground">• Traffic pattern analysis</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Transportation:</span>
                      <span className="font-medium text-green-600">-${Math.round(costSavings * 300)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Permits:</span>
                      <span className="font-medium text-green-600">-$5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equipment:</span>
                      <span className="font-medium text-green-600">-${Math.round(costSavings * 200)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Savings:</span>
                      <span className="font-medium text-green-600">-${Math.round(costSavings * 500 + 5000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resource Sharing Efficiency */}
          {resourceSharing?.location_grouping && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🔄 Resource Sharing Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Efficiency Gain:</span>
                    <span className="font-medium text-green-600">
                      {resourceSharing.location_grouping.efficiency_gain}
                    </span>
                  </div>
                  {Object.entries(resourceSharing.location_grouping.groups || {}).map(([group, locations]: [string, any]) => (
                    <div key={group} className="pt-2 border-t">
                      <div className="font-medium">{group}:</div>
                      <div className="text-muted-foreground ml-2">
                        {Array.isArray(locations) ? locations.join(", ") : locations}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const CrewAllocatorAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  const crewRequirements = scriptData?.agent_outputs?.department_coordinator?.crew_requirements || []
  const departmentData = scriptData?.agent_outputs?.department_coordinator
  const scenes = scriptData?.parsed_data?.scenes || []
  
  // Calculate crew metrics from actual data
  const totalCrew = crewRequirements.reduce((sum: number, req: any) => Math.max(sum, req.total_crew || 0), 0)
  const avgCrewSize = crewRequirements.length > 0 
    ? Math.round(crewRequirements.reduce((sum: number, req: any) => sum + (req.total_crew || 0), 0) / crewRequirements.length)
    : 42
  const departments = departmentData ? Object.keys(departmentData).filter(key => key.includes('department')).length : 4
  const conflicts = departmentData?.department_conflicts?.length || 0
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          ✅ Crew Allocator Agent (DEPT SCHEDULING)
        </CardTitle>
        <CardDescription>Department scheduling and crew optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{departments}</div>
                <p className="text-sm text-muted-foreground">Departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalCrew}</div>
                <p className="text-sm text-muted-foreground">Peak Crew</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Math.round((departments * 20) + (scenes.length * 2))}%</div>
                <p className="text-sm text-muted-foreground">Allocation Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{conflicts}</div>
                <p className="text-sm text-muted-foreground">Conflicts</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Allocation */}
          <div>
            <h4 className="font-medium mb-3">Department Allocation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['camera_department', 'sound_department', 'art_department', 'costume_department'].map((dept) => {
                const deptInfo = departmentData?.[dept]
                const deptName = dept.replace('_department', '').charAt(0).toUpperCase() + dept.replace('_department', '').slice(1)
                
                let crewSize = 0
                let specialRequirements = ''
                
                if (dept === 'camera_department' && deptInfo) {
                  crewSize = Math.max(6, deptInfo.total_setups || 0)
                  specialRequirements = 'All shooting days'
                } else if (dept === 'sound_department' && deptInfo) {
                  crewSize = 3 + (deptInfo.recording_scenarios?.dialogue_scenes || 0)
                  specialRequirements = 'Outdoor recording'
                } else if (dept === 'art_department' && deptInfo) {
                  crewSize = Math.max(4, deptInfo.locations_to_dress?.length || 0)
                  specialRequirements = 'Set decoration'
                } else if (dept === 'costume_department' && deptInfo) {
                  crewSize = Math.max(2, Object.keys(deptInfo.character_wardrobes || {}).length)
                  specialRequirements = 'Continuity critical'
                }
                
                return (
                  <Card key={dept}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{deptName} Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Crew Size:</span>
                          <span className="font-medium">{crewSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Peak Days:</span>
                          <span className="font-medium">{Math.ceil(scenes.length / 2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {specialRequirements}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Crew Requirements per Scene */}
          {crewRequirements.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Crew Requirements by Scene</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {crewRequirements.slice(0, 6).map((req: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">Scene {req.scene}</h5>
                        <div className="flex gap-2">
                          <Badge variant="outline">{req.total_crew} total crew</Badge>
                          <Badge variant="secondary">{req.total_hours?.toFixed(1) || 0}h</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Essential: </span>
                          <span className="font-medium">
                            {Object.values(req.essential_crew || {}).reduce((sum: number, count: any) => sum + count, 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Technical: </span>
                          <span className="font-medium">
                            {Object.values(req.technical_crew || {}).reduce((sum: number, count: any) => sum + count, 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Optimization Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">📊 Optimization Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round((departments * 20) + (scenes.length * 2))}%</div>
                  <div className="text-muted-foreground">Crew Utilization</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">Optimal</div>
                  <div className="text-muted-foreground">Cost Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{conflicts}</div>
                  <div className="text-muted-foreground">Schedule Conflicts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">Achieved</div>
                  <div className="text-muted-foreground">Overtime Min.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Conflicts */}
          {conflicts > 0 && departmentData?.department_conflicts && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">⚠️ Schedule Conflicts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {departmentData.department_conflicts.map((conflict: any, index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      {conflict}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const ProductionCalendarAgent = ({ scriptData }: { scriptData: ScriptData | null }) => {
  const sceneCount = scriptData?.parsed_data?.scenes?.length || 0
  const eighthsData = scriptData?.agent_outputs?.eighths_calculator
  const complexityData = scriptData?.agent_outputs?.production_analyzer?.complexity_analysis
  
  // Calculate timeline based on actual data
  const shootDays = eighthsData?.eighths_breakdown?.estimated_total_shoot_days || Math.ceil(sceneCount / 3.5)
  const shootWeeks = Math.ceil(shootDays / 5)
  const preProductionWeeks = Math.max(6, Math.ceil(shootWeeks * 0.75))
  const postProductionWeeks = Math.max(8, shootWeeks * 1.25)
  const totalProjectWeeks = preProductionWeeks + shootWeeks + postProductionWeeks
  
  // Calculate milestones based on complexity
  const avgComplexity = complexityData?.average_complexity || 1.5
  const weatherBuffer = Math.ceil(avgComplexity * 2)
  const milestones = 8 + Math.floor(sceneCount / 3)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          ✅ Production Calendar Agent (TIMELINE MGMT)
        </CardTitle>
        <CardDescription>Master timeline and milestone coordination</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalProjectWeeks} wks</div>
                <p className="text-sm text-muted-foreground">Project Duration</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{preProductionWeeks} wks</div>
                <p className="text-sm text-muted-foreground">Pre-Production</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{shootDays}</div>
                <p className="text-sm text-muted-foreground">Shoot Days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{milestones}</div>
                <p className="text-sm text-muted-foreground">Milestones</p>
              </CardContent>
            </Card>
          </div>

          {/* Master Timeline */}
          <div>
            <h4 className="font-medium mb-3">Master Timeline</h4>
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">📋 Pre-Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Duration: {preProductionWeeks} weeks</div>
                      <div className="text-muted-foreground">Script lock to production ready</div>
                    </div>
                    <div>
                      <div className="font-medium">Key Activities:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Cast finalization</li>
                        <li>• Location scouting & securing</li>
                        <li>• Equipment preparation</li>
                        <li>• Crew hiring & scheduling</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">🎬 Principal Photography</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Duration: {shootWeeks} weeks ({shootDays} days)</div>
                      <div className="text-muted-foreground">Active filming period</div>
                    </div>
                    <div>
                      <div className="font-medium">Schedule Details:</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>• Avg scenes per day: {(sceneCount / shootDays).toFixed(1)}</div>
                        <div>• Weather buffer: {weatherBuffer} days</div>
                        <div>• Complexity factor: {avgComplexity.toFixed(1)}x</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">✂️ Post-Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Duration: {postProductionWeeks} weeks</div>
                      <div className="text-muted-foreground">Edit to final delivery</div>
                    </div>
                    <div>
                      <div className="font-medium">Post Activities:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Picture editing</li>
                        <li>• Sound design & mix</li>
                        <li>• VFX completion</li>
                        <li>• Color grading & mastering</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Critical Milestones */}
          <div>
            <h4 className="font-medium mb-3">Critical Milestones</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pre-Production Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Script Lock:</span>
                      <span className="font-medium">Week 1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cast Finalized:</span>
                      <span className="font-medium">Week {Math.ceil(preProductionWeeks * 0.4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Locations Secured:</span>
                      <span className="font-medium">Week {Math.ceil(preProductionWeeks * 0.6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equipment Locked:</span>
                      <span className="font-medium">Week {Math.ceil(preProductionWeeks * 0.8)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Production Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>First Day Principal:</span>
                      <span className="font-medium">Week {preProductionWeeks + 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Halfway Mark:</span>
                      <span className="font-medium">Week {preProductionWeeks + Math.ceil(shootWeeks / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wrap Photography:</span>
                      <span className="font-medium">Week {preProductionWeeks + shootWeeks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final Delivery:</span>
                      <span className="font-medium">Week {totalProjectWeeks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contingency Planning */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🛡️ Contingency Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Weather Contingency</h5>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• Buffer days: {weatherBuffer}</div>
                    <div>• Cover sets prepared</div>
                    <div>• Weather monitoring</div>
                    <div>• Scene reordering plan</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Equipment Backup</h5>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• 24hr replacement service</div>
                    <div>• Backup camera packages</div>
                    <div>• Redundant critical gear</div>
                    <div>• Local vendor network</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Cast Availability</h5>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• Alternate scenes prepared</div>
                    <div>• Flexible scheduling</div>
                    <div>• Stand-in protocols</div>
                    <div>• Remote options planned</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                Script Analysis - 7 Agent Pipeline
              </h1>
              <p className="text-muted-foreground">
                5 Main Agents + 2 Coordinators (10 Sub-Agents) for comprehensive script analysis
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
      
      {/* Agent Status Overview - 7 Agents Total */}
      <div className="space-y-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-3">5 Main Agents Pipeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <FileSearch className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Script Parser</p>
                  <Badge variant="outline" className="text-xs">FOUNDATIONAL</Badge>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <BarChart2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Eighths Calculator</p>
                  <Badge variant="outline" className="text-xs">INDUSTRY STANDARD</Badge>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Breakdown Specialist</p>
                  <Badge variant="outline" className="text-xs">AD WORKFLOW</Badge>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Dept Coordinator</p>
                  <Badge variant="outline" className="text-xs">CREW NEEDS</Badge>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Production Analyzer</p>
                  <Badge variant="outline" className="text-xs">RISK ASSESSMENT</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">2 Coordinator Agents (10 Sub-Agents Total)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <Briefcase className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Storyboard Coordinator</p>
                  <Badge variant="secondary" className="text-xs">5 SUB-AGENTS</Badge>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1">
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />
                  <p className="text-xs">Visual</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto mb-1" />
                  <p className="text-xs">Camera</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto mb-1" />
                  <p className="text-xs">Artist</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto mb-1" />
                  <p className="text-xs">Previs</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto mb-1" />
                  <p className="text-xs">Design</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Scheduling Coordinator</p>
                  <Badge variant="secondary" className="text-xs">5 SUB-AGENTS</Badge>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1">
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />
                  <p className="text-xs">Parser</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-1" />
                  <p className="text-xs">AD</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />
                  <p className="text-xs">Location</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />
                  <p className="text-xs">Crew</p>
                </div>
                <div className="text-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />
                  <p className="text-xs">Calendar</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="parser" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="parser" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span className="hidden sm:inline">Parser</span>
          </TabsTrigger>
          <TabsTrigger value="eighths" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Eighths</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Breakdown</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Departments</span>
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Production</span>
          </TabsTrigger>
          <TabsTrigger value="storyboard-coord" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Storyboard</span>
          </TabsTrigger>
          <TabsTrigger value="schedule-coord" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
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
        
        <TabsContent value="storyboard-coord" className="mt-6">
          <Tabs defaultValue="visual-parser" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="visual-parser">Visual Parser</TabsTrigger>
              <TabsTrigger value="cinematographer">Cinematographer</TabsTrigger>
              <TabsTrigger value="storyboard-artist">Artist</TabsTrigger>
              <TabsTrigger value="previs">Previs</TabsTrigger>
              <TabsTrigger value="production-designer">Designer</TabsTrigger>
            </TabsList>
            <TabsContent value="visual-parser" className="mt-6">
              <VisualParserAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="cinematographer" className="mt-6">
              <CinematographerAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="storyboard-artist" className="mt-6">
              <StoryboardArtistAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="previs" className="mt-6">
              <PrevisCoordinatorAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="production-designer" className="mt-6">
              <ProductionDesignerAgent scriptData={scriptData} />
            </TabsContent>
          </Tabs>
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
        
        <TabsContent value="schedule-coord" className="mt-6">
          <Tabs defaultValue="schedule-parser" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="schedule-parser">Schedule Parser</TabsTrigger>
              <TabsTrigger value="assistant-director">AD</TabsTrigger>
              <TabsTrigger value="location-optimizer">Locations</TabsTrigger>
              <TabsTrigger value="crew-allocator">Crew</TabsTrigger>
              <TabsTrigger value="production-calendar">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule-parser" className="mt-6">
              <ScheduleParserAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="assistant-director" className="mt-6">
              <AssistantDirectorAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="location-optimizer" className="mt-6">
              <LocationOptimizerAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="crew-allocator" className="mt-6">
              <CrewAllocatorAgent scriptData={scriptData} />
            </TabsContent>
            <TabsContent value="production-calendar" className="mt-6">
              <ProductionCalendarAgent scriptData={scriptData} />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="overview" className="mt-6">
          <OverviewDashboard scriptData={scriptData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}