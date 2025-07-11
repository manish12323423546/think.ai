"use client"

import React, { useState, useEffect } from 'react'
import { Users, User, Heart, Briefcase, Target, AlertCircle, Info, Loader, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useScriptData } from '@/lib/contexts/script-data-context'
import { useRole } from '@/hooks/use-roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoleGate } from '@/components/auth/role-gate'
import { Roles } from '@/types/globals'

// API endpoint constant
const API_URL = 'https://thinkaiback.onrender.com/api'

// Storage keys
const STORAGE_KEYS = {
  CHARACTER_DATA: 'CHARACTER_DATA',
}

// Role-specific configurations
const ROLE_CONFIGS = {
  writer: {
    title: 'Character Breakdown - Writer Dashboard',
    description: 'Detailed character analysis and development insights',
    badge: 'Writer Access - Character Development Tools',
    color: 'purple',
    readOnly: false
  },
  producer: {
    title: 'Character Breakdown - Producer Dashboard',
    description: 'Character analysis for casting and production planning',
    badge: 'Producer Access - Production Planning Tools',
    color: 'blue',
    readOnly: false
  },
  director: {
    title: 'Character Breakdown - Director Dashboard',
    description: 'Character insights for creative direction and casting',
    badge: 'Director Access - Creative Character Tools',
    color: 'green',
    readOnly: false
  },
  storyboard_artist: {
    title: 'Character Breakdown - Storyboard Artist Dashboard',
    description: 'Character reference for visual planning',
    badge: 'Storyboard Artist Access - Read-Only',
    color: 'orange',
    readOnly: true
  },
  team_member: {
    title: 'Character Breakdown - Team Member Dashboard',
    description: 'Basic character information and overview',
    badge: 'Team Member Access - Read-Only',
    color: 'gray',
    readOnly: true
  },
  admin: {
    title: 'Character Breakdown - Admin Dashboard',
    description: 'Complete character analysis and management tools',
    badge: 'Admin Access - Full Control',
    color: 'red',
    readOnly: false
  }
}

const LoadingMessage = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Loader className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
    <h3 className="text-xl font-medium mb-2">Analyzing characters...</h3>
    <p className="text-muted-foreground">
      Please wait while we break down your characters.
    </p>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-xl font-medium mb-2">Error Loading Characters</h3>
    <p className="text-red-500 mb-4">{message}</p>
  </div>
)

const NoScriptMessage = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Users className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-xl font-medium mb-2">No script data available</h3>
    <p className="text-muted-foreground mb-4">
      Please upload a script first to analyze characters.
    </p>
    <Button asChild>
      <a href="/dashboard/upload-script">Go to Upload</a>
    </Button>
  </div>
)

interface Character {
  name: string
  description: string
  traits: string[]
  relationships: string[]
  scenes?: number[]
  importance?: 'main' | 'supporting' | 'minor'
  age_range?: string
  personality?: string
  backstory?: string
  arc?: string
  casting_notes?: string
}

interface CharacterData {
  characters: Record<string, Character>
  analysis: {
    total_characters: number
    main_characters: string[]
    supporting_characters: string[]
    character_arcs: Record<string, string>
  }
  timestamp: string
}

interface SharedCharacterBreakdownProps {
  allowedRoles: Roles[]
  requiredPermission: string
  readOnly?: boolean
}

export function SharedCharacterBreakdown({ allowedRoles, requiredPermission, readOnly = false }: SharedCharacterBreakdownProps) {
  const { role } = useRole()
  const { scriptData } = useScriptData()
  const [characterData, setCharacterData] = useState<CharacterData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)

  // Get role-specific configuration
  const config = ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS] || ROLE_CONFIGS.team_member
  const isReadOnly = readOnly || config.readOnly

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

  // Load existing character data or extract from script
  useEffect(() => {
    const loadCharacterData = () => {
      try {
        // First try to load from storage
        const stored = localStorage.getItem(STORAGE_KEYS.CHARACTER_DATA)
        if (stored) {
          setCharacterData(JSON.parse(stored))
          return
        }

        // If no stored data but we have script data, extract basic character info
        if (scriptData?.characters && Object.keys(scriptData.characters).length > 0) {
          const characterKeys = Object.keys(scriptData.characters)
          const basicData: CharacterData = {
            characters: scriptData.characters,
            analysis: {
              total_characters: characterKeys.length,
              main_characters: characterKeys.slice(0, 3), // Take first 3 as main
              supporting_characters: characterKeys.slice(3),
              character_arcs: {}
            },
            timestamp: new Date().toISOString()
          }
          setCharacterData(basicData)
        }
      } catch (err) {
        console.error('Error loading character data:', err)
        setError('Failed to load character data')
      }
    }
    loadCharacterData()
  }, [scriptData])

  const analyzeCharacters = async () => {
    if (!scriptData || isReadOnly) {
      toast.error(isReadOnly ? 'Read-only access - analysis not allowed' : 'No script data available. Please upload a script first.')
      return
    }

    try {
      setIsAnalyzing(true)
      setError(null)

      // Try API call first
      try {
        const response = await fetch(`${API_URL}/characters/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            script_data: scriptData
          }),
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to analyze characters')
        }

        localStorage.setItem(STORAGE_KEYS.CHARACTER_DATA, JSON.stringify(result.data))
        setCharacterData(result.data)
        toast.success('Character analysis completed successfully!')

      } catch (apiError) {
        console.warn('API call failed, generating offline analysis:', apiError)
        
        // Create enhanced character data offline
        const enhancedCharacters: Record<string, Character> = {}
        
        if (scriptData.characters) {
          Object.entries(scriptData.characters).forEach(([name, char]) => {
            enhancedCharacters[name] = {
              ...char,
              importance: Object.keys(scriptData.characters).indexOf(name) < 3 ? 'main' : 'supporting',
              age_range: 'TBD',
              personality: char.description || 'Character analysis pending',
              backstory: 'To be developed',
              arc: 'Character development arc to be defined',
              casting_notes: 'Casting considerations to be added'
            }
          })
        }

        const offlineData: CharacterData = {
          characters: enhancedCharacters,
          analysis: {
            total_characters: Object.keys(enhancedCharacters).length,
            main_characters: Object.keys(enhancedCharacters).slice(0, 3),
            supporting_characters: Object.keys(enhancedCharacters).slice(3),
            character_arcs: {}
          },
          timestamp: new Date().toISOString()
        }

        localStorage.setItem(STORAGE_KEYS.CHARACTER_DATA, JSON.stringify(offlineData))
        setCharacterData(offlineData)
        toast.success('Character analysis completed (offline mode)')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze characters'
      console.error('Error analyzing characters:', error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!scriptData) {
    return <NoScriptMessage />
  }

  if (error && !characterData) {
    return <ErrorMessage message={error} />
  }

  const characters = characterData?.characters || {}
  const characterNames = Object.keys(characters)

  return (
    <RoleGate roles={allowedRoles}>
      <div className="h-full overflow-y-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`bg-${config.color}-500 text-white p-2 rounded-lg`}>
                <Users className="h-6 w-6" />
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
            
            {!isReadOnly && (
              <Button
                onClick={analyzeCharacters}
                disabled={isAnalyzing || isOffline}
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze Characters
                  </>
                )}
              </Button>
            )}
          </div>
          
          <Badge variant="secondary" className="w-fit">
            {config.badge}
          </Badge>
          
          {isReadOnly && (
            <Badge variant="outline" className="w-fit bg-yellow-50 border-yellow-200 text-yellow-700">
              Read-Only Access
            </Badge>
          )}
        </div>

        {/* Character Overview */}
        {characterData && characterData.analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{characterData.analysis.total_characters || 0}</p>
                    <p className="text-muted-foreground">Total Characters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <User className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{characterData.analysis.main_characters?.length || 0}</p>
                    <p className="text-muted-foreground">Main Characters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{characterData.analysis.supporting_characters?.length || 0}</p>
                    <p className="text-muted-foreground">Supporting Characters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Character Details */}
        {characterNames.length > 0 ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Character Overview
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Detailed Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characterNames.map((name) => {
                  const character = characters[name]
                  const isMain = characterData?.analysis?.main_characters?.includes(name) || false
                  
                  return (
                    <Card key={name} className={isMain ? 'border-blue-200 bg-blue-50' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{name}</CardTitle>
                          <Badge variant={isMain ? 'default' : 'secondary'}>
                            {isMain ? 'Main' : 'Supporting'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3">
                          {character.description || 'No description available'}
                        </p>
                        
                        {character.traits && character.traits.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium mb-1">Traits:</h5>
                            <div className="flex flex-wrap gap-1">
                              {character.traits.map((trait, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedCharacter(name)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Character List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Characters</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {characterNames.map((name) => (
                        <button
                          key={name}
                          onClick={() => setSelectedCharacter(name)}
                          className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                            selectedCharacter === name ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">
                            {characterData?.analysis?.main_characters?.includes(name) ? 'Main Character' : 'Supporting'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Character Details */}
                <div className="lg:col-span-3">
                  {selectedCharacter && characters[selectedCharacter] ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <User className="h-5 w-5" />
                          {selectedCharacter}
                        </CardTitle>
                        <CardDescription>Detailed character breakdown</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {(() => {
                          const character = characters[selectedCharacter]
                          return (
                            <>
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-muted-foreground">
                                  {character.description || 'No description available'}
                                </p>
                              </div>
                              
                              {character.traits && character.traits.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Character Traits</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {character.traits.map((trait, i) => (
                                      <Badge key={i} variant="secondary">{trait}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {character.relationships && character.relationships.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Relationships</h4>
                                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {character.relationships.map((rel, i) => (
                                      <li key={i}>{rel}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {character.personality && (
                                <div>
                                  <h4 className="font-medium mb-2">Personality</h4>
                                  <p className="text-muted-foreground">{character.personality}</p>
                                </div>
                              )}
                              
                              {character.arc && (
                                <div>
                                  <h4 className="font-medium mb-2">Character Arc</h4>
                                  <p className="text-muted-foreground">{character.arc}</p>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-64 flex items-center justify-center">
                      <CardContent>
                        <div className="text-center text-muted-foreground">
                          <User className="h-12 w-12 mx-auto mb-4" />
                          <p>Select a character to view details</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">No Characters Found</h3>
              <p className="text-muted-foreground mb-4">
                No character data available in the current script.
              </p>
              {!isReadOnly && (
                <Button onClick={analyzeCharacters}>
                  Analyze Characters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Timestamp */}
        {characterData?.timestamp && (
          <div className="text-xs text-muted-foreground text-center">
            Last analyzed: {new Date(characterData.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </RoleGate>
  )
}