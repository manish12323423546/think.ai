"use client"

import React, { useState, useEffect } from 'react'
import { BarChart2, Download, RefreshCw, AlertCircle, FileText, Loader, DollarSign, Users, Shield, Calculator, TrendingUp, Building } from 'lucide-react'
import { useScriptData, type BudgetData } from '@/lib/contexts/script-data-context'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_BASE_URL = 'https://thinkaiback.onrender.com'
const STORAGE_KEYS = {
  BUDGET_DATA: 'BUDGET_DATA',
}

export default function BudgetPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  
  const { scriptData, scheduleData, budgetData, updateBudgetData } = useScriptData()

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

  const generateBudget = async () => {
    if (!scriptData || !scheduleData) {
      toast.error('Please complete script analysis and schedule generation first.')
      return
    }

    setIsGenerating(true)

    try {
      // Use the comprehensive budget request format for all 5 sub-agents
      const requestData = {
        production_data: {
          script_results: scriptData,
          character_results: {},
          schedule_results: scheduleData
        },
        budget_constraints: {
          crew_rates: {
            director: 2000,
            producer: 1500,
            cinematographer: 1200,
            gaffer: 800,
            sound: 600
          },
          equipment_rates: {
            camera_package: 500,
            lighting_package: 400,
            sound_package: 200,
            grip_package: 300
          },
          location_fees: {
            daily_rate: 1000,
            permit_fees: 500
          },
          contingency_percentage: 15
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/budget`, {
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
      let budgetData: BudgetData
      if (result && 'data' in result) {
        budgetData = result.data
      } else if (result && 'success' in result && result.success) {
        budgetData = result.data
      } else {
        budgetData = result as BudgetData
      }
      
      localStorage.setItem(STORAGE_KEYS.BUDGET_DATA, JSON.stringify(budgetData))
      updateBudgetData(budgetData)
      toast.success('Budget generated successfully!')
    } catch (error) {
      console.error('Error generating budget:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate budget'
      toast.error(`Budget Error: ${errorMessage}`)
      
      // Try to load from localStorage as fallback
      try {
        const storedData = localStorage.getItem(STORAGE_KEYS.BUDGET_DATA)
        if (storedData) {
          const cachedData = JSON.parse(storedData)
          updateBudgetData(cachedData)
          toast.success('Loaded previous budget from local storage')
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

  if (!scheduleData) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Schedule required</h3>
            <Button asChild><a href="/dashboard/admin/schedule">Generate Schedule</a></Button>
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
          <div className="bg-red-500 text-white p-2 rounded-lg">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Production Budget</h1>
            <p className="text-muted-foreground">Generate comprehensive budget estimates</p>
          </div>
        </div>
        <Badge variant="secondary">Budget Planning</Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Generation</CardTitle>
          <CardDescription>
            Generate comprehensive budget estimates based on script and schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={generateBudget} disabled={isGenerating || !scriptData || !scheduleData} className="bg-red-600 hover:bg-red-700">
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating Budget...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Budget
                </>
              )}
            </Button>
            
            {budgetData && (
              <Button
                onClick={() => {
                  const content = `Production Budget Report\n\nTotal Budget: $${(budgetData?.budget?.total || 0).toLocaleString()}\n\n` +
                    (budgetData?.budget?.categories ? Object.entries(budgetData.budget.categories).map(([name, cat]) => 
                      `${name}: $${cat.total.toLocaleString()}\n` +
                      cat.items.map(item => `  - ${item.name}: $${(item.cost * item.quantity).toLocaleString()}`).join('\n')
                    ).join('\n\n') : '')
                  
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'budget-report.txt'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  toast.success('Budget report exported successfully!')
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

      {/* Budget Results */}
      {budgetData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Budget: ${(budgetData?.budget?.total || 0).toLocaleString()}
              </CardTitle>
              <CardDescription>
                Budget breakdown by category
              </CardDescription>
            </CardHeader>
          </Card>


          {/* Budget Categories */}
          {budgetData?.budget?.categories && Object.entries(budgetData.budget.categories).map(([categoryName, category]) => (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle>{categoryName}</CardTitle>
                <Badge variant="outline">${category.total.toLocaleString()}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>${(item.cost * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Legacy budget format support */}
          {budgetData?.budget?.categories && Object.entries(budgetData.budget.categories).map(([category, data]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <Badge variant="outline">${data.total.toLocaleString()}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>${(item.cost * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

        </div>
      )}
    </div>
  )
}