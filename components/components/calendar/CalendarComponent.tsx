import React, { FC } from 'react'
import styles from './Calendar.module.css'
import { week, monthNames } from './constants'
import { DateTime } from 'luxon'
import Rows from './Rows'
import { CalendarDataProps } from '../../../hooks/new/useCalendarData'

const CalendarComponent: FC<{ connection: CalendarDataProps }> = ({ connection }) => {
    const { date, setDay, prevMonth, nextMonth, zone, viewDate } = connection

    const language = 'pl'

    const weeks = week[language].map((name) => (
        <div className={styles.weekDay} key={name}>
            {name}
        </div>
    ))

    function getCurrentMonthName() {
        const _selectedDate = date || DateTime.now()
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
            <Rows setDay={setDay} date={viewDate} zone={zone} />
        </div>
    )
}

export default CalendarComponent
