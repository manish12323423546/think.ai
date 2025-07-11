"use client"

import React, { useState, useEffect } from 'react'
import { Users, Download, RefreshCw, AlertCircle, FileText, Loader, User, Grid, BarChart2, ArrowUpDown } from 'lucide-react'
import { useScriptData, type CharacterData } from '@/lib/contexts/script-data-context'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const API_BASE_URL = 'https://thinkaiback.onrender.com'
const STORAGE_KEYS = {
  CHARACTER_DATA: 'CHARACTER_DATA',
}

interface SubtabProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const Subtab: React.FC<SubtabProps> = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center px-4 py-2 rounded-md mr-3 transition-colors whitespace-nowrap',
      active 
        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
    )}
  >
    <Icon className="h-4 w-4 mr-2" />
    {label}
  </button>
);

export default function CharacterBreakdownPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [activeSubtab, setActiveSubtab] = useState(0)
  
  const { scriptData, oneLinerData, characterData, updateCharacterData } = useScriptData()

  const subtabs = [
    { icon: Users, label: 'Character Profiles' },
    { icon: ArrowUpDown, label: 'Arc & Relationships' },
    { icon: Grid, label: 'Scene Matrix' },
    { icon: BarChart2, label: 'Statistics' }
  ]

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

  const generateCharacterBreakdown = async () => {
    if (!scriptData || !oneLinerData) {
      toast.error('Please upload a script and generate one-liners first.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Use the exact same endpoint and request format as old UI
      const response = await fetch(`${API_BASE_URL}/api/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ script_data: scriptData }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `API Error: ${response.status}`)
      }

      const result = await response.json()
      
      // Handle response based on old UI pattern
      let characterData: CharacterData
      if (result && 'data' in result) {
        characterData = result.data
      } else if (result && 'success' in result && result.success) {
        characterData = result.data
      } else {
        characterData = result as CharacterData
      }
      
      localStorage.setItem(STORAGE_KEYS.CHARACTER_DATA, JSON.stringify(characterData))
      updateCharacterData(characterData)
      toast.success('Character breakdown generated successfully!')
    } catch (error) {
      console.error('Error generating character breakdown:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate character breakdown'
      toast.error(`Character Analysis Error: ${errorMessage}`)
      
      // Try to load from localStorage as fallback
      try {
        const storedData = localStorage.getItem(STORAGE_KEYS.CHARACTER_DATA)
        if (storedData) {
          const cachedData = JSON.parse(storedData)
          updateCharacterData(cachedData)
          toast.success('Loaded previous character breakdown from local storage')
        }
      } catch (storageError) {
        console.error('Failed to load from localStorage:', storageError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const exportCharacterBreakdown = () => {
    if (!characterData) return

    const content = Object.entries(characterData.characters).map(([name, character]) => 
      `CHARACTER: ${name}\n` +
      `Objective: ${character.objective}\n` +
      `Arc: ${character.arc}\n` +
      `Scenes: ${character.scenes.join(', ')}\n` +
      `Relationships:\n${character.relationships.map(rel => `  - ${rel.character}: ${rel.relationship}`).join('\n')}\n\n`
    ).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'character-breakdown.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Character breakdown exported successfully!')
  }

  if (!scriptData) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No script data available</h3>
            <p className="text-muted-foreground mb-4">
              Please upload and analyze a script first.
            </p>
            <Button asChild>
              <a href="/dashboard/admin/upload-script">Upload Script</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!oneLinerData) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">One-liner required</h3>
            <p className="text-muted-foreground mb-4">
              Please generate one-liners first before creating character breakdowns.
            </p>
            <Button asChild>
              <a href="/dashboard/admin/one-liner">Generate One-Liners</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Character Breakdown
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze character relationships, arcs, and technical requirements.
            </p>
          </div>
          
          {characterData && (
            <Button 
              onClick={generateCharacterBreakdown}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="flex overflow-x-auto pb-2 mt-4">
          {subtabs.map((tab, index) => (
            <Subtab
              key={index}
              active={activeSubtab === index}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveSubtab(index)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!characterData ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No character data available</h3>
            <p className="text-muted-foreground mb-4">
              Generate character analysis to view detailed breakdowns of your script's characters.
            </p>
            <Button
              onClick={generateCharacterBreakdown}
              disabled={isGenerating || !scriptData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Generate Character Analysis'
              )}
            </Button>
          </div>
        ) : (
          <div>
          {/* Character Subtabs Content */}
          {activeSubtab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(characterData?.characters || {}).map(([name, character]) => (
                <Card key={name} className="border border-border/40">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-lg">{name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {character.objective || 'No objective defined'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Character Arc */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Character Arc</h5>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-sm">{character.arc || 'No arc defined'}</p>
                      </div>
                    </div>

                    {/* Scene Presence */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Scene Presence</h5>
                      <div className="flex flex-wrap gap-1">
                        {(character.scenes || []).map((scene, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            Scene {scene}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Relationships */}
                    <div>
                      <h5 className="text-sm font-medium mb-2">Relationships</h5>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="space-y-2">
                          {(character.relationships || []).map((rel, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{rel.character}:</span> {rel.relationship}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeSubtab === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Character Arcs & Relationships</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(characterData?.characters || {}).map(([charName, char]) => {
                  return (
                    <Card key={charName} className="border border-border/40">
                      <CardHeader>
                        <CardTitle>{charName}'s Character Arc</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Objective</h5>
                            <p className="text-sm text-muted-foreground">{char.objective || 'No objective defined'}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Character Arc</h5>
                            <p className="text-sm text-muted-foreground">{char.arc || 'No arc defined'}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Key Relationships</h5>
                            <div className="space-y-2">
                              {char.relationships?.map((rel, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{rel.character}:</span> {rel.relationship}
                                </div>
                              )) || <p className="text-sm text-muted-foreground">No relationships defined</p>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

            </div>
          )}

          {activeSubtab === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Scene Matrix</h3>
              
              {false ? (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="p-3 text-left text-muted-foreground font-medium">Scene</th>
                          {Object.keys(characterData?.characters || {}).map(char => (
                            <th key={char} className="p-3 text-left text-muted-foreground font-medium">
                              {char}
                            </th>
                          ))}
                          <th className="p-3 text-left text-muted-foreground font-medium">Emotional Tone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries({}).map(([sceneId, sceneData]) => {
                          const scene = sceneData as { characters?: string[], present_characters?: string[], emotional_tone?: string };
                          const characters = scene.characters || scene.present_characters || [];
                          
                          return (
                            <tr key={sceneId} className="border-b border-border/30">
                              <td className="p-3 font-medium">{sceneId}</td>
                              {Object.keys(characterData?.characters || {}).map(char => (
                                <td key={`${sceneId}-${char}`} className="p-3">
                                  {characters.includes(char) ? (
                                    <span className="inline-block w-4 h-4 rounded-full bg-green-500"></span>
                                  ) : (
                                    <span className="inline-block w-4 h-4 rounded-full bg-gray-300"></span>
                                  )}
                                </td>
                              ))}
                              <td className="p-3 text-sm">
                                <span className="bg-muted/30 px-2 py-1 rounded">
                                  {'Not specified'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <Card className="border border-border/40">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Scene matrix data is not available in the current dataset.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeSubtab === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Character Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border/40">
                  <CardHeader>
                    <CardTitle>Character Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Characters:</span>
                        <span>{Object.keys(characterData?.characters || {}).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Main Characters:</span>
                        <span>{Object.keys(characterData?.characters || {}).slice(0, 3).join(', ')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/40">
                  <CardHeader>
                    <CardTitle>Character Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(characterData?.characters || {}).slice(0, 5).map(([charName, char]) => (
                        <div key={charName} className="text-sm">
                          <div className="font-medium">{charName}</div>
                          <div className="text-xs text-muted-foreground">
                            Appears in {char.scenes?.length || 0} scenes
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}