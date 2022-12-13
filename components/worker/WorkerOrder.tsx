import { FC, useRef, useEffect, useState } from 'react'
import { IOrder } from '../../types'
import { WorkerOrderStyled } from './worker-styles'
import { DateTime } from 'luxon'

interface IWorkerOrderProps {
    order?: IOrder
    freeDays: number
    workDays: number
}

const WorkerOrder: FC<IWorkerOrderProps> = ({ order, freeDays, workDays }) => {
    const { currentStep } = order!

    const { workStepWorkStartDate, workStepWorkEndDate } = currentStep!

    const workDaysRef = useRef<HTMLDivElement>(null)

    const freeDaysIdxArr = Array.from(Array(Math.abs(freeDays)).keys())

    let _workDays = freeDays >= 0 ? workDays + 1 : workDays - Math.abs(freeDays) + 1
    _workDays = Math.abs(_workDays)
    const workDaysIdxArr = Array.from(Array(_workDays).keys())

    useEffect(() => {
        let workDaysString = ''
        const _workDays = freeDays >= 0 ? workDays : workDays - Math.abs(freeDays)
        for (let index = 0; index <= _workDays; index++) {
            workDaysString += `<div class="workday" key=${index}></div>`
        }
        workDaysRef.current?.insertAdjacentHTML('afterbegin', workDaysString)
    }, [workDaysRef])

    const [showHint, setShowHint] = useState(false)

    return (
        <WorkerOrderStyled freeDays={freeDays} orderId={order?.id}>
            <div className="freedays">
                {freeDaysIdxArr.map((idx) => {
                    return freeDays > 0 ? (
                        <div className="freeday" key={idx}></div>
                    ) : (
                        <div className="mixedday" key={idx}></div>
                    )
                })}
            </div>
            <div
                className="workdays"
                onMouseEnter={(e) => {
                    setShowHint(true)
                }}
                onMouseLeave={() => setShowHint(false)}
            >
                {workDaysIdxArr.map((idx) => {
                    return <div className="workday" key={idx}></div>
                })}
                {showHint && (
                    <div className="hint">
                        {order?.currentStep?.formStepClientName}{' '}
                        {DateTime.fromISO(order?.currentStep?.workStepWorkStartDate as string).toFormat('dd.MM.yyyy')} -{' '}
                        {DateTime.fromISO(order?.currentStep?.workStepWorkEndDate as string).toFormat('dd.MM.yyyy')}
                    </div>
                )}
            </div>
        </WorkerOrderStyled>
    )
}

export default WorkerOrder
