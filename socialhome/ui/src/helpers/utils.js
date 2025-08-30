import router from "@/routes.js"
import { useFetch} from "@vueuse/core"
import { useAuthStore } from "@/stores/auth"
import { useContentsStore } from "@/stores/contents"
import { storeToRefs } from "pinia"

export function extractMentions(text) {
    return Array.from(text.matchAll(/@([\w\-.]+@[\w\-.]+\.[A-Za-z0-9]+)[\W\s]?/g), (m) => m[1].toLowerCase())
}

const serverErrors = {
    "204": "",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout"
}

export async function signOut() {
    const { logout } = useAuthStore()
    const { userIsAuthenticated } = storeToRefs(useAuthStore())
    const { resetContent } = useContentsStore()
    
    await logout()
    await router.push({path: '/'})
    await resetContent()
}

export async function apiFetch(apiEndpoint, fetchOptions, callback)  {
    const { userIsAuthenticated } = storeToRefs(useAuthStore())
    const { data, error, response, statusCode } = await useFetch(apiEndpoint, fetchOptions)
    console.log('apiFetch', statusCode.value, error.value)
    let errorMessage = error.value
    if (!errorMessage) {
        if (callback && statusCode.value !== 204) callback(JSON.parse(data.value))
    }
    else if ((statusCode.value === 401 || statusCode.value === 403) && userIsAuthenticated.value) {
        // assume our session expired and we missed it, so logout
        await signOut()
    }
    else if (response.value) {
        if (response.value?.headers.get('content-type') === 'application/json') {
            const detail =  await response.value.json()
            console.log('detail', detail)
            errorMessage = detail?.message ?? detail?.detail ?? detail?.recipients?.slice(0)[0] ?? detail[0] ?? "Unknown Error"
        }
        else errorMessage = serverErrors[response.value?.status.toString()] ?? "Unknown Error"
        console.log('apiFetch', response, errorMessage)
    } else errorMessage = serverErrors[statusCode.value.toString()] ?? "Unknown Error"
    console.log('apiFetch', response, statusCode.value, errorMessage)
    return { errorMessage, statusCode: statusCode.value }
}
