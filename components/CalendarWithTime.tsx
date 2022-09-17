import React, { useMemo, useState, SyntheticEvent, useRef, useEffect, RefObject } from 'react'
import Calendar from './Calendar'
import { DateTime } from 'luxon'
import { showErrorFormModal } from '../utilities'
import { Modal } from 'antd'
import { flushSync } from 'react-dom'
import { IOutputRef } from '../types'
import { useCalendarDataType } from '../hooks/useCalendarData'

interface ICalendarWithTime {
    defaultDate?: string | DateTime | undefined
    connection?: useCalendarDataType
    isTimeEnabled?: boolean
    formChanged?: Function
}

function CalendarWithTime({
    defaultDate,
    connection,
    isTimeEnabled = true,
    formChanged = () => {},
}: ICalendarWithTime) {
    const _defaultDate = useMemo(() => {
        console.log({ defaultDate })
        return defaultDate ? DateTime.fromISO(defaultDate as string) : false
    }, [])

    console.log({ _defaultDate })

    const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now())
    const [isVisible, setIsVisible] = useState(false)
    const [isMinutes, setIsMinutes] = useState(_defaultDate ? true : false)
    const [isHours, setIsHours] = useState(_defaultDate ? true : false)
    const [isFirstLoad, setIsFirstLoad] = useState(true)

    // const [isReset, setIsReset] = useState(!_defaultDate && isFirstLoad)
    const [isReset, setIsReset] = useState(!_defaultDate)

    const selectedDateRef = useRef<DateTime>(selectedDate)

    useEffect(() => {
        if (_defaultDate) {
            setSelectedDate(_defaultDate)
        }
    }, [_defaultDate])

    useEffect(() => {
        console.log('useeffect selected date')
        selectedDateRef.current = selectedDate
        if (!isFirstLoad) {
            setIsReset(false)
        }
        if (isFirstLoad) {
            setIsFirstLoad(false)
        }
        check({ isReset: !isFirstLoad ? false : isReset })
    }, [selectedDate])

    useEffect(() => {
        console.log('useeffect isreset', isReset)

        if (isTimeEnabled && isReset) {
            hoursRef.current!.value = 'hh'
            minutesRef.current!.value = 'mm'
            setIsHours(false)
            setIsMinutes(false)
        }
        check({ isReset })
    }, [isReset])

    const hoursRef = useRef<HTMLSelectElement>(null)
    const minutesRef = useRef<HTMLSelectElement>(null)

    const clicked = (e: SyntheticEvent<HTMLButtonElement>) => {
        console.log('clicked')
        e.preventDefault()
        setIsVisible(!isVisible)
        setIsFirstLoad(false)
    }

    const changeTime = (e: SyntheticEvent<HTMLSelectElement>) => {
        const target = e.target as HTMLSelectElement

        console.log(target.name, hoursRef.current?.value)

        if (target.name === 'hours' && hoursRef.current?.value !== 'hh') {
            setIsHours(true)
            const _selectedDate = selectedDate!.set({
                hour: Number(hoursRef.current?.value),
            })
            console.log({ _selectedDate })
            setSelectedDate(_selectedDate)
        }
        if (target.name === 'hours' && hoursRef.current?.value === 'hh') {
            setIsHours(false)
            console.log({ selectedDate })
            const _selectedDate = selectedDate!.set({
                hour: 0,
            })
            setSelectedDate(_selectedDate)
        }

        if (target.name === 'minutes' && minutesRef.current?.value !== 'mm') {
            setIsMinutes(true)
            const _selectedDate = selectedDate!.set({
                minute: Number(minutesRef.current?.value),
            })
            setSelectedDate(_selectedDate)
        }
        if (target.name === 'minutes' && minutesRef.current?.value === 'mm') {
            console.log('set false minutes')
            setIsMinutes(false)
            const _selectedDate = selectedDate!.set({
                minute: 0,
            })
            setSelectedDate(_selectedDate)
        }
        if (hoursRef.current?.value !== 'hh' && minutesRef.current?.value !== 'mm') {
            errRef.current!.innerHTML = ''
        }
    }

    // const isDate =
    //     (selectedDate &&
    //         hoursRef.current?.value !== 'hh' &&
    //         minutesRef.current?.value !== 'mm') ||
    //     (_defaultDate && isFirstLoad && !isReset)

    // const timeEnabledCurrentDate = isDate
    //     ? selectedDate.toISO()
    //     : `DD:MM:YYYY hh:mm`

    // const NoTimeEnabledCurrentDate = isReset
    //     ? `DD:MM:YYYY`
    //     : selectedDate.toISO()

    // const currentDate = isTimeEnabled
    //     ? timeEnabledCurrentDate
    //     : NoTimeEnabledCurrentDate

    const errRef = useRef<HTMLDivElement>(null)

    const getValue = () => {
        const isDate =
            (selectedDate && hoursRef.current?.value !== 'hh' && minutesRef.current?.value !== 'mm') ||
            (_defaultDate && isFirstLoad && !isReset)

        const timeEnabledCurrentDate = isDate ? selectedDate : null

        const NoTimeEnabledCurrentDate = isReset ? null : selectedDate

        const currentDate = isTimeEnabled ? timeEnabledCurrentDate : NoTimeEnabledCurrentDate

        return currentDate
    }

    const setValue = (date: DateTime) => {
        setSelectedDate(date)
        setIsReset(false)
    }

    const check = ({ isReset = !_defaultDate }: { isReset: boolean }) => {
        console.log('check')
        if (isTimeEnabled) {
            const isChecked = hoursRef.current?.value !== 'hh' && minutesRef.current?.value !== 'mm'
            connection?.__setIsChecked(isChecked)
            connection?.__setValue(getValue())

            return isChecked
        } else {
            console.log({ isReset })
            const isChecked = !isReset
            connection?.__setIsChecked(isChecked)
            connection?.__setValue(getValue())

            return isChecked
        }
    }

    const showError = () => {
        showErrorFormModal({
            element: hoursRef.current as HTMLSelectElement,
            errElement: errRef.current!,
            modal: Modal,
            onOk: () => {
                const hours = hoursRef.current
                const minutes = minutesRef.current
                flushSync(() => {
                    setIsVisible(true)
                })
                // setIsReset(false)
                hours?.value === 'hh' ? hours.focus() : minutes?.focus()
                errRef.current!.innerHTML = 'określ czas'
            },
        })
    }

    const reset = (e: SyntheticEvent<HTMLButtonElement>) => {
        e.preventDefault()
        console.log('reset')
        setIsReset(true)
        setIsFirstLoad(false)
    }

    const getErrTitleElement = () => {
        return errRef.current
    }

    useEffect(() => {
        connection?.__setShowError(() => showError)
        connection?.__setCheck(() => check)
        connection?.__setSetValue(() => setValue)
        connection?.__setValue(getValue())
        connection?.__setErrTitleElement(getErrTitleElement())
    }, [])

    const dateTimeValue = connection?.value as DateTime
    const viewTime = dateTimeValue
        ? isTimeEnabled
            ? dateTimeValue.toFormat('dd.LL.yyyy HH:mm')
            : dateTimeValue.toFormat('dd.LL.yyyy')
        : isTimeEnabled
        ? 'DD.MM.YYYY mm:hh'
        : 'DD.MM.YYYY'

    return (
        <>
            {viewTime}
            <button onClick={clicked}>
                {isVisible ? 'Zamknij' : connection?.value && !isReset ? 'Zmień datę' : 'Ustalić datę'}
            </button>
            {/* Checked: {connection?.isChecked ? 'true' : 'false'}
            isReset: {isReset ? 'true' : 'false'}
            Value: {viewTime} */}
            <button onClick={reset}>Resetowanie</button>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                <div ref={errRef}></div>
                {isTimeEnabled && (
                    <>
                        <select
                            name="hours"
                            onChange={changeTime}
                            ref={hoursRef}
                            value={isHours ? selectedDate?.hour : 'hh'}
                        >
                            <option>hh</option>
                            <option value={7}>07</option>
                            <option value={8}>08</option>
                            <option value={9}>09</option>
                            <option value={10}>10</option>
                            <option value={11}>11</option>
                            <option value={12}>12</option>
                            <option value={13}>13</option>
                            <option value={14}>14</option>
                            <option value={15}>15</option>
                            <option value={16}>16</option>
                            <option value={17}>17</option>
                            <option value={18}>18</option>
                            <option value={19}>19</option>
                            <option value={20}>20</option>
                            <option value={21}>21</option>
                        </select>
                        <select
                            name="minutes"
                            onChange={changeTime}
                            ref={minutesRef}
                            value={isMinutes ? selectedDate?.minute : 'mm'}
                        >
                            <option>mm</option>
                            <option value={0}>00</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={40}>40</option>
                            <option value={50}>50</option>
                        </select>
                    </>
                )}
            </div>
        </>
    )
}

export default CalendarWithTime
