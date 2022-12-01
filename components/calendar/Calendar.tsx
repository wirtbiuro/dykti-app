import React, { FC, SyntheticEvent, useState, useEffect, useRef } from 'react'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import CalendarComponent from './index'
import { CalendarStyled } from '../../styles/styled-components'

type CalendarType = {
    calendar: CalendarModule
    disabled?: boolean
}

const Calendar: FC<CalendarType> = ({ calendar, disabled }) => {
    const data = useCalendarData(calendar)

    const withTime = data.withTime

    // const [data, setData] = useState(calendar.data)
    // console.log({ data })
    // useEffect(() => {
    //     console.log('Calendar registerFinalCall', setData)
    //     calendar.registerFinalCall(setData)
    //     return () => {
    //         console.log('Calendar unregisterFinalCall', setData)
    //         calendar.unregisterFinalCall(setData)
    //     }
    // }, [calendar])

    // console.log({ data })

    const [isClosed, setIsClosed] = useState<boolean>(true)

    const hoursRef = useRef<HTMLSelectElement>(null)
    const minutesRef = useRef<HTMLSelectElement>(null)

    useEffect(() => {
        if (data.error !== '') {
            focusError()
        }
    }, [data.internalErrorTrigger])

    function focusError() {
        if (!data.dayMonthYear) {
            return setIsClosed(false)
        }
        if (data.hours === 'hh') {
            return hoursRef.current?.focus()
        }
        if (data.minutes === 'mm') {
            return minutesRef.current?.focus()
        }
    }

    function hoursChanged(e: SyntheticEvent<HTMLSelectElement>) {
        console.log('onHours', data)
        const _e = e as SyntheticEvent<HTMLSelectElement> & {
            target: { value: number | 'hh' }
        }
        calendar.setHours(_e.target.value)
    }

    function minutesChanged(e: SyntheticEvent<HTMLSelectElement>) {
        const _e = e as SyntheticEvent<HTMLSelectElement> & {
            target: { value: number | 'mm' }
        }
        calendar.setMinutes(_e.target.value)
    }

    function getDate() {
        if (!data.dayMonthYear) return `DD.MM.YYYY`
        else return data.dayMonthYear.toFormat('dd.MM.yyyy')
    }

    function onClose() {
        if (disabled) return
        setIsClosed(!isClosed)
    }

    function onReset(e: SyntheticEvent<HTMLButtonElement>) {
        e.preventDefault()
        calendar.reset()
    }

    return (
        <CalendarStyled>
            <div>{data.error}</div>
            <div>
                <span className={`date ${disabled ? 'date-disabled' : ''}`} onClick={onClose}>
                    {getDate()}
                </span>
                {withTime && (
                    <>
                        <select
                            name="hours"
                            onChange={hoursChanged}
                            value={data.hours}
                            ref={hoursRef}
                            disabled={disabled}
                        >
                            <option value="hh">hh</option>
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
                        </select>
                        <select
                            name="minutes"
                            onChange={minutesChanged}
                            value={data.minutes}
                            ref={minutesRef}
                            disabled={disabled}
                        >
                            <option value="mm">mm</option>
                            <option value={0}>00</option>
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                            <option value={45}>45</option>
                        </select>
                    </>
                )}
                {!disabled && <button onClick={(e) => onReset(e)}>Reset</button>}
            </div>
            {!isClosed && <CalendarComponent calendar={calendar} />}
        </CalendarStyled>
    )
}

export default Calendar
