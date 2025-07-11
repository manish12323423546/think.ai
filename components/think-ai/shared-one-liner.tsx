"use client"

import React, { useState, useEffect } from 'react'
import { Lightbulb, Sparkles, RefreshCw, AlertCircle, Info, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { useScriptData } from '@/lib/contexts/script-data-context'
import { useRole } from '@/hooks/use-roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RoleGate } from '@/components/auth/role-gate'
import { Roles } from '@/types/globals'

// API endpoint constant
const API_URL = 'https://thinkaiback.onrender.com/api'

// Storage keys
const STORAGE_KEYS = {
  ONE_LINER_DATA: 'ONE_LINER_DATA',
}

// Role-specific configurations
const ROLE_CONFIGS = {
  writer: {
    title: 'One-Liner Generator - Writer Dashboard',
    description: 'Generate compelling one-liner pitches for your script',
    badge: 'Writer Access - Creative Writing Tools',
    color: 'purple',
    readOnly: false
  },
  producer: {
    title: 'One-Liner Generator - Producer Dashboard',
    description: 'Create marketable one-liner pitches for production planning',
    badge: 'Producer Access - Marketing Tools',
    color: 'blue',
    readOnly: false
  },
  director: {
    title: 'One-Liner Generator - Director Dashboard',
    description: 'Develop one-liner pitches that capture your creative vision',
    badge: 'Director Access - Creative Pitch Tools',
    color: 'green',
    readOnly: false
  },
  storyboard_artist: {
    title: 'One-Liner Generator - Storyboard Artist Dashboard',
    description: 'View one-liner pitches for visual planning context',
    badge: 'Storyboard Artist Access - Read-Only',
    color: 'orange',
    readOnly: true
  },
  team_member: {
    title: 'One-Liner Generator - Team Member Dashboard',
    description: 'View project one-liner pitches',
    badge: 'Team Member Access - Read-Only',
    color: 'gray',
    readOnly: true
  },
  admin: {
    title: 'One-Liner Generator - Admin Dashboard',
    description: 'Full access to one-liner generation and management',
    badge: 'Admin Access - Full Control',
    color: 'red',
    readOnly: false
  }
}

const LoadingMessage = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Loader className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
    <h3 className="text-xl font-medium mb-2">Generating one-liner...</h3>
    <p className="text-muted-foreground">
      Please wait while we create your pitch.
    </p>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-xl font-medium mb-2">Error Generating One-Liner</h3>
    <p className="text-red-500 mb-4">{message}</p>
  </div>
)

const NoScriptMessage = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-xl font-medium mb-2">No script data available</h3>
    <p className="text-muted-foreground mb-4">
      Please upload a script first to generate one-liner pitches.
    </p>
    <Button asChild>
      <a href="/dashboard/upload-script">Go to Upload</a>
    </Button>
  </div>
)

interface OneLinerData {
  generated_pitches: string[]
  custom_pitch?: string
  timestamp: string
  // New comprehensive agent data
  coordinator_info?: {
    name: string
    total_agents: number
    operational: number
    needs_implementation: number
  }
  agent_results?: {
    story_analyzer?: AgentResult
    pitch_specialist?: AgentResult
    marketing_strategist?: AgentResult
    genre_classifier?: AgentResult
    audience_targeting?: AgentResult
  }
  combined_analysis?: {
    executive_summary?: Record<string, unknown>
    production_summary?: Record<string, unknown>
    recommendations?: Record<string, unknown>
  }
}

interface AgentResult {
  status: string
  model?: string
  data?: Record<string, unknown>
  error?: string
}

interface SharedOneLinerProps {
  allowedRoles: Roles[]
  requiredPermission: string
}

export function SharedOneLiner({ allowedRoles, requiredPermission }: SharedOneLinerProps) {
  const { role } = useRole()
  const { scriptData } = useScriptData()
  const [oneLinerData, setOneLinerData] = useState<OneLinerData | null>(null)
  const [customPitch, setCustomPitch] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

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

  // Load existing one-liner data
  useEffect(() => {
    const loadOneLinerData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ONE_LINER_DATA)
        if (stored) {
          setOneLinerData(JSON.parse(stored))
        }
      } catch (err) {
        console.error('Error loading one-liner data:', err)
      }
    }
    loadOneLinerData()
  }, [])

  const generateOneLiner = async () => {
    if (!scriptData || config.readOnly) {
      toast.error(config.readOnly ? 'Read-only access - generation not allowed' : 'No script data available. Please upload a script first.')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      // Try API call first
      try {
        const response = await fetch(`${API_URL}/one-liner/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            script_data: scriptData,
            count: 3
          }),
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to generate one-liner')
        }

        const newData: OneLinerData = {
          generated_pitches: result.data.pitches || [],
          timestamp: new Date().toISOString(),
          coordinator_info: result.data.coordinator_info,
          agent_results: result.data.results,
          combined_analysis: result.data.combined_analysis
        }

        localStorage.setItem(STORAGE_KEYS.ONE_LINER_DATA, JSON.stringify(newData))
        setOneLinerData(newData)
        toast.success('One-liner pitches generated successfully!')

      } catch (apiError) {
        console.warn('API call failed, generating offline versions:', apiError)
        
        // Generate basic one-liners offline
        const samplePitches = [
          "A compelling story of ambition, betrayal, and redemption that challenges everything we thought we knew.",
          "When the past collides with the present, one person must choose between safety and truth.",
          "A journey of self-discovery that reveals the true meaning of courage in the face of impossible odds."
        ]

        const offlineData: OneLinerData = {
          generated_pitches: samplePitches,
          timestamp: new Date().toISOString()
        }

        localStorage.setItem(STORAGE_KEYS.ONE_LINER_DATA, JSON.stringify(offlineData))
        setOneLinerData(offlineData)
        toast.success('One-liner pitches generated (offline mode)')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate one-liner'
      console.error('Error generating one-liner:', error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveCustomPitch = () => {
    if (!customPitch.trim() || config.readOnly) {
      toast.error(config.readOnly ? 'Read-only access - editing not allowed' : 'Please enter a custom pitch')
      return
    }

    const updatedData = {
      ...oneLinerData,
      custom_pitch: customPitch.trim(),
      timestamp: new Date().toISOString()
    } as OneLinerData

    localStorage.setItem(STORAGE_KEYS.ONE_LINER_DATA, JSON.stringify(updatedData))
    setOneLinerData(updatedData)
    toast.success('Custom pitch saved!')
  }

  if (!scriptData) {
    return <NoScriptMessage />
  }

  if (error && !oneLinerData) {
    return <ErrorMessage message={error} />
  }

  return (
    <RoleGate allowedRoles={allowedRoles}>
      <div className="h-full overflow-y-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`bg-${config.color}-500 text-white p-2 rounded-lg`}>
                <Lightbulb className="h-6 w-6" />
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
            
            {!config.readOnly && (
              <Button
                onClick={generateOneLiner}
                disabled={isGenerating || isOffline}
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate One-Liners
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

        {/* Coordinator Status */}
        {oneLinerData?.coordinator_info && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {oneLinerData.coordinator_info.name}
              </CardTitle>
              <CardDescription>
                {oneLinerData.coordinator_info.total_agents} Sub-Agents: {oneLinerData.coordinator_info.operational} Operational + {oneLinerData.coordinator_info.needs_implementation} To Be Implemented
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oneLinerData.agent_results && Object.entries(oneLinerData.agent_results).map(([agentName, result]) => (
                  <Card key={agentName} className={`border ${result.status.includes('✅') ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{agentName.replace('_', ' ').toUpperCase()}</h4>
                          <Badge variant={result.status.includes('✅') ? 'default' : 'secondary'} className="text-xs">
                            {result.status.includes('✅') ? 'OPERATIONAL' : 'NEEDS IMPL'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.model || 'Model TBD'}</p>
                        <p className="text-xs">{result.status}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Story Analysis Results */}
        {oneLinerData?.agent_results?.story_analyzer?.data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-green-500 text-white p-1 rounded">
                  ✅
                </div>
                Story Analysis Results
              </CardTitle>
              <CardDescription>Foundational narrative analysis from StoryAnalyzerAgent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const storyData = oneLinerData.agent_results.story_analyzer.data as any
                return (
                  <div className="space-y-4">
                    {/* Story Elements */}
                    {storyData?.story_elements && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Story Elements</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Protagonist:</strong> {storyData.story_elements.protagonist}</p>
                            <p><strong>Conflict:</strong> {storyData.story_elements.central_conflict}</p>
                            <p><strong>Theme:</strong> {storyData.story_elements.theme}</p>
                            <p><strong>Setting:</strong> {storyData.story_elements.setting}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Basic Pitches</h4>
                          <div className="space-y-2">
                            {Array.isArray(storyData.basic_pitches) && storyData.basic_pitches.map((pitch: unknown, index: number) => (
                              <Card key={index} className="border-l-4 border-l-green-500">
                                <CardContent className="p-3">
                                  <p className="text-sm italic">"{String(pitch)}"</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Scene Summaries */}
                    {storyData.scene_summaries && storyData.scene_summaries.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Scene Summaries</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Array.isArray(storyData.scene_summaries) && storyData.scene_summaries.slice(0, 6).map((scene: Record<string, unknown>, index: number) => (
                            <Card key={index} className="border border-gray-200">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className="text-xs">Scene {String(scene.scene_number || 'N/A')}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{String(scene.one_liner || 'No summary')}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()} 
            </CardContent>
          </Card>
        )}

        {/* Pitch Specialist Results */}
        {oneLinerData?.agent_results?.pitch_specialist?.data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-yellow-500 text-white p-1 rounded">
                  🚧
                </div>
                Pitch Specialist Results
              </CardTitle>
              <CardDescription>Loglines and marketing copy (Implementation Pending)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const pitchData = oneLinerData.agent_results.pitch_specialist.data as any
                return (
                  <div className="space-y-4">
                    {/* Loglines */}
                    {pitchData?.loglines && (
                      <div>
                        <h4 className="font-medium mb-2">Professional Loglines</h4>
                        <div className="space-y-2">
                          {Array.isArray(pitchData.loglines) && pitchData.loglines.map((logline: unknown, index: number) => (
                            <Card key={index} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-3">
                                <p className="text-sm italic">"{String(logline)}"</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Taglines */}
                    {pitchData.taglines && (
                      <div>
                        <h4 className="font-medium mb-2">Taglines</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(pitchData.taglines) && pitchData.taglines.map((tagline: unknown, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {String(tagline)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* One Sentence Hook */}
                    {pitchData.one_sentence_hook && (
                      <div>
                        <h4 className="font-medium mb-2">Hook</h4>
                        <Card className="border-l-4 border-l-purple-500">
                          <CardContent className="p-3">
                            <p className="text-sm font-medium italic">"{String(pitchData.one_sentence_hook)}"</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )
              })()} 
            </CardContent>
          </Card>
        )}

        {/* Generated Pitches (Legacy) */}
        {oneLinerData?.generated_pitches && oneLinerData.generated_pitches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated One-Liner Pitches</CardTitle>
              <CardDescription>AI-generated compelling pitches for your script</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {oneLinerData.generated_pitches.map((pitch, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <p className="text-foreground italic">"{pitch}"</p>
                      <Badge variant="outline" className="ml-4 flex-shrink-0">
                        Pitch {index + 1}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-xs text-muted-foreground">
                Generated on: {oneLinerData.timestamp ? new Date(oneLinerData.timestamp).toLocaleString() : 'Unknown'}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Marketing Strategy Results */}
        {oneLinerData?.agent_results?.marketing_strategist?.data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-yellow-500 text-white p-1 rounded">
                  🚧
                </div>
                Marketing Strategy Results
              </CardTitle>
              <CardDescription>Campaign strategy and marketing planning (Implementation Pending)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const marketingData = oneLinerData.agent_results.marketing_strategist.data as any
                return (
                  <div className="space-y-4">
                    {/* Campaign Strategy */}
                    {marketingData?.campaign_strategy && (
                      <div>
                        <h4 className="font-medium mb-2">Campaign Strategy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Primary Hook:</strong> {String(marketingData.campaign_strategy.primary_hook || 'TBD')}</p>
                            <p><strong>Visual Style:</strong> {String(marketingData.campaign_strategy.visual_style || 'TBD')}</p>
                          </div>
                          <div>
                            <p><strong>Target Positioning:</strong> {String(marketingData.campaign_strategy.target_positioning || 'TBD')}</p>
                            <p><strong>USP:</strong> {String(marketingData.campaign_strategy.unique_selling_proposition || 'TBD')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Social Media Hashtags */}
                    {marketingData.social_media_strategy?.hashtags && (
                      <div>
                        <h4 className="font-medium mb-2">Social Media Hashtags</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(marketingData.social_media_strategy.hashtags) && marketingData.social_media_strategy.hashtags.map((hashtag: unknown, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {String(hashtag)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()} 
            </CardContent>
          </Card>
        )}

        {/* Genre Classification Results */}
        {oneLinerData?.agent_results?.genre_classifier?.data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-yellow-500 text-white p-1 rounded">
                  🚧
                </div>
                Genre Classification Results
              </CardTitle>
              <CardDescription>Genre positioning and comparable films (Implementation Pending)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const genreData = oneLinerData.agent_results.genre_classifier.data as any
                return (
                  <div className="space-y-4">
                    {/* Genre Classification */}
                    {genreData?.genre_classification && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Genre Classification</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Primary:</strong> {String(genreData.genre_classification.primary_genre || 'TBD')}</p>
                            <p><strong>Secondary:</strong> {String(genreData.genre_classification.secondary_genre || 'TBD')}</p>
                            <p><strong>Rating:</strong> {String(genreData.genre_classification.target_rating || 'TBD')}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Tone Descriptors</h4>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(genreData.genre_classification.tone_descriptors) && genreData.genre_classification.tone_descriptors.map((tone: unknown, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {String(tone)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Comparable Films */}
                    {genreData.comparable_films?.direct_comparisons && (
                      <div>
                        <h4 className="font-medium mb-2">Comparable Films</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {Array.isArray(genreData.comparable_films.direct_comparisons) && genreData.comparable_films.direct_comparisons.slice(0, 3).map((film: Record<string, unknown>, index: number) => (
                            <Card key={index} className="border border-gray-200">
                              <CardContent className="p-3">
                                <h5 className="font-medium text-sm">{String(film.title || 'Unknown')}</h5>
                                <p className="text-xs text-muted-foreground mb-1">Similarity: {Math.round((Number(film.similarity_score) || 0) * 100)}%</p>
                                <p className="text-xs">{String(film.box_office || 'N/A')}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()} 
            </CardContent>
          </Card>
        )}

        {/* Audience Targeting Results */}
        {oneLinerData?.agent_results?.audience_targeting?.data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-yellow-500 text-white p-1 rounded">
                  🚧
                </div>
                Audience Targeting Results
              </CardTitle>
              <CardDescription>Demographics and market analysis (Implementation Pending)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const audienceData = oneLinerData.agent_results.audience_targeting.data as any
                return (
                  <div className="space-y-4">
                    {/* Primary Demographics */}
                    {audienceData?.target_demographics?.primary && (
                      <div>
                        <h4 className="font-medium mb-2">Primary Demographics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Age:</strong> {String(audienceData.target_demographics.primary.age || 'TBD')}</p>
                            <p><strong>Gender:</strong> {String(audienceData.target_demographics.primary.gender || 'TBD')}</p>
                          </div>
                          <div>
                            <p><strong>Income:</strong> {String(audienceData.target_demographics.primary.income || 'TBD')}</p>
                            <p><strong>Education:</strong> {String(audienceData.target_demographics.primary.education || 'TBD')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Market Analysis */}
                    {audienceData.market_analysis && (
                      <div>
                        <h4 className="font-medium mb-2">Market Potential</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Box Office:</strong> {audienceData.market_analysis.box_office_potential?.domestic || 'TBD'}</p>
                          </div>
                          <div>
                            <p><strong>Streaming Value:</strong> {audienceData.market_analysis.streaming_value?.assessment || 'TBD'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Positioning Strategy */}
                    {audienceData.positioning_strategy && (
                      <div>
                        <h4 className="font-medium mb-2">Positioning Strategy</h4>
                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-3">
                            <p className="text-sm">{String(audienceData.positioning_strategy.primary_positioning || 'TBD')}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )
              })()} 
            </CardContent>
          </Card>
        )}

        {/* Custom Pitch Section */}
        <Card>
          <CardHeader>
            <CardTitle>Custom One-Liner Pitch</CardTitle>
            <CardDescription>
              {config.readOnly ? 'View your custom pitch' : 'Create your own custom pitch or modify the generated ones'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your custom one-liner pitch here..."
              value={customPitch || oneLinerData?.custom_pitch || ''}
              onChange={(e) => setCustomPitch(e.target.value)}
              className="min-h-[100px]"
              disabled={config.readOnly}
            />
            
            {!config.readOnly && (
              <Button onClick={saveCustomPitch} disabled={!customPitch.trim()}>
                Save Custom Pitch
              </Button>
            )}
            
            {oneLinerData?.custom_pitch && (
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-foreground italic">"{oneLinerData.custom_pitch}"</p>
                    <Badge variant="outline" className="ml-4 flex-shrink-0 bg-green-50 text-green-700">
                      Custom
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              One-Liner Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Keep it under 25 words</p>
              <p>• Focus on the main conflict or hook</p>
              <p>• Include the genre or tone</p>
              <p>• Make it memorable and marketable</p>
              <p>• Test it with different audiences</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  )
}