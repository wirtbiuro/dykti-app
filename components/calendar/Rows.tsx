import React, { FC, useState, useEffect } from 'react'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import { DateTime } from 'luxon'
import styles from '../../styles/Calendar.module.css'

const Rows: FC<{ calendar: CalendarModule }> = ({ calendar }) => {
    const data = useCalendarData(calendar)

    function getRows(dayArr: DateTime[]) {
        const firstDate = DateTime.now()
        const quantity = dayArr.length / 7
        let rows = []
        for (let i = 0; i < quantity; i++) {
            rows[i] = (
                <div className={styles.row} key={i}>
                    {dayArr.slice(i * 7, i * 7 + 7).map((day, idx) => {
                        const currentDate = data.dayMonthYear || DateTime.now()
                        const currentMillis: number = DateTime.now().startOf('day').toMillis()

                        const dayClassName =
                            day.day === currentDate.day &&
                            day.month === currentDate.month &&
                            day.year === currentDate.year &&
                            data.dayMonthYear
                                ? 'current'
                                : day.day === firstDate.day &&
                                  day.month === firstDate.month &&
                                  day.year === firstDate.year
                                ? 'first'
                                : day.toMillis() < currentMillis
                                ? 'prev'
                                : day.month !== currentDate.month
                                ? 'other'
                                : 'day'
                        return (
                            <div
                                className={styles.dayWrapper}
                                key={`${i}${idx}`}
                                onClick={() => {
                                    calendar.setSelectedDateWithPrevCheck(day)
                                }}
                            >
                                <div className={styles[dayClassName]}>{day.day}</div>
                            </div>
                        )
                    })}
                </div>
            )
        }

        return rows
    }

    return <div>{getRows(data.days)}</div>
}

export default Rows
