// src/lib/stores/contacts.ts
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import axios, { AxiosInstance } from "axios";

interface Contact {
  // adjust to your actual contact schema
  id: number;
  name: string;
}

interface ContactsList {
  count: number;
  next: string | null;
  contacts: Contact[];
}

interface ContactsState {
  following: ContactsList;
  followers: ContactsList;
}

function createInitialContactsList(): ContactsList {
  return { count: 1, next: null, contacts: [] };
}

function createContactsState(): ContactsState {
  return {
    following: createInitialContactsList(),
    followers: createInitialContactsList(),
  };
}

// Create the writable store with initial state
const contactsStore: Writable<ContactsState> = writable(createContactsState());

// Helper function for processing success response
function processSuccess(stateTarget: ContactsList, data: any) {
  stateTarget.count = data.count;
  stateTarget.next =
    typeof data.next === "string"
      ? new URL(data.next).searchParams.get("page")
      : null;
  stateTarget.contacts.push(...data.results);
}

// Replace this with your actual API routes object
const Urls: Record<string, () => string> = {
  "api:profile-followers": () => "/api/profile-followers/",
  "api:profile-following": () => "/api/profile-following/",
};

// Build URL with optional pagination parameters
function getContactUrl(key: string, page?: number, pageSize?: number): string {
  const baseUrl = Urls[key]();
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (pageSize !== undefined) params.append("page_size", pageSize.toString());
  return params.toString() ? `${baseUrl}?${params}` : baseUrl;
}

// Actions
async function fetchFollowers(
  axiosInstance: AxiosInstance,
  page?: number,
  pageSize?: number
): Promise<void> {
  const url = getContactUrl("api:profile-followers", page, pageSize);
  const response = await axiosInstance.get(url);
  contactsStore.update((state) => {
    processSuccess(state.followers, response.data);
    return state;
  });
}

async function fetchFollowing(
  axiosInstance: AxiosInstance,
  page?: number,
  pageSize?: number
): Promise<void> {
  const url = getContactUrl("api:profile-following", page, pageSize);
  const response = await axiosInstance.get(url);
  contactsStore.update((state) => {
    processSuccess(state.following, response.data);
    return state;
  });
}

export {
  contactsStore,
  fetchFollowers,
  fetchFollowing,
};
