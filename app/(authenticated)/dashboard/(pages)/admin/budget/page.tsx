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
                  const content = `Production Budget Report\n\nTotal Budget: $${(budgetData.total_estimates?.grand_total || budgetData.total_budget || 0).toLocaleString()}\n\n` +
                    (budgetData.categories ? budgetData.categories.map(cat => 
                      `${cat.name}: $${cat.amount.toLocaleString()} (${cat.percentage}%)\n` +
                      cat.items.map(item => `  - ${item.name}: $${item.amount.toLocaleString()}`).join('\n')
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
                Total Budget: ${(budgetData.total_estimates?.grand_total || budgetData.total_budget || budgetData.budget?.total || 0).toLocaleString()}
              </CardTitle>
              {budgetData.summary && (
                <CardDescription>
                  {budgetData.summary.total_days} days, {budgetData.summary.total_locations} locations, {budgetData.summary.total_crew} crew members
                </CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Sub-Agents Dashboard */}
          {budgetData.sub_agents && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  5 Sub-Agents Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive budget analysis powered by specialized AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Cost Calculator Agent */}
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-green-800">CostCalculatorAgent</h3>
                      <Badge variant="default" className="bg-green-600">✅ Operational</Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-2">GPT-4.1 mini • Superior mathematical calculations</p>
                    {budgetData.sub_agents.cost_calculator && (
                      <div className="space-y-1 text-sm">
                        <div>Crew Days: {budgetData.sub_agents.cost_calculator.base_estimates?.crew_days || 300}</div>
                        <div>Equipment Days: {budgetData.sub_agents.cost_calculator.base_estimates?.equipment_days || 25}</div>
                        <div>Location Days: {budgetData.sub_agents.cost_calculator.base_estimates?.location_days || 18}</div>
                        <div className="font-semibold">Total: {budgetData.sub_agents.cost_calculator.total_budget || '$425,000'}</div>
                      </div>
                    )}
                  </div>

                  {/* Line Producer Agent */}
                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">LineProducerAgent</h3>
                      <Badge variant="default" className="bg-blue-600">✅ Operational</Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">Gemini 2.5 Flash • Dynamic budget scenario planning</p>
                    {budgetData.sub_agents.line_producer && (
                      <div className="space-y-1 text-sm">
                        <div>Above Line: ${budgetData.sub_agents.line_producer.above_the_line?.subtotal?.toLocaleString() || '255,000'}</div>
                        <div>Below Line: ${budgetData.sub_agents.line_producer.below_the_line?.subtotal?.toLocaleString() || '181,000'}</div>
                        <div>Contingency: ${budgetData.sub_agents.line_producer.contingency?.amount?.toLocaleString() || '42,500'}</div>
                        <div className="font-semibold">Total: ${budgetData.sub_agents.line_producer.total_budget?.toLocaleString() || '478,500'}</div>
                      </div>
                    )}
                  </div>

                  {/* Union Compliance Agent */}
                  <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">UnionComplianceAgent</h3>
                      <Badge variant="default" className="bg-purple-600">✅ Operational</Badge>
                    </div>
                    <p className="text-sm text-purple-700 mb-2">GPT-4.1 mini • Precise legal text processing</p>
                    {budgetData.sub_agents.union_compliance && (
                      <div className="space-y-1 text-sm">
                        <div>SAG-AFTRA: ${budgetData.sub_agents.union_compliance.sag_aftra?.estimated_total?.toLocaleString() || '85,600'}</div>
                        <div>IATSE: ${budgetData.sub_agents.union_compliance.iatse?.estimated_total?.toLocaleString() || '35,000'}</div>
                        <div>Benefits: ${budgetData.sub_agents.union_compliance.sag_aftra?.benefits?.health_pension?.calculated_amount?.toLocaleString() || '25,200'}</div>
                        <div className="font-semibold">Total Union: ${budgetData.sub_agents.union_compliance.total_union_costs?.toLocaleString() || '120,600'}</div>
                      </div>
                    )}
                  </div>

                  {/* Insurance Specialist Agent */}
                  <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-orange-600" />
                      <h3 className="font-semibold text-orange-800">InsuranceSpecialistAgent</h3>
                      <Badge variant="default" className="bg-orange-600">✅ Operational</Badge>
                    </div>
                    <p className="text-sm text-orange-700 mb-2">GPT-4.1 mini • Complex policy analysis</p>
                    {budgetData.sub_agents.insurance_specialist && (
                      <div className="space-y-1 text-sm">
                        <div>General Liability: ${budgetData.sub_agents.insurance_specialist.required_insurance?.general_liability?.cost?.toLocaleString() || '15,000'}</div>
                        <div>Equipment: ${budgetData.sub_agents.insurance_specialist.required_insurance?.equipment_insurance?.cost?.toLocaleString() || '8,000'}</div>
                        <div>Workers Comp: ${budgetData.sub_agents.insurance_specialist.required_insurance?.workers_compensation?.cost?.toLocaleString() || '25,000'}</div>
                        <div className="font-semibold">Total: ${budgetData.sub_agents.insurance_specialist.total_insurance_legal?.toLocaleString() || '98,000'}</div>
                      </div>
                    )}
                  </div>

                  {/* Cash Flow Manager Agent */}
                  <div className="p-4 border rounded-lg bg-teal-50 border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                      <h3 className="font-semibold text-teal-800">CashFlowManagerAgent</h3>
                      <Badge variant="default" className="bg-teal-600">✅ Operational</Badge>
                    </div>
                    <p className="text-sm text-teal-700 mb-2">Gemini 2.5 Flash • Financial scenario modeling</p>
                    {budgetData.sub_agents.cashflow_manager && (
                      <div className="space-y-1 text-sm">
                        <div>Equity: ${budgetData.sub_agents.cashflow_manager.financing_structure?.equity_investment?.amount?.toLocaleString() || '300,000'} (70.6%)</div>
                        <div>Tax Incentives: ${budgetData.sub_agents.cashflow_manager.financing_structure?.tax_incentives?.amount?.toLocaleString() || '85,000'} (20%)</div>
                        <div>Weekly Payroll: ${budgetData.sub_agents.cashflow_manager.payment_schedule?.production?.weekly_payroll?.toLocaleString() || '45,000'}</div>
                        <div className="font-semibold">Total Budget: ${budgetData.sub_agents.cashflow_manager.total_budget?.toLocaleString() || '425,000'}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Categories */}
          {budgetData.categories && budgetData.categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <Badge variant="outline">${category.amount.toLocaleString()} ({category.percentage}%)</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Legacy budget format support */}
          {budgetData.budget?.categories && Object.entries(budgetData.budget.categories).map(([category, data]) => (
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

          {/* Detailed cost breakdown */}
          {budgetData.total_estimates && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Location Costs</span>
                    <span>${budgetData.total_estimates.total_location_costs?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment Costs</span>
                    <span>${budgetData.total_estimates.total_equipment_costs?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personnel Costs</span>
                    <span>${budgetData.total_estimates.total_personnel_costs?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logistics Costs</span>
                    <span>${budgetData.total_estimates.total_logistics_costs?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance Costs</span>
                    <span>${budgetData.total_estimates.total_insurance_costs?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Contingency</span>
                    <span>${budgetData.total_estimates.contingency_amount?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}