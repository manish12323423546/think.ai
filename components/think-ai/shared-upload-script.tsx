"use client"

import React, { useState, useEffect } from 'react'
import { Upload, FileText, Settings, AlertCircle, Info, Calendar, BarChart2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useScriptData, type ScriptData } from '@/lib/contexts/script-data-context'
import { useRole } from '@/hooks/use-roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoleGate } from '@/components/auth/role-gate'
import { Roles } from '@/types/globals'

// API endpoint constant
const API_BASE_URL = 'https://thinkaiback.onrender.com'

// Storage keys
const STORAGE_KEYS = {
  SCRIPT_DATA: 'SCRIPT_DATA',
  ONE_LINER_DATA: 'ONE_LINER_DATA',
  CHARACTER_DATA: 'CHARACTER_DATA',
  SCHEDULE_DATA: 'SCHEDULE_DATA',
  BUDGET_DATA: 'BUDGET_DATA',
  STORYBOARD_DATA: 'STORYBOARD_DATA',
  THEME_MODE: 'THEME_MODE'
}

// Role-specific configurations
const ROLE_CONFIGS = {
  writer: {
    title: 'Script Upload - Writer Dashboard',
    description: 'Upload and analyze your script with AI-powered writing tools',
    badge: 'Writer Access - Script Development Tools',
    color: 'purple',
    features: {
      'Scene Analysis': { enabled: true, description: 'Detailed breakdown of your scenes' },
      'Characters': { enabled: true, description: 'Character breakdowns (read-only)' },
      'Scheduling': { enabled: false, description: 'View shooting schedules' },
      'Budgeting': { enabled: false, description: 'Budget planning tools' }
    }
  },
  producer: {
    title: 'Script Upload - Producer Dashboard',
    description: 'Upload scripts and manage complete production workflow',
    badge: 'Producer Access - Full Production Tools',
    color: 'blue',
    features: {
      'Scene Analysis': { enabled: true, description: 'Complete scene breakdown' },
      'Characters': { enabled: true, description: 'Character management' },
      'Scheduling': { enabled: true, description: 'Production scheduling' },
      'Budgeting': { enabled: true, description: 'Budget planning & control' }
    }
  },
  director: {
    title: 'Script Upload - Director Dashboard',
    description: 'Upload scripts and guide creative vision',
    badge: 'Director Access - Creative Control Tools',
    color: 'green',
    features: {
      'Scene Analysis': { enabled: true, description: 'Creative scene analysis' },
      'Characters': { enabled: true, description: 'Character development' },
      'Scheduling': { enabled: true, description: 'Schedule overview' },
      'Budgeting': { enabled: true, description: 'Budget insights' }
    }
  },
  admin: {
    title: 'Script Upload - Admin Dashboard',
    description: 'Full access to all Think AI features',
    badge: 'Admin Access - Complete System Control',
    color: 'red',
    features: {
      'Scene Analysis': { enabled: true, description: 'Complete scene analysis' },
      'Characters': { enabled: true, description: 'Full character management' },
      'Scheduling': { enabled: true, description: 'Master scheduling' },
      'Budgeting': { enabled: true, description: 'Complete budget control' }
    }
  }
}

const FeatureCard = ({ icon, title, description, gradientClass, enabled = true }: {
  icon: React.ElementType
  title: string
  description: string
  gradientClass: string
  enabled?: boolean
}) => {
  const Icon = icon
  
  return (
    <Card className={`flex flex-col items-center text-center ${!enabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div className={`feature-icon-container ${gradientClass} mb-4 p-3 rounded-lg`}>
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {!enabled && (
          <Badge variant="secondary" className="mt-2 text-xs">
            Role Restricted
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

interface SharedUploadScriptProps {
  allowedRoles: Roles[]
  requiredPermission: string
}

export function SharedUploadScript({ allowedRoles, requiredPermission }: SharedUploadScriptProps) {
  const { hasPermission, role } = useRole()
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file')
  const [scriptText, setScriptText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  
  const { updateScriptData } = useScriptData()

  // Get role-specific configuration
  const config = ROLE_CONFIGS[role as keyof typeof ROLE_CONFIGS] || ROLE_CONFIGS.writer

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
      setUploadMode('file')
      setError(null)
    }
  }

  const handleScriptTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScriptText(e.target.value)
    if (e.target.value.trim() !== '') {
      setUploadMode('text')
      setError(null)
    }
  }

  const createBasicScriptData = (content: string): ScriptData => ({
    metadata: {
      global_requirements: {
        equipment: [],
        props: [],
        special_effects: []
      },
      scene_metadata: [{
        scene_number: 1,
        lighting: {
          type: 'natural',
          requirements: []
        },
        props: {},
        technical: {},
        department_notes: {}
      }]
    },
    parsed_data: {
      scenes: [{
        scene_number: 1,
        scene_id: '1',
        location: {
          place: 'UNKNOWN'
        },
        description: content.slice(0, 100) + '...',
        technical_cues: [],
        department_notes: {},
        main_characters: [],
        complexity_score: 1
      }],
      timeline: {
        total_duration: '0',
        average_scene_duration: 0,
        total_pages: 1,
        scene_breakdown: [{
          scene_number: 1,
          start_time: '00:00',
          end_time: '00:05',
          location: 'UNKNOWN',
          characters: [],
          technical_complexity: 1,
          setup_time: 30
        }]
      }
    },
    validation: {
      validation_report: {
        technical_validation: {
          department_conflicts: []
        }
      }
    },
    characters: {
      UNKNOWN: {
        name: 'UNKNOWN',
        description: 'Default character',
        traits: [],
        relationships: []
      }
    }
  })

  const handleScriptSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Clear all existing data before processing new script
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        if (key !== 'THEME_MODE') {
          localStorage.removeItem(key)
        }
      })
      updateScriptData(null)
      console.log('Cleared all previous script data')
    } catch (clearError) {
      console.warn('Error clearing previous data:', clearError)
    }

    try {
      if (uploadMode === 'file' && file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('validation_level', 'lenient')

        try {
          console.log('Making API call to:', `${API_BASE_URL}/api/script/upload`)
          const response = await fetch(`${API_BASE_URL}/api/script/upload`, {
            method: 'POST',
            body: formData,
          })

          console.log('API Response status:', response.status)
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API Error ${response.status}: ${errorText}`)
          }

          const result = await response.json()
          console.log('API Result:', result)

          if (!result.success) {
            throw new Error(result.error || 'API returned error status')
          }

          // Save to local storage
          localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(result.data))
          
          // Update context
          updateScriptData(result.data)
          setSuccess('Script uploaded and analyzed successfully!')
          toast.success('Script uploaded and processed successfully!')
        } catch (apiError) {
          console.warn('API call failed, using local storage:', apiError)
          
          // Process the file locally if API fails
          const reader = new FileReader()
          reader.onload = async (e) => {
            const text = e.target?.result
            const content = typeof text === 'string' ? text : ''
            const basicData = createBasicScriptData(content)
            
            localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(basicData))
            updateScriptData(basicData)
            setSuccess('Script saved locally (offline mode)')
            toast.success('Script saved locally (offline mode)')
          }
          reader.readAsText(file)
        }
      } else if (uploadMode === 'text' && scriptText) {
        try {
          console.log('Making API call to:', `${API_BASE_URL}/api/script/text`)
          const response = await fetch(`${API_BASE_URL}/api/script/text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              script: scriptText,
              validation_level: 'lenient'
            }),
          })

          console.log('API Response status:', response.status)
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API Error ${response.status}: ${errorText}`)
          }

          const result = await response.json()
          console.log('API Result:', result)

          if (!result.success) {
            throw new Error(result.error || 'API returned error status')
          }

          // Save to local storage
          localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(result.data))
          
          // Update context
          updateScriptData(result.data)
          setSuccess('Script analyzed successfully!')
          toast.success('Script text processed successfully!')
        } catch (apiError) {
          // Handle offline mode for text input
          const basicData = createBasicScriptData(scriptText)
          localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(basicData))
          updateScriptData(basicData)
          setSuccess('Script saved locally (offline mode)')
          toast.success('Script saved locally (offline mode)')
        }
      } else {
        setError('Please provide a script file or text before submitting.')
        toast.error('Please provide a script file or text before submitting.')
      }
    } catch (error) {
      console.error('Error uploading script:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while processing the script.')
      toast.error('An error occurred while processing the script.')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if we can submit the script
  const canSubmitScript = 
    !isLoading && ((uploadMode === 'file' && file) || (uploadMode === 'text' && scriptText.trim() !== ''))

  return (
    <RoleGate roles={allowedRoles}>
      <div className="h-full overflow-y-auto p-6 space-y-8">
        {/* Show offline warning */}
        {isOffline && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-yellow-700">
                  You are currently offline. Changes will be saved locally and synced when you're back online.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show success message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-green-500" />
                <p className="text-green-700">{success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`bg-${config.color}-500 text-white p-2 rounded-lg`}>
              <Upload className="h-6 w-6" />
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
          
          <Badge variant="secondary" className="w-fit">
            {config.badge}
          </Badge>
        </div>
        
        {/* Feature Cards - Role specific */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={FileText} 
            title="Scene Analysis"
            description={config.features['Scene Analysis'].description}
            gradientClass="bg-blue-100 text-blue-500"
            enabled={config.features['Scene Analysis'].enabled}
          />
          <FeatureCard 
            icon={Users} 
            title="Characters"
            description={config.features['Characters'].description}
            gradientClass="bg-green-100 text-green-500"
            enabled={config.features['Characters'].enabled}
          />
          <FeatureCard 
            icon={Calendar} 
            title="Scheduling"
            description={config.features['Scheduling'].description}
            gradientClass="bg-purple-100 text-purple-500"
            enabled={config.features['Scheduling'].enabled}
          />
          <FeatureCard 
            icon={BarChart2} 
            title="Budgeting"
            description={config.features['Budgeting'].description}
            gradientClass="bg-red-100 text-red-500"
            enabled={config.features['Budgeting'].enabled}
          />
        </div>
        
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={uploadMode === 'file' ? `border-${config.color}-300 ring-1 ring-${config.color}-200` : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-${config.color}-100 flex items-center justify-center`}>
                  <Upload className={`h-4 w-4 text-${config.color}-600`} />
                </div>
                Upload your script file
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed ${file ? `border-${config.color}-300 bg-${config.color}-50` : 'border-gray-200 bg-gray-50'} rounded-lg p-8 text-center cursor-pointer`}
                onClick={() => document.getElementById('script-upload')?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2 text-gray-700">Drag & drop your file here</h3>
                <p className="text-gray-500 mb-4">
                  or click to browse files
                </p>
                <input
                  type="file"
                  id="script-upload"
                  className="hidden"
                  accept=".pdf,.fountain,.fdx,.txt"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  className={`border-${config.color}-200 text-${config.color}-600 hover:bg-${config.color}-50`}
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById('script-upload')?.click()
                  }}
                >
                  Choose File
                </Button>
                {file && (
                  <p className="mt-3 text-green-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Info className="h-4 w-4" />
                <span>Supported format: .txt (PDF and DOCX support coming soon)</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className={uploadMode === 'text' ? `border-${config.color}-300 ring-1 ring-${config.color}-200` : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-${config.color}-100 flex items-center justify-center`}>
                  <FileText className={`h-4 w-4 text-${config.color}-600`} />
                </div>
                Or paste your script here
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className={`w-full h-64 bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-${config.color}-300 focus:border-${config.color}-300 resize-none`}
                placeholder="Paste your script text here..."
                value={scriptText}
                onChange={handleScriptTextChange}
                onClick={() => setUploadMode('text')}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* API Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              API Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start space-x-2 text-sm">
                <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-blue-700">
                  <p>API Endpoint: {API_BASE_URL}/api</p>
                  <p>Connection Status: {isOffline ? 'Offline (Local Storage Mode)' : 'Online'}</p>
                  <p>Storage: Using browser local storage for data persistence</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              // Clear all data
              Object.values(STORAGE_KEYS).forEach(key => {
                if (key !== 'THEME_MODE') {
                  localStorage.removeItem(key)
                }
              })
              updateScriptData(null)
              setFile(null)
              setScriptText('')
              setError(null)
              setSuccess(null)
              toast.success('All data cleared successfully')
            }}
          >
            Clear All Data
          </Button>
          
          <Button
            onClick={handleScriptSubmit}
            disabled={!canSubmitScript}
            className={`bg-${config.color}-600 hover:bg-${config.color}-700 disabled:bg-gray-300`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </div>
            ) : (
              'Process Script'
            )}
          </Button>
        </div>
      </div>
    </RoleGate>
  )
}