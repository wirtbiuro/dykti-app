import React from 'react'
import { IQuery, IOrder, StepName } from '../../types'
import { useGetOrdersQuery } from '../../state/apiSlice'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import CreateWorkStep from '../steps/CreateWorkStep'
import ReferenceStep from '../steps/ReferenceStep'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'

const ReferencePanel = () => {
    const currentStep: StepName = 'referenceStep'

    const { data, isError }: IQuery<IOrder> = useGetOrders('WorkRespUser')

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<ReferenceStep />} stepName="referenceStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<ReferenceStep />} stepName="referenceStep" />

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} children={<ReferenceStep />} stepName="referenceStep" />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} children={<ReferenceStep />} stepName="referenceStep" />
        </>
    )
}

export default ReferencePanel
