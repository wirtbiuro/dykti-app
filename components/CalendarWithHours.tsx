import React, {
    useMemo,
    useState,
    SyntheticEvent,
    useRef,
    useEffect,
    FC,
} from 'react'
import Calendar from './Calendar'
import FormInput from './UI/FormInput'
import { DateTime } from 'luxon'

interface ICalendarWithHours<T> {
    selectedDate: DateTime
    setSelectedDate: React.Dispatch<React.SetStateAction<DateTime>>
    setHoursErr: React.Dispatch<
        React.SetStateAction<HTMLDivElement | null | undefined>
    >
    defaultDate?: string | DateTime | undefined
    hoursName: T
    minutesName: T
    isVisibleHook: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    currentDateRef: React.MutableRefObject<string>
    isTimeEnabled?: boolean
}

function CalendarWithHours<T extends string>({
    selectedDate,
    setSelectedDate,
    setHoursErr,
    defaultDate,
    hoursName,
    minutesName,
    isVisibleHook,
    currentDateRef,
    isTimeEnabled = true,
}: ICalendarWithHours<T>) {
    const _defaultDate = useMemo(() => {
        return defaultDate ? DateTime.fromISO(defaultDate as string) : null
    }, [])

    const defaultMinutes = _defaultDate ? _defaultDate.minute : 'mm'
    const defaultHours = _defaultDate ? _defaultDate.hour : 'hh'

    useEffect(() => {
        if (_defaultDate) {
            setSelectedDate(_defaultDate)
        }
    }, [_defaultDate])

    const [isVisible, setIsVisible] = isVisibleHook
    const [isMinutes, setIsMinutes] = useState(_defaultDate ? true : false)
    const [isHours, setIsHours] = useState(_defaultDate ? true : false)
    const [isFirstLoad, setIsFirstLoad] = useState(true)

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

        if (
            target.name === hoursRef.current?.name &&
            hoursRef.current?.value !== 'hh'
        ) {
            setIsHours(true)
            const _selectedDate = selectedDate.set({
                hour: Number(hoursRef.current?.value),
            })
            setSelectedDate(_selectedDate)
        }
        if (hoursRef.current?.value === 'hh') {
            setIsHours(false)
            console.log({ selectedDate })
            const _selectedDate = selectedDate.set({
                hour: 0,
            })
            setSelectedDate(_selectedDate)
        }

        if (
            target.name === minutesRef.current?.name &&
            minutesRef.current?.value !== 'mm'
        ) {
            setIsMinutes(true)
            const _selectedDate = selectedDate.set({
                minute: Number(minutesRef.current?.value),
            })
            setSelectedDate(_selectedDate)
        }
        if (minutesRef.current?.value === 'mm') {
            setIsMinutes(false)
            const _selectedDate = selectedDate.set({
                minute: 0,
            })
            setSelectedDate(_selectedDate)
        }
    }

    const isDate = isTimeEnabled
        ? (selectedDate &&
              hoursRef.current?.value !== 'hh' &&
              minutesRef.current?.value !== 'mm') ||
          (defaultDate && isFirstLoad)
        : defaultDate && isFirstLoad

    const currentDate = isDate
        ? selectedDate.toISO()
        : `DD:MM:YYYY${isTimeEnabled ? ` hh:mm` : ''}`

    currentDateRef.current = currentDate

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
                {isTimeEnabled && (
                    <FormInput
                        name="hoursAndMinutes"
                        // setErr={setHoursErr}
                    >
                        <>
                            <select
                                name={hoursName}
                                onChange={changeTime}
                                ref={hoursRef}
                                value={isHours ? selectedDate.hour : 'hh'}
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
                                name={minutesName}
                                onChange={changeTime}
                                ref={minutesRef}
                                value={isMinutes ? selectedDate.minute : 'mm'}
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
                    </FormInput>
                )}
            </div>
        </>
    )
}

export default CalendarWithHours
