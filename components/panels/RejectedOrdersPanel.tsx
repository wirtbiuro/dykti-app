import React from 'react'
import { IQuery, IOrder, StepName, Role, getStepnameByRole } from '../../types'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import useGetOrders from '../../hooks/useGetOrders'

const RejectedOrdersPanel = () => {
    const role: Role = 'RejectedOrdersViewer'

    const currentStep: StepName = getStepnameByRole(role)

    const { data, isError }: IQuery<IOrder> = useGetOrders(role)

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <Orders orders={currentData} stepName={currentStep} />
        </>
    )
}

export default RejectedOrdersPanel
