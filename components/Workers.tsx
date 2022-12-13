import { dyktiApi } from '../state/apiSlice'
import Worker from './worker/worker'
import { IWorker } from '../types'
import Days from './worker/Days'
import Months from './worker/Months'
import { WorkersStyled } from './worker/worker-styles'
import { DateTime } from 'luxon'

const Workers = () => {
    const getWorkers = dyktiApi.endpoints.getWorkers as any
    const { data, isLoading } = getWorkers.useQuery()

    console.log({ data })

    const lastDay = DateTime.now().plus({ months: 2 }).setZone('Europe/Warsaw').toISO()

    if (isLoading) return <WorkersStyled>Loading...</WorkersStyled>

    return (
        <WorkersStyled>
            <Months lastDay={lastDay} />

            <Days lastDay={lastDay} />

            {data.workers && (
                <>
                    {data.workers.map((worker: IWorker) => (
                        <Worker data={worker} key={worker.id} />
                    ))}
                </>
            )}
        </WorkersStyled>
    )
}

export default Workers
