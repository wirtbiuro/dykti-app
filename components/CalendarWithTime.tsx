import React, {
    useMemo,
    useState,
    SyntheticEvent,
    useRef,
    useEffect,
    RefObject,
} from 'react'
import Calendar from './Calendar'
import { DateTime } from 'luxon'
import { showErrorFormModal } from '../utilities'
import { Modal } from 'antd'
import { flushSync } from 'react-dom'
import { IOutputRef } from '../types'

interface ICalendarWithTime {
    defaultDate?: string | DateTime | undefined
    dataRef?: RefObject<IOutputRef>
}

function CalendarWithTime({ defaultDate, dataRef }: ICalendarWithTime) {
    const _defaultDate = useMemo(() => {
        return defaultDate ? DateTime.fromISO(defaultDate as string) : false
    }, [])

    const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now())
    const [isVisible, setIsVisible] = useState(false)
    const [isMinutes, setIsMinutes] = useState(_defaultDate ? true : false)
    const [isHours, setIsHours] = useState(_defaultDate ? true : false)
    const [isFirstLoad, setIsFirstLoad] = useState(true)

    const selectedDateRef = useRef<DateTime>(selectedDate)

    useEffect(() => {
        if (_defaultDate) {
            setSelectedDate(_defaultDate)
        }
    }, [_defaultDate])

    useEffect(() => {
        selectedDateRef.current = selectedDate
    }, [selectedDate])

    const hoursRef = useRef<HTMLSelectElement>(null)
    const minutesRef = useRef<HTMLSelectElement>(null)

    console.log(hoursRef.current)

    const clicked = (e: SyntheticEvent<HTMLButtonElement>) => {
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
        if (
            hoursRef.current?.value !== 'hh' &&
            minutesRef.current?.value !== 'mm'
        ) {
            errRef.current!.innerHTML = ''
        }
    }

    const isDate =
        (selectedDate &&
            hoursRef.current?.value !== 'hh' &&
            minutesRef.current?.value !== 'mm') ||
        (_defaultDate && isFirstLoad)

    const currentDate = isDate ? selectedDate?.toISO() : 'DD:MM:YYYY hh:mm'

    console.log({ _defaultDate })
    console.log({ selectedDate })
    console.log({ isMinutes })
    console.log({ isDate })
    console.log({ isFirstLoad })

    const errRef = useRef<HTMLDivElement>(null)

    const getValue = () => {
        return selectedDateRef.current
    }

    const check = () => {
        return (
            hoursRef.current?.value !== 'hh' &&
            minutesRef.current?.value !== 'mm'
        )
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
                hours?.value === 'hh' ? hours.focus() : minutes?.focus()
                errRef.current!.innerHTML = 'określ czas'
            },
        })
    }

    const getErrTitleElement = () => {
        return errRef.current
    }

    useEffect(() => {
        dataRef!.current!.check = check
        dataRef!.current!.getValue = getValue
        dataRef!.current!.showError = showError
        dataRef!.current!.getErrTitleElement = getErrTitleElement
    }, [dataRef])

    return (
        <>
            {currentDate}
            <button onClick={clicked}>
                {isVisible ? 'Zamknij' : isDate ? 'Zmień datę' : 'Ustalić datę'}
            </button>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <Calendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
                <div ref={errRef}></div>
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
            </div>
        </>
    )
}

export default CalendarWithTime
