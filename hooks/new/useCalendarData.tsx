import { DateTime } from 'luxon'
import { useState, useEffect, ChangeEvent } from 'react'

interface IuseCalendarDataProps {
    selectedDate?: DateTime
    withTime?: boolean
    zone?: string
}

export const useCalendarData = ({ selectedDate, withTime = false, zone = 'Europe/Warsaw' }: IuseCalendarDataProps) => {
    const initialDate = selectedDate?.setZone(zone) || null

    const [bufferDate, setBufferDate] = useState<DateTime | null>(initialDate)

    const [date, setDate] = useState<DateTime | null>(initialDate)

    const [hours, setHours] = useState<number | 'hh'>(withTime ? (selectedDate ? selectedDate.hour : 'hh') : 0)
    const [minutes, setMinutes] = useState<number | 'mm'>(withTime ? (selectedDate ? selectedDate.minute : 'mm') : 0)
    const [errorValue, setErrorValue] = useState<string>()

    const [viewDate, setViewDate] = useState<DateTime | null>(initialDate)

    const hoursChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        setHours(Number(e.target.value) || 'hh')
        if (e.target.value === 'hh') {
            setDate(null)
        }
        if (e.target.value !== 'hh' && minutes !== 'mm' && viewDate && bufferDate) {
            setDate(bufferDate.set({ minute: minutes, hour: Number(e.target.value) }))
        }
    }

    const minutesChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        setMinutes(e.target.value === '0' ? 0 : Number(e.target.value) || 'mm')
        if (e.target.value === 'mm') {
            setDate(null)
        }
        if (e.target.value !== 'mm' && hours !== 'hh' && viewDate && bufferDate) {
            setDate(bufferDate.set({ hour: hours, minute: Number(e.target.value) }))
        }
    }

    const setDay = (selectedDate: DateTime) => {
        const currentMillis: number = DateTime.now().setZone(zone).startOf('day').toMillis()
        if (selectedDate.toMillis() < currentMillis) {
            return
        }
        setBufferDate(selectedDate)
        if (minutes !== 'mm' && hours !== 'hh') {
            setDate(selectedDate!.set({ hour: hours, minute: minutes }))
        }
        setViewDate(selectedDate)
    }

    const nextMonth = () => {
        console.log('nextMonth')
        const selectedDate = bufferDate || DateTime.now().setZone(zone)
        const currentMillis: number = DateTime.now().setZone(zone).startOf('day').toMillis()
        const _selectedDate = selectedDate.plus({ month: 1 })
        const date = _selectedDate.toMillis() < currentMillis ? DateTime.now().setZone(zone) : _selectedDate
        setBufferDate(date)
        setViewDate(date)
        if (minutes !== 'mm' && hours !== 'hh') {
            setDate(date.set({ hour: hours, minute: minutes }))
        }
    }

    const prevMonth = () => {
        const selectedDate = bufferDate || DateTime.now().setZone(zone)
        const currentMillis: number = DateTime.now().setZone(zone).startOf('day').toMillis()
        const _selectedDate = selectedDate.minus({ month: 1 })
        const date = _selectedDate.toMillis() < currentMillis ? DateTime.now().setZone(zone) : _selectedDate
        setBufferDate(date)
        setViewDate(date)
        if (minutes !== 'mm' && hours !== 'hh') {
            setDate(date.set({ hour: hours, minute: minutes }))
        }
    }

    useEffect(() => {
        if (date) {
            setErrorValue('')
        }
    }, [date])

    const check: (showMessage?: boolean) => boolean = (showMessage = false) => {
        if (date === null) {
            if (showMessage) {
                setErrorValue('Określ czas')
            }
            return false
        }
        return true
    }

    const reset = () => {
        if (withTime) {
            setMinutes('mm')
            setHours('hh')
        }
        setDate(null)
        setViewDate(null)
    }

    console.log({ date, bufferDate })

    return {
        date,
        hours,
        minutes,
        setDay,
        setDate,
        prevMonth,
        nextMonth,
        check,
        errorValue,
        setErrorValue,
        reset,
        zone,
        withTime,
        viewDate,
        hoursChanged,
        minutesChanged,
    }
}

export type UseCalendarDataType = typeof useCalendarData

export type CalendarDataProps = ReturnType<UseCalendarDataType>
