import React, { useState } from 'react'
import { IQuery, IOrder, stepNames, StepName } from '../../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../../state/apiSlice'
import CreateOfferStep from '../steps/CreateOfferStep'
import Orders from '../Orders'
import { getArrIdx, getDatas } from '../../utilities'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'

const OfferCreatorPanel = () => {
    const { data, isError }: IQuery<IOrder> = useGetOrders('OfferCreator')
    // const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery('OfferCreator')

    const currentStep: StepName = 'offerStep'

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<CreateOfferStep />} stepName="offerStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<CreateOfferStep />} stepName="offerStep" />

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} children={<CreateOfferStep />} stepName="offerStep" />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} children={<CreateOfferStep />} stepName="offerStep" />
        </>
    )
}

export default OfferCreatorPanel
