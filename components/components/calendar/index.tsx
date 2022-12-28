import React, { FC, SyntheticEvent, useState, useRef, ChangeEvent } from 'react'
import CalendarComponent from './CalendarComponent'
import { CalendarStyled } from './calendar-styled'
import { CalendarDataProps } from '../../../hooks/new/useCalendarData'

type CalendarType = {
    connection: CalendarDataProps
    disabled?: boolean
}

const Calendar: FC<CalendarType> = ({ connection, disabled }) => {
    const { date, errorValue, hours, minutes, hoursChanged, minutesChanged, reset, withTime, viewDate } = connection

    const [isClosed, setIsClosed] = useState<boolean>(true)

    const hoursRef = useRef<HTMLSelectElement>(null)
    const minutesRef = useRef<HTMLSelectElement>(null)

    function getDate() {
        return viewDate ? viewDate!.toFormat('dd.MM.yyyy') : `DD.MM.YYYY`
    }

    function onClose() {
        if (disabled) return
        setIsClosed(!isClosed)
    }

    function onReset(e: SyntheticEvent<HTMLButtonElement>) {
        e.preventDefault()
        reset()
    }

    return (
        <CalendarStyled>
            <div className="error">{errorValue}</div>
            <div>
                <span className={`date ${disabled ? 'date-disabled' : ''}`} onClick={onClose}>
                    {getDate()}
                </span>
                {withTime && (
                    <>
                        <select name="hours" onChange={hoursChanged} value={hours} ref={hoursRef} disabled={disabled}>
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
                            value={minutes}
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
            {!isClosed && <CalendarComponent connection={connection} />}
        </CalendarStyled>
    )
}

export default Calendar
