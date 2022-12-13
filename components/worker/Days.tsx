import React, { FC } from 'react'
import { DateTime } from 'luxon'
import { DaysStyled } from './worker-styles'

interface IDays {
    lastDay: string
}

const Days: FC<IDays> = ({ lastDay }) => {
    const now = DateTime.now().setZone('Europe/Warsaw').startOf('day')

    const days = Math.floor(DateTime.fromISO(lastDay).endOf('month').diff(now, ['days']).toObject().days!) + 1

    console.log({ days })

    const idxArr = Array.from(Array(days).keys())

    return (
        <DaysStyled>
            <div className="name">Dzień</div>
            {idxArr.map((idx) => {
                const day = now.plus({ days: idx }).day
                return <div className="day">{day}</div>
            })}
        </DaysStyled>
    )
}

export default Days
