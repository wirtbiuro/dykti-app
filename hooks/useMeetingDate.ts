import { DateTime } from 'luxon'
import { useState } from 'react'

export default (meetingDate: string | undefined) => {
    const [selectedDate, setSelectedDate] = useState<DateTime>(
        meetingDate ? DateTime.fromISO(meetingDate) : DateTime.now()
    )

    return [selectedDate, setSelectedDate] as const
}
