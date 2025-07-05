"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types from oldui
export interface ScriptData {
  metadata: {
    global_requirements: {
      equipment: string[]
      props: string[]
      special_effects: string[]
    }
    scene_metadata: Array<{
      scene_number: number
      lighting?: {
        type?: string
        requirements?: string[]
      }
      props?: Record<string, string[]>
      technical?: Record<string, string[]>
      department_notes: Record<string, string[]>
    }>
  }
  parsed_data: {
    scenes: Array<{
      scene_number: number
      scene_id?: string
      location?: {
        place: string
      }
      description?: string
      time?: string
      technical_cues?: string[]
      department_notes: Record<string, string[]>
      main_characters: string[]
      complexity_score: number
    }>
    timeline?: {
      total_duration: string
      average_scene_duration: number
      total_pages: number
      scene_breakdown: Array<{
        scene_number: number
        start_time: string
        end_time: string
        location: string
        characters: string[]
        technical_complexity: number
        setup_time: number
      }>
    }
  }
  validation: {
    validation_report: {
      technical_validation: {
        department_conflicts: Array<{
          scene_number: number
          conflict: string
        }>
      }
    }
  }
  characters: Record<string, {
    name: string
    description: string
    traits: string[]
    relationships: string[]
  }>
}

export interface OneLinerData {
  scenes: Array<{
    scene_number: number
    one_liner: string
    description: string
    location: string
    time: string
  }>
}

export interface CharacterData {
  characters: Record<string, {
    name: string
    objective: string
    relationships: Array<{
      character: string
      relationship: string
    }>
    scenes: number[]
    arc: string
  }>
}

export interface ScheduleData {
  schedule: Array<{
    day: number
    date: string
    scenes: Array<{
      scene_number: number
      location: string
      time: string
      setup_time: number
      shoot_time: number
    }>
  }>
}

export interface StoryboardData {
  storyboards: Array<{
    scene_number: number
    panels: Array<{
      panel_number: number
      description: string
      image_url?: string
    }>
  }>
}

export interface BudgetData {
  budget: {
    categories: Record<string, {
      items: Array<{
        name: string
        cost: number
        quantity: number
      }>
      total: number
    }>
    total: number
  }
}

interface ScriptDataContextType {
  scriptData: ScriptData | null
  oneLinerData: OneLinerData | null
  characterData: CharacterData | null
  scheduleData: ScheduleData | null
  storyboardData: StoryboardData | null
  budgetData: BudgetData | null
  updateScriptData: (data: ScriptData | null) => void
  updateOneLinerData: (data: OneLinerData | null) => void
  updateCharacterData: (data: CharacterData | null) => void
  updateScheduleData: (data: ScheduleData | null) => void
  updateStoryboardData: (data: StoryboardData | null) => void
  updateBudgetData: (data: BudgetData | null) => void
  canProceedToTab: (tabName: string) => boolean
}

const ScriptDataContext = createContext<ScriptDataContextType | undefined>(undefined)

// Storage keys
const STORAGE_KEYS = {
  SCRIPT_DATA: 'SCRIPT_DATA',
  ONE_LINER_DATA: 'ONE_LINER_DATA',
  CHARACTER_DATA: 'CHARACTER_DATA',
  SCHEDULE_DATA: 'SCHEDULE_DATA',
  BUDGET_DATA: 'BUDGET_DATA',
  STORYBOARD_DATA: 'STORYBOARD_DATA',
}

// Helper functions for localStorage
const getStoredData = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setStoredData = <T,>(key: string, data: T | null): void => {
  if (typeof window === 'undefined') return
  try {
    if (data === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error)
  }
}

export function ScriptDataProvider({ children }: { children: ReactNode }) {
  const [scriptData, setScriptData] = useState<ScriptData | null>(null)
  const [oneLinerData, setOneLinerData] = useState<OneLinerData | null>(null)
  const [characterData, setCharacterData] = useState<CharacterData | null>(null)
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null)
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    setScriptData(getStoredData<ScriptData>(STORAGE_KEYS.SCRIPT_DATA))
    setOneLinerData(getStoredData<OneLinerData>(STORAGE_KEYS.ONE_LINER_DATA))
    setCharacterData(getStoredData<CharacterData>(STORAGE_KEYS.CHARACTER_DATA))
    setScheduleData(getStoredData<ScheduleData>(STORAGE_KEYS.SCHEDULE_DATA))
    setStoryboardData(getStoredData<StoryboardData>(STORAGE_KEYS.STORYBOARD_DATA))
    setBudgetData(getStoredData<BudgetData>(STORAGE_KEYS.BUDGET_DATA))
  }, [])

  const updateScriptData = (data: ScriptData | null) => {
    setScriptData(data)
    setStoredData(STORAGE_KEYS.SCRIPT_DATA, data)
  }

  const updateOneLinerData = (data: OneLinerData | null) => {
    setOneLinerData(data)
    setStoredData(STORAGE_KEYS.ONE_LINER_DATA, data)
  }

  const updateCharacterData = (data: CharacterData | null) => {
    setCharacterData(data)
    setStoredData(STORAGE_KEYS.CHARACTER_DATA, data)
  }

  const updateScheduleData = (data: ScheduleData | null) => {
    setScheduleData(data)
    setStoredData(STORAGE_KEYS.SCHEDULE_DATA, data)
  }

  const updateStoryboardData = (data: StoryboardData | null) => {
    setStoryboardData(data)
    setStoredData(STORAGE_KEYS.STORYBOARD_DATA, data)
  }

  const updateBudgetData = (data: BudgetData | null) => {
    setBudgetData(data)
    setStoredData(STORAGE_KEYS.BUDGET_DATA, data)
  }

  const canProceedToTab = (tabName: string): boolean => {
    switch (tabName) {
      case 'upload-script':
        return true
      case 'script-analysis':
        return !!scriptData
      case 'one-liner':
        return !!scriptData
      case 'character-breakdown':
        return !!scriptData && !!oneLinerData
      case 'schedule':
        return !!scriptData && !!characterData
      case 'budget':
        return !!scriptData && !!scheduleData
      case 'storyboard':
        return !!scriptData
      case 'project-overview':
        return !!scriptData
      default:
        return false
    }
  }

  const value: ScriptDataContextType = {
    scriptData,
    oneLinerData,
    characterData,
    scheduleData,
    storyboardData,
    budgetData,
    updateScriptData,
    updateOneLinerData,
    updateCharacterData,
    updateScheduleData,
    updateStoryboardData,
    updateBudgetData,
    canProceedToTab
  }

  return (
    <ScriptDataContext.Provider value={value}>
      {children}
    </ScriptDataContext.Provider>
  )
}

export function useScriptData() {
  const context = useContext(ScriptDataContext)
  if (context === undefined) {
    throw new Error('useScriptData must be used within a ScriptDataProvider')
  }
  return context
}