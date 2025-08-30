import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCSRFToken } from "@/stores/auth"
import { useFetch } from '@vueuse/core'
import { useToast } from "primevue/usetoast";
import { apiFetch } from "@/helpers/utils";

export const useProfilesStore = defineStore('profiles', () => {
    const profiles = ref({})
    const toast = useToast()
    // Can't use the CSRFToken ref from the auth store since it may not be defined at this stage
    const options = () => {return {
        headers: {Accept: 'application/json; version=2.0', 'X-CSRFToken': getCSRFToken()},
        credentials: 'include'
        }}

    const fetchProfile = async (uuid) => {
        let profileUuid = undefined
        const { errorMessage } = await apiFetch(`/api/profiles/${uuid}/`, options(), (payload) => {
            profileUuid = setProfile(payload)
        })
        if (errorMessage) toast.add({severity: 'error', summary: 'Profile', detail: errorMessage, life: 5000})
        return { errorMessage, profile: profiles.value[profileUuid] }
    }

    const fetchUserProfile = async (username) => {
        let uuid = undefined
        const { errorMessage } = await apiFetch(`/api/users/${username}/`, options(), (payload) => {
            uuid = setProfile(payload)
        })
        return { errorMessage, uuid }
    }

    const requestProfileUpdate = async (uuid) => {
        // avoid issuing a request storm when a broken profile is instantiated
        // by ProfileContainer
        if (profiles.value[uuid].updating) return
        profiles.value[uuid].updating = true
        const { error } = await useFetch(`/api/profiles/${uuid}/schedule_update/`).json()
        if (error.value !== null) {
            console.log('requestsProfileUpdate error:', error.value)
        } else {
            console.log(`profile update requested for ${uuid}`)
        }
    }

    const setProfile = (profile) => {
        profile.updating = false
        if (profiles.value[profile.uuid]) {
            profiles.value[profile.uuid] = Object.assign(profiles.value[profile.uuid], profile)
            delete profiles.value[profile.uuid].followers
            delete profiles.value[profile.uuid].following
        } else {
            profiles.value[profile.uuid] = profile
        }
        return profile.uuid
    }

    const updateProfile = async (uuid, updates) => {
        const { errorMessage } = await apiFetch(`/api/profiles/${uuid}/`, {
            headers: {
                ...options().headers,
                'content-type': 'application/json'
            },
            credentials: options.credentials,
            body: JSON.stringify(updates),
            method: 'PATCH'
        }, (payload) => {
            console.log('update profile', payload)
        })
        if (errorMessage) toast.add({severity: 'error', summary: 'Profile update error', detail: errorMessage, life: 5000})
        return errorMessage
    }

    const reorderProfile = async (index) => {
        const { errorMessage } = await apiFetch('/api/profiles/organize/', {
            headers: {
                ...options().headers,
                'content-type': 'application/json'
            },
            credentials: options.credentials,
            body: JSON.stringify({sort_order: index.toString()}),
            method: 'POST'
        }, (payload) => {
            console.log('reorder profile', payload)
        })
        if (errorMessage) toast.add({severity: 'error', summary: 'Profile organize error', detail: errorMessage, life: 5000})
        return errorMessage
    }
    const followChange = async (uuid, status) => {
        const action = status ? 'follow' : 'unfollow'
        const { error } = await useFetch(`/api/profiles/${uuid}/${action}/`, options()).post()
        if (error.value) {
            toast.add({severity: 'error', summary: `Error (${action})`, detail: error.value, life: 5000})
        } else {
            profiles.value[uuid].user_following = status
        }
    }

    const fetchContacts = async (contactType, uuid) => {
        let apiEndpoint = `/api/profiles/${contactType}/`
        const contacts = profiles.value[uuid][contactType] ?? {list: [], count: undefined, next: undefined}
        console.log('fetchContacts', contacts)
        if (contacts.next) apiEndpoint = contacts.next
        else if (contacts.list.length) return
        const { error } = await apiFetch(apiEndpoint, {...options(), method: 'GET'},
            (payload) => {
            payload.results.forEach((profile) => setProfile(profile))
            Object.assign(contacts, {
                list: [...contacts.list, ...Array.from(payload.results, (profile) => profile.uuid )],
                count: payload.count,
                next: payload.next
            })
            profiles.value[uuid][contactType] = contacts
            })
        if (error) toast.add({severity: 'error', summary: 'Contacts error', details: error, life: 5000})
        return error
    }

    return {
        fetchContacts,
        followChange,
        profiles,
        fetchProfile,
        fetchUserProfile,
        reorderProfile,
        requestProfileUpdate,
        setProfile,
        updateProfile
    }
})