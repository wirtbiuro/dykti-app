import React, { useState } from 'react'
import { IQuery, IOrder, stepNames, StepName } from '../../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../../state/apiSlice'
import CreateOfferStep from '../steps/CreateOfferStep'
import Orders from '../Orders'
import { getArrIdx, getDatas } from '../../utilities'
import QuestionnaireStep from '../steps/QuestionnaireStep'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const QuestionnairePanel = () => {
    const { data, isError }: IQuery<IOrder> = useGetOrders('QuestionnaireUser')
    // const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery('OfferCreator')

    const currentStep: StepName = 'completionStep'

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <AllCategoryOrders
            currentData={currentData}
            editedOrdersData={editedOrdersData}
            completedOrdersData={completedOrdersData}
            passedForEditData={passedForEditData}
            renderedComponent={<QuestionnaireStep />}
            stepName="completionStep"
        />
    )
}

export default QuestionnairePanel
