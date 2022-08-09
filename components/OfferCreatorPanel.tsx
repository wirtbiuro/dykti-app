import React, { useState } from 'react'
import { IQuery, IOrder } from '../types'
import {
    useGetOrdersQuery,
    useGetCompletedOrdersQuery,
} from '../state/apiSlice'
import CreateOfferStep from './CreateOfferStep'
import Orders from './Orders'

const OfferCreatorPanel = () => {
    const { data }: IQuery<IOrder> = useGetOrdersQuery('OfferCreator')
    const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery(
        'OfferCreator'
    )

    const completedOrdersData = processedData?.filter(
        (order) => order.steps[order.steps.length - 1].offerStepIsCompleted
    )
    const editedOrdersData = processedData?.filter(
        (order) => !order.steps[order.steps.length - 1].offerStepIsCompleted
    )
    const currentData = data?.filter(
        (order) => order.steps[order.steps.length - 1].beffaringStepIsCompleted
    )
    const passedForEditData = data?.filter(
        (order) => !order.steps[order.steps.length - 1].beffaringStepIsCompleted
    )

    if (!data || !completedOrdersData) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders
                orders={currentData}
                children={<CreateOfferStep />}
                stepName="offerStep"
            />

            <h2>Do poprawienia:</h2>

            <Orders
                orders={editedOrdersData}
                children={<CreateOfferStep />}
                stepName="offerStep"
            />

            <h2>Przekazane dalej:</h2>

            <Orders
                orders={completedOrdersData}
                children={<CreateOfferStep />}
                stepName="offerStep"
            />

            <h2>Przekazane do poprawienia:</h2>

            <Orders
                orders={passedForEditData}
                children={<CreateOfferStep />}
                stepName="offerStep"
            />
        </>
    )
}

export default OfferCreatorPanel
