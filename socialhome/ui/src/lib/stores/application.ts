import { writable } from 'svelte/store';

// Define the application state interface
interface ApplicationState {
  isUserAuthenticated: boolean;
  currentBrowsingProfileId?: number | string | null;
  profile?: Record<string, unknown> | null;
}

// Helper function to safely access nested properties in the window object (like lodash's get)
const getContextValue = <T>(path: string[], defaultValue?: T): T | undefined => {
  try {
    return path.reduce<any>(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      window
    ) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Initialize the state from the window's context (replicating how the Vuex store was initialized)
const initialState: ApplicationState = {
  isUserAuthenticated: getContextValue<boolean>(['context', 'isUserAuthenticated'], false) as boolean,
  currentBrowsingProfileId: getContextValue<number | string | null>(['context', 'currentBrowsingProfileId'], null),
  profile: getContextValue<Record<string, unknown> | null>(['context', 'profile'], null),
};

// Create a writable Svelte store for the application state
export const applicationStore = writable<ApplicationState>(initialState);

// Additional functionality (if needed) can be handled by subscribing to the store or creating helpers.
