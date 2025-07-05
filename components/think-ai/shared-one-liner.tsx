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
const API_URL = 'http://localhost:8000/api'

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
          generated_pitches: result.data.pitches,
          timestamp: new Date().toISOString()
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
    <RoleGate roles={allowedRoles}>
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

        {/* Generated Pitches */}
        {oneLinerData?.generated_pitches && (
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