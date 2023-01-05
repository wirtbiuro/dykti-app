import React from 'react'
import { IQuery, IOrder, StepName, Role, getStepnameByRole } from '../../types'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import useGetOrders from '../../hooks/useGetOrders'

const LastDecisionPanel = () => {
    const role: Role = 'LastDecisionUser'

    const currentStep: StepName = getStepnameByRole(role)

    const { data, isError }: IQuery<IOrder> = useGetOrders(role)

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} stepName={currentStep} />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} stepName={currentStep} />
        </>
    )
}

export default LastDecisionPanel
