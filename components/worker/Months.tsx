import React, { FC } from 'react'
import { DateTime } from 'luxon'
import { DaysStyled, MonthsStyled, MonthStyled } from './worker-styles'

interface IMonthsProps {
    lastDay: string
}

const Months: FC<IMonthsProps> = ({ lastDay }) => {
    const now = DateTime.now().setZone('Europe/Warsaw').startOf('day')

    const months = Math.floor(DateTime.fromISO(lastDay).diff(now, ['months']).toObject().months!) + 1

    const idxArr = Array.from(Array(months).keys())

    return (
        <MonthsStyled>
            <div className="name">Mesiąc</div>
            {idxArr.map((idx) => {
                const monthData = now.plus({ month: idx })
                const monthName = monthData.monthLong
                let monthDays = monthData.daysInMonth as number
                if (idx === 0) {
                    const day = now.day
                    monthDays = monthDays - day + 1
                }

                return <MonthStyled days={monthDays}>{monthName}</MonthStyled>
            })}
        </MonthsStyled>
    )
}

export default Months
