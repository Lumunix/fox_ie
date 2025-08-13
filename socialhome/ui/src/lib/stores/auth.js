// // stores/auth.js
// import { writable } from 'svelte/store';
// import _get from 'lodash/get';
//
// function createAuthStore() {
//     const { subscribe, set, update } = writable({
//         isUserAuthenticated: _get(window, ["context", "isUserAuthenticated"], false),
//         currentBrowsingProfileId: _get(window, ["context", "currentBrowsingProfileId"]),
//         profile: _get(window, ["context", "profile"])
//     });
//
//     return {
//         subscribe,
//         setAuthentication: (/** @type {any} */ isAuth) => update(state => ({ ...state, isUserAuthenticated: isAuth })),
//         setProfile: (/** @type {any} */ newProfile) => update(state => ({ ...state, profile: newProfile })),
//         reset: () => set({
//             isUserAuthenticated: false,
//             currentBrowsingProfileId: null,
//             profile: null
//         })
//     };
// }
//
// export const authStore = createAuthStore();
