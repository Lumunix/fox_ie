// simple port from the old UI. TODO: turn this into a vue component
import { computed, inject } from 'vue'
import gettext from "@/helpers/gettext"


const min = 60
const hr = min * 60
const day = hr * 24
const month = day * 30 // oh well...
const year = day * 365
const rtf = new Intl.RelativeTimeFormat(navigator.language)
const { $gettext } = gettext

export function getTimeAgo(from) {
    const now = inject('now')
    return computed(() => {
        const rawTimeDiff = Math.round((now.value.getTime() / 1000) - parseInt(from.value, 10))
        let timeDiff = 0
        let period = "second"
        if (rawTimeDiff < 10) {
            return $gettext('now')
        }
        if (rawTimeDiff < min) {
            timeDiff = rawTimeDiff
        } else if (rawTimeDiff < hr) {
            period = "minute"
            timeDiff = Math.round(rawTimeDiff / min)
        } else if (rawTimeDiff < day) {
            period = "hour"
            timeDiff = Math.round(rawTimeDiff / hr)
        } else if (rawTimeDiff < month) {
            period = "day"
            timeDiff = Math.round(rawTimeDiff / day)
        } else if (rawTimeDiff < year) {
            period = "month"
            timeDiff = Math.round(rawTimeDiff / month)
        } else {
            period = "year"
            timeDiff = Math.round(rawTimeDiff / year)
        }
        return rtf.format(-timeDiff, period)
    })
}
