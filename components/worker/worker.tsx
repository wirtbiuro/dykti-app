import { FC } from 'react'
import { IWorker, StepType } from '../../types'
import WorkerOrder from './WorkerOrder'
import { DateTime } from 'luxon'
import { WorkerStyled } from './worker-styles'

interface IWorkerProps {
    data: IWorker
}

const Worker: FC<IWorkerProps> = ({ data }) => {
    const { name, steps } = data

    const stepArr = Array.from(steps)

    console.log({ stepArr })

    const sortedSteps = stepArr.sort(
        (a, b) =>
            DateTime.fromISO(a.currentOrder?.currentStep?.workStepWorkStartDate as string).toMillis() -
            DateTime.fromISO(b.currentOrder?.currentStep?.workStepWorkStartDate as string).toMillis()
    )

    return (
        <WorkerStyled>
            <div className="name">{name}</div>
            <div className="cells">
                {sortedSteps.map((step: StepType, idx: number, arr: StepType[]) => {
                    console.log({ step })
                    const _step = step.currentOrder?.currentStep!
                    console.log('workStepEndDate', _step.workStepWorkEndDate)
                    const freeDayStart =
                        idx > 0
                            ? DateTime.fromISO(arr[idx - 1].currentOrder?.currentStep!.workStepWorkEndDate as string)
                            : DateTime.now().setZone('Europe/Warsaw').startOf('day')
                    console.log({ freeDayStart })
                    const delta = idx > 0 ? 1 : 0
                    const freeDays =
                        DateTime.fromISO(_step.workStepWorkStartDate as string)
                            .diff(freeDayStart, ['day'])
                            .toObject().days! - delta
                    console.log({ freeDays })

                    const workDays = DateTime.fromISO(_step.workStepWorkEndDate as string)
                        .diff(DateTime.fromISO(_step.workStepWorkStartDate as string), ['day'])
                        .toObject().days!

                    const _workDays = Math.round(workDays)

                    console.log({ workDays })

                    return (
                        <WorkerOrder order={step.currentOrder} freeDays={freeDays} workDays={_workDays} key={step.id} />
                    )
                })}
            </div>
        </WorkerStyled>
    )
}

export default Worker
