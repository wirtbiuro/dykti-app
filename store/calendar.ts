import { DateTime } from 'luxon'
import { useState, useEffect } from 'react'

interface ICalendarData {
    dayMonthYear: DateTime | null
    days: DateTime[]
    hours: number | 'hh'
    minutes: number | 'mm'
    error: string
    withTime: boolean
    internalErrorTrigger: boolean
    zone: string
}

export class CalendarModule {
    data: ICalendarData = {
        dayMonthYear: null,
        days: [],
        hours: 0,
        minutes: 0,
        error: '',
        withTime: false,
        internalErrorTrigger: false,
        zone: 'Europe/Warsaw',
    }

    finalCalls: Function[] = []

    constructor(props?: { selectedDate?: DateTime; withTime?: boolean; zone?: string }) {
        this.data.zone = props?.zone || this.data.zone
        this.data.dayMonthYear = props?.selectedDate?.setZone(props?.zone || this.data.zone) || null
        this.data.days = this.getDays()
        if (props?.withTime === true) {
            this.data.minutes = props.selectedDate ? props.selectedDate.minute : 'mm'
            this.data.hours = props.selectedDate?.hour || 'hh'
            this.data.withTime = true
        }
    }

    private getDays() {
        const selectedDate = this.data.dayMonthYear || DateTime.now().setZone(this.data.zone)
        const currentMonth = selectedDate.month
        const currentYear = selectedDate.year

        const firstCurMonthDate = DateTime.fromObject({
            year: currentYear,
            month: currentMonth,
            day: 1,
            hour: selectedDate.hour,
            minute: selectedDate.minute,
        })

        const currentDay = firstCurMonthDate.weekday

        let dayArr = []
        const firstIdx = currentDay - 1
        dayArr[firstIdx] = firstCurMonthDate

        for (let index = firstIdx - 1; index >= 0; index--) {
            dayArr[index] = firstCurMonthDate.minus({ days: firstIdx - index })
        }

        let cur = firstCurMonthDate
        let idx = firstIdx + 1
        while (true) {
            cur = cur.plus({ days: 1 })
            dayArr[idx] = cur
            idx += 1
            if (cur.month !== firstCurMonthDate.month && cur.weekday === 7) {
                break
            }
        }

        return dayArr
    }

    nextMonth() {
        console.log('nextMonth')
        const selectedDate = this.data.dayMonthYear || DateTime.now().setZone(this.data.zone)
        const currentMillis: number = DateTime.now().setZone(this.data.zone).startOf('day').toMillis()
        const _selectedDate = selectedDate.plus({ month: 1 })
        this.data.dayMonthYear =
            _selectedDate.toMillis() < currentMillis ? DateTime.now().setZone(this.data.zone) : _selectedDate
        this.data.days = this.getDays()
        this.doFinalCalls()
    }

    prevMonth() {
        console.log('prevMonth')
        const selectedDate = this.data.dayMonthYear || DateTime.now().setZone(this.data.zone)
        const currentMillis: number = DateTime.now().setZone(this.data.zone).startOf('day').toMillis()
        const _selectedDate = selectedDate.minus({ month: 1 })
        this.data.dayMonthYear =
            _selectedDate.toMillis() < currentMillis ? DateTime.now().setZone(this.data.zone) : _selectedDate
        this.data.days = this.getDays()
        this.doFinalCalls()
    }

    setSelectedDateWithPrevCheck(selectedDate: DateTime) {
        const currentMillis: number = DateTime.now().setZone(this.data.zone).startOf('day').toMillis()
        if (selectedDate.toMillis() < currentMillis) {
            return
        }
        this.setSelectedDate(selectedDate)
    }

    setSelectedDate(selectedDate: DateTime | null) {
        this.data.dayMonthYear = selectedDate
        this.data.days = this.getDays()
        if (this.data.error !== '') {
            const isChecked = this.check()
            isChecked ? (this.data.error = '') : this.setError()
        }
        this.doFinalCalls()
    }

    reset() {
        console.log('reset')
        if (this.data.withTime) {
            this.data.minutes = 'mm'
            this.data.hours = 'hh'
        }
        this.data.dayMonthYear = null
        this.data.days = this.getDays()
        this.doFinalCalls()
    }

    setMinutes(minutes: number | 'mm') {
        console.log('setMinutes')
        this.data.minutes = minutes
        if (this.data.error !== '') {
            const isChecked = this.check()
            isChecked ? (this.data.error = '') : this.setError()
        }
        this.doFinalCalls()
    }

    setHours(hours: number | 'hh') {
        console.log('setHours', hours, this.data)
        this.data.hours = hours
        if (this.data.error !== '') {
            const isChecked = this.check()
            isChecked ? (this.data.error = '') : this.setError()
        }
        this.doFinalCalls()
    }

    setError() {
        console.log('setError')
        this.data.error = 'określ czas'
        this.doFinalCalls()
    }

    check(showError?: boolean) {
        const _showError: boolean = showError === undefined ? true : showError
        console.log({ showError, _showError })
        if (this.data.minutes === 'mm' || this.data.hours === 'hh' || this.data.dayMonthYear === null) {
            if (_showError) {
                this.setError()
            }
            return false
        }
        return true
    }

    getSelectedDate(showError?: boolean) {
        console.log({ showError })
        const isChecked = this.check(showError)
        this.data.internalErrorTrigger = !this.data.internalErrorTrigger
        this.doFinalCalls()
        return isChecked
            ? this.data.dayMonthYear?.set({ hour: this.data.hours as number, minute: this.data.minutes as number })
            : null
    }

    getSelectedDateWithoutError() {
        const isChecked = this.check(false)
        return isChecked
            ? this.data.dayMonthYear?.set({ hour: this.data.hours as number, minute: this.data.minutes as number })
            : null
    }

    registerFinalCall = (finalCall: Function) => {
        this.finalCalls.push(finalCall)
    }
    unregisterFinalCall = (finalCall: Function) => {
        this.finalCalls = this.finalCalls.filter((_finallCall) => _finallCall !== finalCall)
    }

    doFinalCalls = () => {
        this.finalCalls.forEach((finalCall) => {
            finalCall({ ...this.data })
        })
    }
}

export const useCalendarData = (calendar: CalendarModule) => {
    const [data, setData] = useState(calendar.data)
    useEffect(() => {
        calendar.registerFinalCall(setData)
        return () => {
            calendar.unregisterFinalCall(setData)
        }
    }, [])
    return data
}
