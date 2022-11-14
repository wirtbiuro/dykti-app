import React, { FC, useEffect, useState } from 'react'
import styles from '../../styles/Calendar.module.css'
import { week, monthNames } from '../../accessories/constants'
import { DateTime } from 'luxon'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import Rows from './Rows'

type CalendarType = {
    calendar: CalendarModule
}

const CalendarComponent: FC<CalendarType> = ({ calendar }) => {
    const language = 'pl'

    const data = useCalendarData(calendar)

    const nextMonth = () => {
        calendar.nextMonth()
    }

    const prevMonth = () => {
        calendar.prevMonth()
    }

    const weeks = week[language].map((name) => (
        <div className={styles.weekDay} key={name}>
            {name}
        </div>
    ))

    function getCurrentMonthName() {
        const _selectedDate = data.dayMonthYear || DateTime.now()
        return `${monthNames[language][_selectedDate.month - 1]} ${_selectedDate.year}`
    }

    return (
        <div className={styles.myCalendar}>
            <div className={styles.top}>
                <div className={styles.arrow} onClick={prevMonth}>
                    {`<`}
                </div>
                <div className={styles.monthName}>{getCurrentMonthName()}</div>
                <div className={styles.arrow} onClick={nextMonth} data-testrightarrow>
                    {`>`}
                </div>
            </div>
            <div className={styles.week}>{weeks}</div>
            <Rows calendar={calendar} />
        </div>
    )
}

export default CalendarComponent
