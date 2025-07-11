"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Users, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'

interface BreakdownCard {
  scene_number: string
  location: string
  location_type: string
  time_of_day: string
  estimated_hours: number
  adjusted_eighths: number
  complexity_level: "simple" | "moderate" | "complex"
  complexity_factor: number
  estimated_crew_hours: number
  crew_estimate: {
    base_crew: number
    additional_crew: number
    total_crew: number
    complexity_multiplier: number
  }
  cast_requirements: string[]
  props_needed: string[]
  wardrobe_notes: string[]
  equipment_needed: string[]
  special_requirements: string[]
  technical_notes: string[]
  scheduling_priority: "low" | "medium" | "high"
  weather_dependent: boolean
  night_shoot: boolean
}

interface BreakdownCardsProps {
  breakdownCards: BreakdownCard[]
  summaryStats?: {
    total_cards: number
    complexity_distribution: {
      simple: number
      moderate: number
      complex: number
    }
    estimated_crew_days: number
    special_requirements: string[]
  }
}

const ComplexityBadge = ({ complexity }: { complexity: string }) => {
  const variants = {
    simple: { variant: "outline" as const, color: "text-green-600 border-green-600", icon: CheckCircle },
    moderate: { variant: "outline" as const, color: "text-yellow-600 border-yellow-600", icon: Clock },
    complex: { variant: "outline" as const, color: "text-red-600 border-red-600", icon: AlertTriangle }
  }
  
  const config = variants[complexity as keyof typeof variants] || variants.simple
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
    </Badge>
  )
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    low: { variant: "outline" as const, color: "text-gray-600 border-gray-600" },
    medium: { variant: "outline" as const, color: "text-blue-600 border-blue-600" },
    high: { variant: "destructive" as const, color: "" }
  }
  
  const config = variants[priority as keyof typeof variants] || variants.low
  
  return (
    <Badge variant={config.variant} className={config.color}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </Badge>
  )
}

export function BreakdownCards({ breakdownCards, summaryStats }: BreakdownCardsProps) {
  if (!breakdownCards || breakdownCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎬 Scene Breakdown Cards</CardTitle>
          <CardDescription>No breakdown cards available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Upload a script to generate scene breakdown cards
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {summaryStats && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Breakdown Summary</CardTitle>
            <CardDescription>Overview of all scene breakdown cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summaryStats.total_cards}</div>
                <div className="text-sm text-muted-foreground">Total Scenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summaryStats.estimated_crew_days.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Crew Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summaryStats.complexity_distribution.complex}</div>
                <div className="text-sm text-muted-foreground">Complex Scenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summaryStats.special_requirements.length}</div>
                <div className="text-sm text-muted-foreground">Special Requirements</div>
              </div>
            </div>
            
            {/* Complexity Distribution */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Complexity Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Simple</span>
                  <span className="text-sm">{summaryStats.complexity_distribution.simple} scenes</span>
                </div>
                <Progress 
                  value={(summaryStats.complexity_distribution.simple / summaryStats.total_cards) * 100} 
                  className="h-2"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-600">Moderate</span>
                  <span className="text-sm">{summaryStats.complexity_distribution.moderate} scenes</span>
                </div>
                <Progress 
                  value={(summaryStats.complexity_distribution.moderate / summaryStats.total_cards) * 100} 
                  className="h-2"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Complex</span>
                  <span className="text-sm">{summaryStats.complexity_distribution.complex} scenes</span>
                </div>
                <Progress 
                  value={(summaryStats.complexity_distribution.complex / summaryStats.total_cards) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Breakdown Cards */}
      <Card>
        <CardHeader>
          <CardTitle>🎬 Scene Breakdown Cards</CardTitle>
          <CardDescription>Detailed production requirements for each scene</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {breakdownCards.map((card, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Scene {card.scene_number}</h3>
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {card.location_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <ComplexityBadge complexity={card.complexity_level} />
                      <PriorityBadge priority={card.scheduling_priority} />
                    </div>
                  </div>

                  {/* Location and Time */}
                  <div className="text-sm text-muted-foreground mb-3">
                    {card.location} - {card.time_of_day}
                    {card.weather_dependent && (
                      <Badge variant="outline" className="ml-2 text-blue-600">
                        Weather Dependent
                      </Badge>
                    )}
                    {card.night_shoot && (
                      <Badge variant="outline" className="ml-2 text-purple-600">
                        Night Shoot
                      </Badge>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-semibold">{card.estimated_hours}h</div>
                      <div className="text-xs text-muted-foreground">Est. Hours</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-semibold">{card.adjusted_eighths}</div>
                      <div className="text-xs text-muted-foreground">Eighths</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-semibold">{card.crew_estimate.total_crew}</div>
                      <div className="text-xs text-muted-foreground">Total Crew</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-semibold">{card.estimated_crew_hours}</div>
                      <div className="text-xs text-muted-foreground">Crew Hours</div>
                    </div>
                  </div>

                  {/* Enhanced Requirements Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Cast Requirements - Enhanced */}
                    {card.cast_requirements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Cast
                        </h4>
                        <div className="space-y-1">
                          {card.cast_requirements.map((actor, i) => (
                            <div key={i} className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded border">
                              {actor}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Props - Enhanced */}
                    {card.props_needed.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Props</h4>
                        <div className="space-y-1">
                          {card.props_needed.map((prop, i) => (
                            <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs bg-green-50 dark:bg-green-950/20">
                              {prop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wardrobe - Enhanced */}
                    {card.wardrobe_notes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Wardrobe</h4>
                        <div className="space-y-1">
                          {card.wardrobe_notes.map((note, i) => (
                            <div key={i} className="text-xs bg-purple-50 dark:bg-purple-950/20 p-2 rounded border">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equipment - Enhanced */}
                    {card.equipment_needed.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Equipment</h4>
                        <div className="space-y-1">
                          {card.equipment_needed.map((equipment, i) => (
                            <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs bg-orange-50 dark:bg-orange-950/20">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Special Requirements - Enhanced */}
                  {card.special_requirements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                        Special Requirements
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {card.special_requirements.map((req, i) => (
                          <div key={i} className="text-xs bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-2 text-red-500 flex-shrink-0" />
                            {req}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Notes - Enhanced */}
                  {card.technical_notes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Technical Notes</h4>
                      <div className="space-y-1">
                        {card.technical_notes.map((note, i) => (
                          <div key={i} className="text-xs bg-gray-50 dark:bg-gray-950/20 p-2 rounded border">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Crew Breakdown */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Crew Breakdown</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Base Crew: {card.crew_estimate.base_crew}</span>
                      <span>Additional: {card.crew_estimate.additional_crew}</span>
                      <span>Multiplier: {card.crew_estimate.complexity_multiplier}×</span>
                      <span>Total: {card.crew_estimate.total_crew}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}