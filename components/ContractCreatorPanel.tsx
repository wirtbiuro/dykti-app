import React, { useState } from 'react'
import { IQuery, IOrder } from '../types'
import {
    useGetOrdersQuery,
    useGetCompletedOrdersQuery,
} from '../state/apiSlice'
import CreateOfferStep from './CreateOfferStep'
import Orders from './Orders'
import CreateContractStep from './CreateContractStep'

const ContractCreatorPanel = () => {
    const { data }: IQuery<IOrder> = useGetOrdersQuery()
    const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery()

    const completedOrdersData = processedData?.filter(
        (order) => order.steps[order.steps.length - 1].contractStepIsCompleted
    )
    const editedOrdersData = processedData?.filter(
        (order) => !order.steps[order.steps.length - 1].contractStepIsCompleted
    )
    const currentData = data?.filter(
        (order) => order.steps[order.steps.length - 1].offerStepIsCompleted
    )
    const passedForEditData = data?.filter(
        (order) => !order.steps[order.steps.length - 1].offerStepIsCompleted
    )

    if (!data || !completedOrdersData) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders
                orders={currentData}
                children={<CreateContractStep />}
                stepName="contractStep"
            />

            <h2>Do poprawienia:</h2>

            <Orders
                orders={editedOrdersData}
                children={<CreateContractStep />}
                stepName="contractStep"
            />

            <h2>Przekazane dalej:</h2>

            <Orders
                orders={completedOrdersData}
                children={<CreateContractStep />}
                stepName="contractStep"
            />

            <h2>Przekazane do poprawienia:</h2>

            <Orders
                orders={passedForEditData}
                children={<CreateContractStep />}
                stepName="contractStep"
            />
        </>
    )
}

export default ContractCreatorPanel
