// adapted from https://www.photondesigner.com/articles/vue-auth#create-frontendsrcpageshomevue
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useFetch, useLocalStorage } from '@vueuse/core'
import { useProfilesStore } from '@/stores/profiles'
import { apiFetch } from "@/helpers/utils"
import { useToast } from "primevue/usetoast";
import ponyUrl from '@/assets/pony100.png'

export function getCSRFToken() {
    /*
    We get the CSRF token from the cookie to include in our requests.
    This is necessary for CSRF protection in Django.
     */
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    if (cookieValue === null) {
        throw 'Missing CSRF cookie.'
    }
    return cookieValue;
}

export async function setCsrfToken() {
    await useFetch('/api/spa-auth/set-csrf-token', {credentials: 'include'}).get()
    }

export const useAuthStore = defineStore('auth', () => {
    const authState = useLocalStorage('authenticated-user', {user: null,
        isAuthenticated: false,
        expiry: null,
        lastLogin: null
    })
    const toast = useToast()
    const { setProfile } = useProfilesStore()
    let sessionTimeout = null

    const user = computed(() => authState.value.user)
    const userIcon = computed(() => user.value?.avatar_url || ponyUrl)
    const userIsAuthenticated = computed(() => authState.value.isAuthenticated)
    const followedTags = computed(() => user.value.followed_tags ?? [])
    const authError = ref('')
    const CSRFToken = ref()
    // catch the session expiration 30 seconds before the backend
    // TODO: get this from the backend
    const twoWeeks = 14*24*60*60*1000-30000

    const isAuthenticatedUser = (uuid) => user.value?.uuid === uuid &&  userIsAuthenticated.value

    const login = async (username, password) => {
        const { errorMessage } = await apiFetch('/api/spa-auth/login', {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRFToken.value,
            },
            credentials: "include",
            body: JSON.stringify({username: username.value, password: password.value}),
            method: 'POST'
        }, (payload) => {
            authState.value = {user: payload, isAuthenticated: true, lastLogin: Date.now(), expiry: twoWeeks}
            sessionTimeout = setTimeout(() => logout(), twoWeeks)
            setProfile(authState.value.user)
            CSRFToken.value = getCSRFToken()
            console.log('authenticated profile', payload)
        })
        authError.value = errorMessage
        if (!errorMessage) await getAuthenticatedUserPreferences()
        
    }

    const logout = async () => {
        const { error } = await useFetch('/api/spa-auth/logout', {
            headers: {
                'X-CSRFToken': CSRFToken.value
            },
            credentials: "include"
        })
        if (!error.value) {
            authState.value = {user: null, isAuthenticated: false, lastLogin: null, expiry: null}
            clearTimeout(sessionTimeout)
        } else {
            authError.value = error.value
        }
    }

    const getLandingPage = () => {
        if (!user.value?.preferences) return undefined
        const landingPage = user.value.preferences.results.find(pref => pref.name === 'landing_page')
        switch(landingPage.value) {
            case 'profile':
                return `/p/${user.value.uuid}/profile-pinned`
                break
            case 'profile_all':
                return `/p/${user.value.uuid}/profile-all`
                break
            default:
                return `/streams/${landingPage.value}`
        }
    }

    const getAuthenticatedUserPreferences = async () => {
        const options = {headers: {accept: 'application/json'}, credentials: "include"}
        const { errorMessage } = await apiFetch(`/api/preferences/user/`, options, (payload) => {
          console.log('preferences', payload)
          authState.value.user.preferences = payload
        })
    }

    const getAuthenticatedUser = async () => {
        await setCsrfToken()
        CSRFToken.value = getCSRFToken()
        const { errorMessage } = await apiFetch('/api/spa-auth/user', {
             headers: {
                'X-CSRFToken': CSRFToken.value
            },
            credentials: "include"
        }, (payload) => {
            authState.value = {user: payload, isAuthenticated: true, lastLogin: Date.now(), expiry: twoWeeks}
            sessionTimeout = setTimeout(() => logout(), twoWeeks)
            setProfile(authState.value.user)
        })
        if (!errorMessage) await getAuthenticatedUserPreferences()
    }

    if (authState.value.user) {
        const newExpiry = authState.value.expiry - (Date.now() - authState.value.lastLogin)
        if (newExpiry > 0) {
            authState.value.expiry = newExpiry
            setProfile(authState.value.user)
            sessionTimeout = setTimeout(() => logout(), newExpiry)
        } else logout()
    }

    const tagFollowChange = async (tagName, tagUuid) => {
        const action = followedTags.value.includes(tagName) ? 'unfollow' : 'follow'
        const { errorMessage } = await apiFetch(`/api/tags/${tagUuid}/${action}/`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {'X-CSRFToken': CSRFToken.value}
            }, () => {
                if (action === 'follow') user.value.followed_tags.push(tagName)
                else {
                    const idx = user.value.followed_tags.indexOf(tagName)
                    user.value.followed_tags.splice(idx, 1)
                }
            })
        if (errorMessage) toast.add({severity: 'error', summary: 'Follow error', detail: `Error ${action}ing the ${tagName} tag`, life: 5000})

    }

    return {
        authError,
        CSRFToken,
        followedTags,
        getAuthenticatedUser,
        getAuthenticatedUserPreferences,
        getLandingPage,
        isAuthenticatedUser,
        login,
        logout,
        tagFollowChange,
        user,
        userIcon,
        userIsAuthenticated
    }
})
