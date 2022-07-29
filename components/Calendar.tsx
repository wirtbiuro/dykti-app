import React, { useState, FC } from 'react'
import { useEffect } from 'react'
import styles from '../styles/Calendar.module.css'
import { week, monthNames } from '../accessories/constants'
import { DateTime } from 'luxon'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

type CalendarType = {
    selectedDate: DateTime
    setSelectedDate: React.Dispatch<React.SetStateAction<DateTime>>
}

const Calendar: FC<CalendarType> = ({ selectedDate, setSelectedDate }) => {
    const [rows, setRows] = useState<Array<JSX.Element>>([])
    // const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now())
    const language = 'pl'

    const firstDate = DateTime.now()

    useEffect(() => {
        console.log({ selectedDate })
        const dayArr = getDays(selectedDate)
        const rows = getRows(dayArr)
        setRows(rows)
    }, [selectedDate])

    const getDays = (selectedDate: DateTime) => {
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

    function dayClicked(day: DateTime) {
        setSelectedDate(day)
    }

    const getRows = (dayArr: DateTime[]) => {
        const quantity = dayArr.length / 7

        let rows = []

        console.log({ dayArr })

        for (let i = 0; i < quantity; i++) {
            rows[i] = (
                <div className={styles.row} key={i}>
                    {dayArr.slice(i * 7, i * 7 + 7).map((day, idx) => {
                        const currentDate = selectedDate
                        const dayClassName =
                            day.day === currentDate.day &&
                            day.month === currentDate.month &&
                            day.year === currentDate.year
                                ? 'current'
                                : day.day === firstDate.day &&
                                  day.month === firstDate.month &&
                                  day.year === firstDate.year
                                ? 'first'
                                : day.month !== currentDate.month
                                ? 'other'
                                : 'day'
                        return (
                            <div
                                className={styles.dayWrapper}
                                key={`${i}${idx}`}
                                onClick={() => {
                                    dayClicked(day)
                                }}
                            >
                                <div className={styles[dayClassName]}>
                                    {day.day}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        }

        return rows
    }

    const nextMonth = () => {
        setSelectedDate(selectedDate.plus({ month: 1 }))
    }

    const prevMonth = () => {
        setSelectedDate(selectedDate.minus({ month: 1 }))
    }

    const getWeek = () =>
        language &&
        week[language].map((name) => (
            <div className={styles.weekDay} key={name}>
                {name}
            </div>
        ))

    const getCurrentMonthName = () =>
        language &&
        `${monthNames[language][selectedDate.month - 1]} ${selectedDate.year}`

    return (
        <div className={styles.myCalendar}>
            <div className={styles.top}>
                <div className={styles.arrow} onClick={prevMonth}>
                    <LeftOutlined style={{ color: '#474747' }} />
                </div>
                <div className={styles.monthName}>{getCurrentMonthName()}</div>
                <div
                    className={styles.arrow}
                    onClick={nextMonth}
                    data-testrightarrow
                >
                    <RightOutlined style={{ color: '#474747' }} />
                </div>
            </div>
            <div className={styles.week}>{getWeek()}</div>
            {rows}
        </div>
    )
}

export default Calendar
