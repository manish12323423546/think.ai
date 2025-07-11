"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  FileText, 
  Users, 
  BarChart3, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  Download,
  Play
} from 'lucide-react'

// Import our new 3-section components
import { BreakdownCards } from '@/components/script-analysis/breakdown-cards'
import { DepartmentAnalysis } from '@/components/script-analysis/department-analysis'
import { Reports } from '@/components/script-analysis/reports'

// API endpoint for SD1 backend
const SD1_API_URL = '/api/sd1'

interface ProcessingStatus {
  status: string
  current_stage: string
  completed_stages: string[]
  agents_used: string[]
  total_processing_time?: number
}

interface ScriptAnalysisData {
  success: boolean
  message: string
  timestamp: string
  breakdown_cards: any[]
  breakdown_summary: any
  department_analysis: any
  department_coordination: any
  reports: any
  processing_status: ProcessingStatus
  saved_paths?: any
}

const ProcessingIndicator = ({ status }: { status: ProcessingStatus | null }) => {
  if (!status) return null

  const stages = [
    { key: 'script_parsing', name: 'Script Parsing', icon: FileText },
    { key: 'eighths_calculation', name: 'Eighths Calculator', icon: BarChart3 },
    { key: 'breakdown_cards', name: 'Breakdown Cards', icon: FileText },
    { key: 'department_coordination', name: 'Department Coordination', icon: Users },
    { key: 'data_integration', name: 'Data Integration', icon: CheckCircle }
  ]

  const currentStageIndex = stages.findIndex(stage => stage.key === status.current_stage)
  const completedStages = status.completed_stages || []

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Loader className="w-5 h-5 animate-spin text-blue-600" />
          )}
          Processing Status
        </CardTitle>
        <CardDescription>
          3-Agent Sequential Pipeline: {status.agents_used?.length || 3} agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(completedStages.length / stages.length) * 100}%` 
              }}
            />
          </div>

          {/* Stage Details */}
          <div className="grid gap-2">
            {stages.map((stage, index) => {
              const isCompleted = completedStages.includes(stage.key)
              const isCurrent = stage.key === status.current_stage
              const Icon = stage.icon

              return (
                <div 
                  key={stage.key}
                  className={`flex items-center gap-3 p-2 rounded ${
                    isCurrent ? 'bg-blue-50 dark:bg-blue-950/20' : 
                    isCompleted ? 'bg-green-50 dark:bg-green-950/20' : 
                    'bg-muted/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-600 text-white' :
                    isCurrent ? 'bg-blue-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <Icon className={`w-4 h-4 ${
                    isCompleted ? 'text-green-600' :
                    isCurrent ? 'text-blue-600' :
                    'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isCompleted ? 'text-green-700 dark:text-green-300' :
                    isCurrent ? 'text-blue-700 dark:text-blue-300' :
                    'text-gray-500'
                  }`}>
                    {stage.name}
                  </span>
                  {isCurrent && (
                    <Badge variant="outline" className="ml-auto text-blue-600">
                      Processing...
                    </Badge>
                  )}
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Processing Time */}
          {status.total_processing_time && (
            <div className="text-center pt-2">
              <Badge variant="outline">
                Total time: {status.total_processing_time.toFixed(1)}s
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const EmptyState = () => (
  <div className="text-center py-16">
    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2">No Script Analysis Available</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
      Upload a script to get started with comprehensive production analysis using our 3-agent pipeline.
    </p>
    <Button asChild>
      <a href="/dashboard/admin/upload-script" className="flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Upload Script
      </a>
    </Button>
  </div>
)

const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <Card className="border-red-200 dark:border-red-800">
    <CardContent className="p-8">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Analysis
          </Button>
          <Button asChild>
            <a href="/dashboard/admin/upload-script">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Script
            </a>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function ScriptAnalysisPage() {
  const [analysisData, setAnalysisData] = useState<ScriptAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load analysis data from localStorage or API
  const loadAnalysisData = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, try to get from localStorage
      const storedData = localStorage.getItem('script_analysis_data')
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          if (parsed && parsed.success) {
            setAnalysisData(parsed)
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('Failed to parse stored data:', e)
        }
      }

      // If no valid stored data, check if we have a script to process
      const storedScript = localStorage.getItem('SCRIPT_DATA')
      if (storedScript) {
        try {
          const scriptData = JSON.parse(storedScript)
          if (scriptData && (scriptData.script_text || scriptData.script)) {
            // Auto-process the script
            await processScript(scriptData.script_text || scriptData.script, 'text')
            return
          }
        } catch (e) {
          console.error('Failed to parse script data:', e)
        }
      }

      // No data available
      setLoading(false)
    } catch (err) {
      console.error('Error loading analysis data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analysis data')
      setLoading(false)
    }
  }

  // Process script through SD1 3-agent pipeline
  const processScript = async (scriptText: string, inputType: string = 'text') => {
    try {
      setIsProcessing(true)
      setError(null)

      toast.info('Starting 3-agent pipeline processing...')

      const response = await fetch(`${SD1_API_URL}/script/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: scriptText,
          input_type: inputType,
          validation_level: 'lenient',
          department_focus: ['camera', 'sound', 'lighting', 'art', 'wardrobe', 'special_effects']
        })
      })

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setAnalysisData(result)
        // Store in localStorage for persistence
        localStorage.setItem('script_analysis_data', JSON.stringify(result))
        toast.success('Script analysis completed successfully!')
      } else {
        throw new Error(result.message || 'Processing failed')
      }
    } catch (err) {
      console.error('Error processing script:', err)
      const errorMessage = err instanceof Error ? err.message : 'Processing failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
      setLoading(false)
    }
  }

  // Retry processing
  const handleRetry = () => {
    const storedScript = localStorage.getItem('SCRIPT_DATA')
    if (storedScript) {
      try {
        const scriptData = JSON.parse(storedScript)
        if (scriptData && (scriptData.script_text || scriptData.script)) {
          processScript(scriptData.script_text || scriptData.script, 'text')
          return
        }
      } catch (e) {
        console.error('Failed to parse script data for retry:', e)
      }
    }
    
    toast.error('No script data available for retry. Please upload a new script.')
  }

  // Download reports
  const downloadReports = () => {
    if (!analysisData) return

    const reportData = {
      timestamp: analysisData.timestamp,
      breakdown_cards: analysisData.breakdown_cards,
      department_analysis: analysisData.department_analysis,
      reports: analysisData.reports
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `script-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Reports downloaded successfully!')
  }

  useEffect(() => {
    loadAnalysisData()
  }, [])

  if (loading && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Loader className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-medium mb-2">Loading Analysis...</h3>
          <p className="text-muted-foreground">Please wait while we load your script analysis.</p>
        </div>
      </div>
    )
  }

  if (error && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ErrorState error={error} onRetry={handleRetry} />
        </div>
      </div>
    )
  }

  if (!analysisData && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <EmptyState />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">🎬 Script Analysis</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive production analysis powered by 3-agent ADK pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadAnalysisData} disabled={isProcessing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {analysisData && (
              <Button onClick={downloadReports}>
                <Download className="w-4 h-4 mr-2" />
                Download Reports
              </Button>
            )}
            <Button asChild>
              <a href="/dashboard/admin/upload-script">
                <Upload className="w-4 h-4 mr-2" />
                New Analysis
              </a>
            </Button>
          </div>
        </div>

        {/* Processing Status */}
        {(isProcessing || analysisData?.processing_status) && (
          <ProcessingIndicator 
            status={isProcessing ? 
              { status: 'processing', current_stage: 'script_parsing', completed_stages: [], agents_used: ['ADKEighthsCalculatorAgent', 'SceneBreakdownCardsAgent', 'DepartmentCoordinatorAgent'] } :
              analysisData?.processing_status || null
            } 
          />
        )}

        {/* Main Content - 3 Clean Sections */}
        {analysisData && !isProcessing && (
          <Tabs defaultValue="breakdown-cards" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="breakdown-cards" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Breakdown Cards
              </TabsTrigger>
              <TabsTrigger value="department-analysis" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Department Analysis
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Section 1: Breakdown Cards */}
            <TabsContent value="breakdown-cards">
              <BreakdownCards 
                breakdownCards={analysisData.breakdown_cards || []}
                summaryStats={analysisData.breakdown_summary?.summary_statistics}
              />
            </TabsContent>

            {/* Section 2: Department Analysis */}
            <TabsContent value="department-analysis">
              <DepartmentAnalysis 
                departmentAnalysis={analysisData.department_analysis || {}}
                resourceAllocation={analysisData.department_coordination?.resource_allocation}
                coordinationRecommendations={analysisData.department_coordination?.coordination_recommendations}
              />
            </TabsContent>

            {/* Section 3: Reports */}
            <TabsContent value="reports">
              <Reports reports={analysisData.reports || {}} />
            </TabsContent>
          </Tabs>
        )}

        {/* Success Summary */}
        {analysisData && !isProcessing && (
          <Card className="mt-8 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Analysis Complete
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    {analysisData.message} • Generated {new Date(analysisData.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisData.breakdown_cards?.length || 0}
                  </div>
                  <div className="text-xs text-green-600">scenes analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}