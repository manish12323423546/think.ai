"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, Download, RefreshCw, AlertCircle, FileText, Loader, Clock } from 'lucide-react'
import { useScriptData, type ScheduleData } from '@/lib/contexts/script-data-context'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_BASE_URL = 'http://localhost:8000'
const STORAGE_KEYS = {
  SCHEDULE_DATA: 'SCHEDULE_DATA',
}

export default function SchedulePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  
  const { scriptData, characterData, scheduleData, updateScheduleData } = useScriptData()

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

  const generateSchedule = async () => {
    if (!scriptData || !characterData) {
      toast.error('Please complete script analysis and character breakdown first.')
      return
    }

    setIsGenerating(true)

    try {
      // Use the exact same endpoint and request format as old UI
      const requestData = {
        script_results: scriptData,
        character_results: characterData,
        start_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        location_constraints: {
          preferred_locations: [],
          avoid_weather: ["Rain", "Snow", "High Winds"]
        },
        schedule_constraints: {
          max_hours_per_day: 12,
          meal_break_duration: 60,
          company_moves_per_day: 2
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/schedule`, {
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
      let scheduleData: ScheduleData
      if (result && 'data' in result) {
        scheduleData = result.data
      } else if (result && 'success' in result && result.success) {
        scheduleData = result.data
      } else {
        scheduleData = result as ScheduleData
      }
      
      localStorage.setItem(STORAGE_KEYS.SCHEDULE_DATA, JSON.stringify(scheduleData))
      updateScheduleData(scheduleData)
      toast.success('Schedule generated successfully!')
    } catch (error) {
      console.error('Error generating schedule:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate schedule'
      toast.error(`Schedule Error: ${errorMessage}`)
      
      // Try to load from localStorage as fallback
      try {
        const storedData = localStorage.getItem(STORAGE_KEYS.SCHEDULE_DATA)
        if (storedData) {
          const cachedData = JSON.parse(storedData)
          updateScheduleData(cachedData)
          toast.success('Loaded previous schedule from local storage')
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

  if (!characterData) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Character breakdown required</h3>
            <p className="text-muted-foreground mb-4">
              Please complete character breakdown before generating schedule.
            </p>
            <Button asChild>
              <a href="/dashboard/admin/character-breakdown">Character Breakdown</a>
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
            <div className="bg-purple-500 text-white p-2 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Production Schedule
              </h1>
              <p className="text-muted-foreground">
                Generate optimized shooting schedules based on your script
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
          Shooting Schedule
        </Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Generation</CardTitle>
          <CardDescription>
            Create optimized shooting schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generateSchedule}
            disabled={isGenerating || !scriptData || !characterData}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Results */}
      {scheduleData ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Summary</CardTitle>
              <CardDescription>
                {scheduleData.summary ? (
                  `${scheduleData.summary.total_days} days, ${scheduleData.summary.total_scenes} scenes, ${scheduleData.summary.total_pages} pages`
                ) : (
                  `${scheduleData.schedule?.length || 0} days scheduled`
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {scheduleData.schedule?.map((day) => (
            <Card key={day.day}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Day {day.day} - {day.date}
                </CardTitle>
                <Badge variant="outline" className="w-fit">
                  {day.scenes?.length || 0} scenes scheduled
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {day.scenes?.map((scene, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              Scene {scene.scene_id || scene.scene_number || index + 1}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {scene.location_id || scene.location || 'Unknown location'}
                            </p>
                            <div className="text-xs text-muted-foreground mt-1">
                              {scene.start_time} - {scene.end_time}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {scene.duration_minutes ? `${scene.duration_minutes}min` : 'Duration TBD'}
                            </div>
                            {scene.setup_time && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Setup: {scene.setup_time}
                              </div>
                            )}
                          </div>
                        </div>
                        {scene.crew_ids && scene.crew_ids.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              Crew: {scene.crew_ids.length} members assigned
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No scenes scheduled for this day
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground">
                  No schedule data available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground">
              Click "Generate Schedule" to create shooting schedule
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}