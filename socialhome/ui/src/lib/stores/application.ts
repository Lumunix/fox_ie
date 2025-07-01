import { writable } from 'svelte/store';

interface ApplicationState {
  isUserAuthenticated: boolean;
  currentBrowsingProfileId?: number | string | null;
  profile?: Record<string, unknown> | null;
}

// Safe access from window
const getContextValue = <T>(path: string[], defaultValue?: T): T | undefined => {
  try {
    return path.reduce<any>((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), window) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Initialize state with window context
const initialState: ApplicationState = {
  isUserAuthenticated: getContextValue<boolean>(['context', 'isUserAuthenticated'], false) as boolean,
  currentBrowsingProfileId: getContextValue<number | string | null>(['context', 'currentBrowsingProfileId'], null),
  profile: getContextValue<Record<string, unknown> | null>(['context', 'profile'], null),
};

// Create Svelte store
export const applicationStore = writable<ApplicationState>(initialState);
