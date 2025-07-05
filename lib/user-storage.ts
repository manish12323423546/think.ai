/**
 * Client-side user data storage using localStorage
 * This replaces database calls for user preferences and settings
 */

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  membership: 'free' | 'pro'
  completedOnboarding: boolean
  lastActiveProject?: string
  notifications: {
    email: boolean
    inApp: boolean
    marketing: boolean
  }
}

const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  USER_PROJECTS: 'user_projects',
  USER_SETTINGS: 'user_settings'
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  membership: 'free',
  completedOnboarding: false,
  notifications: {
    email: true,
    inApp: true,
    marketing: false
  }
}

export function getUserPreferences(userId?: string): UserPreferences {
  if (typeof window === 'undefined') return defaultPreferences
  
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.USER_PREFERENCES}_${userId || 'default'}`)
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.warn('Failed to load user preferences:', error)
  }
  
  return defaultPreferences
}

export function setUserPreferences(preferences: Partial<UserPreferences>, userId?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const currentPrefs = getUserPreferences(userId)
    const updatedPrefs = { ...currentPrefs, ...preferences }
    localStorage.setItem(`${STORAGE_KEYS.USER_PREFERENCES}_${userId || 'default'}`, JSON.stringify(updatedPrefs))
  } catch (error) {
    console.error('Failed to save user preferences:', error)
  }
}

export function clearUserData(userId?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const keys = Object.values(STORAGE_KEYS)
    keys.forEach(key => {
      localStorage.removeItem(`${key}_${userId || 'default'}`)
    })
  } catch (error) {
    console.error('Failed to clear user data:', error)
  }
}

// Hook for React components
export function useUserPreferences(userId?: string) {
  if (typeof window === 'undefined') {
    return {
      preferences: defaultPreferences,
      updatePreferences: () => {},
      clearPreferences: () => {}
    }
  }

  const preferences = getUserPreferences(userId)
  
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setUserPreferences(updates, userId)
  }
  
  const clearPreferences = () => {
    clearUserData(userId)
  }
  
  return {
    preferences,
    updatePreferences,
    clearPreferences
  }
}