import { IQuery, IOrder, stepNames, StepName } from '../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../state/apiSlice'
import CreateBefaringStep from './CreateBefaringStep'
import Orders from './Orders'
import { getArrIdx, getDatas } from '../utilities'

const BefaringPanel = () => {
    const currentStep: StepName = 'beffaringStep'

    const { data }: IQuery<IOrder> = useGetOrdersQuery('BefaringUser')

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<CreateBefaringStep />} stepName="beffaringStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<CreateBefaringStep />} stepName="beffaringStep" />

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} children={<CreateBefaringStep />} stepName="beffaringStep" />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} children={<CreateBefaringStep />} stepName="beffaringStep" />
        </>
    )
}

export default BefaringPanel
