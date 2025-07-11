"use client"

import React, { useState, useEffect } from 'react'
import { Layers, Download, RefreshCw, AlertCircle, FileText, Loader, Image } from 'lucide-react'
import { useScriptData, type StoryboardData } from '@/lib/contexts/script-data-context'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_BASE_URL = 'https://thinkaiback.onrender.com'
const STORAGE_KEYS = {
  STORYBOARD_DATA: 'STORYBOARD_DATA',
}

export default function StoryboardPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  
  const { scriptData, storyboardData, updateStoryboardData } = useScriptData()

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

  const generateStoryboard = async () => {
    if (!scriptData) {
      toast.error('Please upload and analyze a script first.')
      return
    }

    setIsGenerating(true)

    try {
      // Use the exact same endpoint and request format as old UI
      const requestData = {
        script_results: scriptData,
        shot_settings: {
          default_shot_type: "MS",
          style: "realistic",
          mood: "neutral",
          camera_angle: "eye_level"
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/storyboard/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `API Error: ${response.status}`)
      }

      const result = await response.json()
      
      // Handle response based on old UI pattern
      let storyboardData: StoryboardData
      if (result && 'data' in result) {
        storyboardData = result.data
      } else if (result && 'success' in result && result.success) {
        storyboardData = result.data
      } else {
        storyboardData = result as StoryboardData
      }
      
      localStorage.setItem(STORAGE_KEYS.STORYBOARD_DATA, JSON.stringify(storyboardData))
      updateStoryboardData(storyboardData)
      toast.success('Storyboard generated successfully!')
    } catch (error) {
      console.error('Error generating storyboard:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate storyboard'
      toast.error(`Storyboard Error: ${errorMessage}`)
      
      // Try to load from localStorage as fallback
      try {
        const storedData = localStorage.getItem(STORAGE_KEYS.STORYBOARD_DATA)
        if (storedData) {
          const cachedData = JSON.parse(storedData)
          updateStoryboardData(cachedData)
          toast.success('Loaded previous storyboard from local storage')
        }
      } catch (storageError) {
        console.error('Failed to load from localStorage:', storageError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  if (!scriptData) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No script data available</h3>
            <Button asChild><a href="/dashboard/admin/upload-script">Upload Script</a></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white p-2 rounded-lg">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Storyboard Generation</h1>
            <p className="text-muted-foreground">Create visual storyboards for your scenes</p>
          </div>
        </div>
        <Badge variant="secondary">Visual Planning</Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Storyboard Generation</CardTitle>
          <CardDescription>
            Generate visual storyboards for all scenes in your script
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={generateStoryboard}
              disabled={isGenerating || !scriptData}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating Storyboards...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Storyboard
                </>
              )}
            </Button>
            
            {storyboardData && (
              <Button
                onClick={() => {
                  const content = storyboardData.storyboards?.map(scene => 
                    `Scene ${scene.scene_number}: ${scene.panels?.map(p => p.description).join(', ')}\n`
                  ).join('\n') || 'No storyboard data available'
                  
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'storyboard-report.txt'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  toast.success('Storyboard report exported successfully!')
                }}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storyboard Results */}
      {storyboardData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storyboard Results</CardTitle>
              <CardDescription>
                {storyboardData.storyboards?.length || 0} scenes with storyboards
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Storyboard scenes */}
          {storyboardData.storyboards && storyboardData.storyboards.length > 0 ? (
            storyboardData.storyboards.map((scene) => (
              <Card key={scene.scene_number}>
                <CardHeader>
                  <CardTitle>Scene {scene.scene_number} Storyboard</CardTitle>
                  <Badge variant="outline">
                    {scene.panels?.length || 0} panels
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {scene.panels?.map((panel) => (
                        <div key={panel.panel_number} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          {panel.image_url ? (
                            <img 
                              src={panel.image_url} 
                              alt={`Panel ${panel.panel_number} for scene ${scene.scene_number}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Image className="h-12 w-12 text-gray-400" aria-label="Storyboard placeholder" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      {scene.panels?.map((panel) => (
                        <div key={panel.panel_number}>
                          <h5 className="text-sm font-medium text-muted-foreground mb-1">Panel {panel.panel_number}:</h5>
                          <p className="text-sm">{panel.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground">
                  No storyboard data available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}