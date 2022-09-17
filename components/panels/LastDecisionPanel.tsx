import React from 'react'
import { IQuery, IOrder, StepName, Role, getStepnameByRole } from '../../types'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import CreateWorkStep from '../steps/CreateWorkStep'
import useGetOrders from '../../hooks/useGetOrders'
import LastDecisionStep from '../steps/LastDecisionStep'

const LastDecisionPanel = () => {
    const role: Role = 'LastDecisionUser'

    const currentStep: StepName = getStepnameByRole(role)

    const { data, isError }: IQuery<IOrder> = useGetOrders(role)

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<LastDecisionStep />} stepName={currentStep} />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<LastDecisionStep />} stepName={currentStep} />

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} children={<LastDecisionStep />} stepName={currentStep} />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} children={<LastDecisionStep />} stepName={currentStep} />
        </>
    )
}

export default LastDecisionPanel
