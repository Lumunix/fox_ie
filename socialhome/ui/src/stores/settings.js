import {useFetch} from '@vueuse/core'

let settings = undefined

async function fetch_settings() {
	if (settings) return
	const { data, error, response, statusCode } = await useFetch('/api/settings/', {headers: {accept: 'application/json'}})
	if (!error.value) {
		settings = JSON.parse(data.value)
		console.log('settings', settings)
	} else window.alert('Error fetching settings from the backend!', error.value)
}

await fetch_settings()

export default settings
