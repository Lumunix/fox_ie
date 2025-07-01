import { writable } from "svelte/store";
import _get from "lodash/get";
import _without from "lodash/without";

// Define the shape of your user store's state.
// Adjust these properties to match your actual data.
export interface UserState {
    id?: number;
    username?: string;
    email?: string;
    followed_tags: string[];
    [key: string]: any; // allow additional dynamic properties like in your Vuex state
}

// Initialize the state from window.context.ownProfile
const initialState: UserState = {
    ..._get(window, ["context", "ownProfile"], {}),
    followed_tags: _get(window, ["context", "ownProfile", "followed_tags"], []),
};

// Create a writable store with the initial state
const userStore = writable<UserState>(initialState);

// Define actions equivalent to your Vuex actions/mutations
function followTag(name: string): void {
    userStore.update((state) => {
        if (!state.followed_tags.includes(name)) {
            state.followed_tags.push(name);
        }
        return state;
    });
}

function unfollowTag(name: string): void {
    userStore.update((state) => {
        if (state.followed_tags.includes(name)) {
            state.followed_tags = _without(state.followed_tags, name);
        }
        return state;
    });
}

// Export the store with the followTag and unfollowTag methods
export const user = {
    subscribe: userStore.subscribe,
    followTag,
    unfollowTag,
};
