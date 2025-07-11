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
                  const content = storyboardData.scenes?.map(scene => 
                    `Scene ${scene.scene_id}: ${scene.description}\n` +
                    `Shot Type: ${scene.technical_params?.shot_type || 'N/A'}\n` +
                    `Camera Angle: ${scene.technical_params?.camera_angle || 'N/A'}\n` +
                    `Mood: ${scene.technical_params?.mood || 'N/A'}\n` +
                    `Prompt: ${scene.enhanced_prompt || scene.prompt || 'N/A'}\n`
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
                {storyboardData.scenes?.length || storyboardData.storyboards?.length || 0} scenes with storyboards
              </CardDescription>
            </CardHeader>
          </Card>

          {/* New format: scenes array */}
          {storyboardData.scenes?.map((scene) => (
            <Card key={scene.scene_id}>
              <CardHeader>
                <CardTitle>Scene {scene.scene_id} Storyboard</CardTitle>
                <Badge variant="outline">
                  {scene.technical_params?.shot_type || 'Shot type N/A'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    {scene.image_url && scene.image_url !== '/placeholder-storyboard-1.jpg' ? (
                      <img 
                        src={scene.image_url} 
                        alt={`Storyboard for scene ${scene.scene_id}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex')
                        }}
                      />
                    ) : null}
                    <div className="flex items-center justify-center w-full h-full" style={{display: scene.image_url && scene.image_url !== '/placeholder-storyboard-1.jpg' ? 'none' : 'flex'}}>
                      <Image className="h-12 w-12 text-gray-400" aria-label="Storyboard placeholder" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Description:</h5>
                      <p className="text-sm">{scene.description}</p>
                    </div>
                    
                    {scene.enhanced_prompt && (
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-1">Enhanced Prompt:</h5>
                        <p className="text-xs text-muted-foreground">{scene.enhanced_prompt}</p>
                      </div>
                    )}
                    
                    {scene.technical_params && (
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Shot:</span>
                          <br />
                          {scene.technical_params.shot_type}
                        </div>
                        <div>
                          <span className="font-medium">Angle:</span>
                          <br />
                          {scene.technical_params.camera_angle}
                        </div>
                        <div>
                          <span className="font-medium">Mood:</span>
                          <br />
                          {scene.technical_params.mood}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || 
          
          /* Legacy format: storyboards array */
          storyboardData.storyboards?.map((storyboard) => (
            <Card key={storyboard.scene_number}>
              <CardHeader>
                <CardTitle>Scene {storyboard.scene_number} Storyboard</CardTitle>
                <Badge variant="outline">{storyboard.panels?.length || 0} panels</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {storyboard.panels?.map((panel) => (
                    <Card key={panel.panel_number}>
                      <CardContent className="p-4">
                        <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          {panel.image_url && panel.image_url !== '/placeholder-storyboard-1.jpg' ? (
                            <img 
                              src={panel.image_url} 
                              alt={`Panel ${panel.panel_number}`}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex')
                              }}
                            />
                          ) : null}
                          <div className="flex items-center justify-center w-full h-full" style={{display: panel.image_url && panel.image_url !== '/placeholder-storyboard-1.jpg' ? 'none' : 'flex'}}>
                            <Image className="h-8 w-8 text-gray-400" aria-label="Storyboard placeholder" />
                          </div>
                        </div>
                        <h4 className="font-medium mb-1">Panel {panel.panel_number}</h4>
                        <p className="text-sm text-muted-foreground">{panel.description}</p>
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No panels available for this scene
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )) || (
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