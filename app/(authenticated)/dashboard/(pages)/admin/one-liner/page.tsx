"use client"

import React, { useState, useEffect } from 'react'
import { Film, Download, RefreshCw, AlertCircle, FileText, Loader } from 'lucide-react'
import { useScriptData, type OneLinerData } from '@/lib/contexts/script-data-context'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_BASE_URL = 'https://thinkaiback.onrender.com'
const STORAGE_KEYS = {
  ONE_LINER_DATA: 'ONE_LINER_DATA',
}

export default function OneLinerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  
  const { scriptData, oneLinerData, updateOneLinerData } = useScriptData()

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

  const generateOneLiner = async () => {
    if (!scriptData) {
      toast.error('Please upload and analyze a script first.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Use the exact same endpoint and request format as old UI
      const response = await fetch(`${API_BASE_URL}/api/one-liner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scriptData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `API Error: ${response.status}`)
      }

      const result = await response.json()
      
      // Handle response based on old UI pattern
      let oneLinerData: OneLinerData
      if (result && 'data' in result) {
        oneLinerData = result.data
      } else if (result && 'success' in result && result.success) {
        oneLinerData = result.data
      } else {
        oneLinerData = result as OneLinerData
      }
      
      localStorage.setItem(STORAGE_KEYS.ONE_LINER_DATA, JSON.stringify(oneLinerData))
      updateOneLinerData(oneLinerData)
      toast.success('One-liner generated successfully!')
    } catch (error) {
      console.error('Error generating one-liner:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate one-liner'
      toast.error(`One-liner Error: ${errorMessage}`)
      
      // Try to load from localStorage as fallback
      try {
        const storedData = localStorage.getItem(STORAGE_KEYS.ONE_LINER_DATA)
        if (storedData) {
          const cachedData = JSON.parse(storedData)
          updateOneLinerData(cachedData)
          toast.success('Loaded previous one-liner from local storage')
        }
      } catch (storageError) {
        console.error('Failed to load from localStorage:', storageError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const exportOneLiner = () => {
    if (!oneLinerData) return

    const content = oneLinerData.scenes.map(scene => 
      `Scene ${scene.scene_number}: ${scene.one_liner}`
    ).join('\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'one-liner.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('One-liner exported successfully!')
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

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white p-2 rounded-lg">
              <Film className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                One-Liner Generation
              </h1>
              <p className="text-muted-foreground">
                Generate concise summaries for each scene in your script
              </p>
            </div>
          </div>
          
          {isOffline && (
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              Offline Mode
            </Badge>
          )}
        </div>
        
        <Badge variant="secondary" className="w-fit">
          Scene Summaries
        </Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>One-Liner Controls</CardTitle>
          <CardDescription>
            Generate and manage scene summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={generateOneLiner}
              disabled={isGenerating || !scriptData}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate One-Liner
                </>
              )}
            </Button>
            
            {oneLinerData && (
              <Button
                onClick={exportOneLiner}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* One-Liner Results - Match Old UI Format */}
      {oneLinerData ? (
        <div className="space-y-6">
          {/* Overall Summary - Match old UI */}
          <Card className="border border-border">
            <CardHeader>
              <div className="flex justify-between items-start mb-3">
                <CardTitle>Overall Summary</CardTitle>
                <Button
                  onClick={generateOneLiner}
                  disabled={isGenerating}
                  variant="ghost"
                  size="sm"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="h-3 w-3 mr-1 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3 w-3 mr-1" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Scene breakdown generated with {oneLinerData.scenes?.length || 0} scenes
              </p>
            </CardContent>
          </Card>

          {/* Scene Breakdowns - Match old UI */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scene Breakdowns</h3>
            <div className="space-y-4">
              {oneLinerData.scenes?.map((scene) => (
                <Card key={scene.scene_number} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Scene {scene.scene_number}</h4>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {scene.one_liner}
                    </p>
                  </CardContent>
                </Card>
              )) || (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No scene data available
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground">
              Click "Generate One-Liner" to create scene summaries
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}