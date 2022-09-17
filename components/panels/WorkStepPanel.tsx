import React from 'react'
import { IQuery, IOrder, StepName } from '../../types'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import CreateWorkStep from '../steps/CreateWorkStep'
import useGetOrders from '../../hooks/useGetOrders'

const WorkStepPanel = () => {
    const currentStep: StepName = 'workStep'

    const { data, isError }: IQuery<IOrder> = useGetOrders('WorkRespUser')

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<CreateWorkStep />} stepName="workStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<CreateWorkStep />} stepName="workStep" />

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} children={<CreateWorkStep />} stepName="workStep" />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} children={<CreateWorkStep />} stepName="workStep" />
        </>
    )
}

export default WorkStepPanel
