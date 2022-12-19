import React from 'react'
import { IQuery, IOrder, StepName } from '../../types'
import { getDatas } from '../../utilities'
import QuestionnaireStep from '../steps/QuestionnaireStep'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const QuestionnairePanel = () => {
    const { data, isError }: IQuery<IOrder> = useGetOrders('QuestionnaireUser')
    // const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery('OfferCreator')

    const currentStep: StepName = 'questionnaireStep'

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
            renderedComponent={<QuestionnaireStep />}
            stepName="questionnaireStep"
        />
    )
}

export default QuestionnairePanel
