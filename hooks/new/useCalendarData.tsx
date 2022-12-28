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

    const [isReset, setIsReset] = useState<boolean>(false)

    const [viewDate, setViewDate] = useState<DateTime | null>(initialDate)

    const hoursChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        setHours(Number(e.target.value) || 'hh')
        if (e.target.value === 'hh') {
            setDate(null)
        }
        setIsReset(false)
    }

    const minutesChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        setMinutes(e.target.value === '0' ? 0 : Number(e.target.value) || 'mm')
        if (e.target.value === 'mm') {
            setDate(null)
        }
        setIsReset(false)
    }

    const setDay = (selectedDate: DateTime) => {
        const currentMillis: number = DateTime.now().setZone(zone).startOf('day').toMillis()
        if (selectedDate.toMillis() < currentMillis) {
            return
        }
        setBufferDate(selectedDate)
        setViewDate(selectedDate)
        setIsReset(false)
    }

    const nextMonth = () => {
        console.log('nextMonth')
        const selectedDate = bufferDate || DateTime.now().setZone(zone)
        const currentMillis: number = DateTime.now().setZone(zone).startOf('day').toMillis()
        const _selectedDate = selectedDate.plus({ month: 1 })
        setBufferDate(_selectedDate.toMillis() < currentMillis ? DateTime.now().setZone(zone) : _selectedDate)
    }

    const prevMonth = () => {
        const selectedDate = bufferDate || DateTime.now().setZone(zone)
        const currentMillis: number = DateTime.now().setZone(zone).startOf('day').toMillis()
        const _selectedDate = selectedDate.minus({ month: 1 })
        setBufferDate(_selectedDate.toMillis() < currentMillis ? DateTime.now().setZone(zone) : _selectedDate)
    }

    useEffect(() => {
        console.log('use effect 1')
        console.log({ viewDate, date })
        if (withTime && viewDate !== null && minutes !== 'mm' && hours !== 'hh') {
            setDate(bufferDate)
            setErrorValue('')
        }
        if (!withTime && viewDate !== null) {
            setDate(bufferDate)
            setErrorValue('')
        }
    }, [bufferDate, minutes, hours, viewDate])

    useEffect(() => {
        console.log('use effect 2')
        if (isReset) {
            setDate(null)
            setViewDate(null)
            if (withTime) {
                setHours('hh')
                setMinutes('mm')
            }
        }
    }, [isReset])

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
        console.log('reset')
        setIsReset(true)
    }

    return {
        date,
        hours,
        minutes,
        setDay,
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
