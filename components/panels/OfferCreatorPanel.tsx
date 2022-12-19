import React, { useState } from 'react'
import { IQuery, IOrder, stepNames, StepName } from '../../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../../state/apiSlice'
import CreateOfferStep from '../steps/CreateOfferStep'
import Orders from '../Orders'
import { getArrIdx, getDatas } from '../../utilities'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const OfferCreatorPanel = () => {
    const { data, isError }: IQuery<IOrder> = useGetOrders('OfferCreator')
    // const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery('OfferCreator')

    const currentStep: StepName = 'offerStep'

    const {
        completedOrdersData,
        currentData,
        editedOrdersData,
        passedForEditData,
        currentOrEditedOrdersData,
    } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <AllCategoryOrders
            currentOrEditedOrdersData={currentOrEditedOrdersData}
            currentData={currentData}
            editedOrdersData={editedOrdersData}
            completedOrdersData={completedOrdersData}
            passedForEditData={passedForEditData}
            renderedComponent={<CreateOfferStep />}
            stepName="offerStep"
        />
    )
}

export default OfferCreatorPanel
