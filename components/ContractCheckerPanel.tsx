import React, { useState } from 'react'
import { IQuery, IOrder } from '../types'
import {
    useGetOrdersQuery,
    useGetCompletedOrdersQuery,
} from '../state/apiSlice'
import Orders from './Orders'
import CreateContractStep from './CreateContractStep'
import CreateContractCheckerStep from './CreateContractCheckerStep'

const ContractCheckerPanel = () => {
    const { data }: IQuery<IOrder> = useGetOrdersQuery('ContractChecker')
    const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery(
        'ContractChecker'
    )

    const completedOrdersData = processedData?.filter(
        (order) =>
            order.steps[order.steps.length - 1].contractCheckerStepIsCompleted
    )
    const editedOrdersData = processedData?.filter(
        (order) =>
            !order.steps[order.steps.length - 1].contractCheckerStepIsCompleted
    )
    const currentData = data?.filter(
        (order) => order.steps[order.steps.length - 1].contractStepIsCompleted
    )
    const passedForEditData = data?.filter(
        (order) => !order.steps[order.steps.length - 1].contractStepIsCompleted
    )

    if (!data || !completedOrdersData) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders
                orders={currentData}
                children={<CreateContractCheckerStep />}
                stepName="contractCheckerStep"
            />

            <h2>Do poprawienia:</h2>

            <Orders
                orders={editedOrdersData}
                children={<CreateContractCheckerStep />}
                stepName="contractCheckerStep"
            />

            <h2>Przekazane dalej:</h2>

            <Orders
                orders={completedOrdersData}
                children={<CreateContractCheckerStep />}
                stepName="contractCheckerStep"
            />

            <h2>Przekazane do poprawienia:</h2>

            <Orders
                orders={passedForEditData}
                children={<CreateContractCheckerStep />}
                stepName="contractCheckerStep"
            />
        </>
    )
}

export default ContractCheckerPanel
