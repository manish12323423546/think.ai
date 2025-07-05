// Storage service for local persistence of script data
export const STORAGE_KEYS = {
  SCRIPT_DATA: 'scriptData',
  ONE_LINER_DATA: 'oneLinerData',
  CHARACTER_DATA: 'characterData',
  SCHEDULE_DATA: 'scheduleData',
  STORYBOARD_DATA: 'storyboardData',
  BUDGET_DATA: 'budgetData'
} as const;

// Helper function to save data to localStorage
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch storage event for cross-tab synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(data),
      storageArea: localStorage
    }));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

// Helper function to get data from localStorage
export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

// Get stored script data
export function getStoredScriptData() {
  return getFromLocalStorage(STORAGE_KEYS.SCRIPT_DATA);
}

// Get stored one-liner data
export function getStoredOneLinerData() {
  return getFromLocalStorage(STORAGE_KEYS.ONE_LINER_DATA);
}

// Get stored character data
export function getStoredCharacterData() {
  return getFromLocalStorage(STORAGE_KEYS.CHARACTER_DATA);
}

// Get stored schedule data
export function getStoredScheduleData() {
  return getFromLocalStorage(STORAGE_KEYS.SCHEDULE_DATA);
}

// Get stored storyboard data
export function getStoredStoryboardData() {
  return getFromLocalStorage(STORAGE_KEYS.STORYBOARD_DATA);
}

// Get stored budget data
export function getStoredBudgetData() {
  return getFromLocalStorage(STORAGE_KEYS.BUDGET_DATA);
}

// Clear all stored data
export function clearAllStoredData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}