import React from 'react'
import { IQuery, IOrder, StepName } from '../../types'
import { useGetOrdersQuery } from '../../state/apiSlice'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import CreateWorkStep from '../steps/CreateWorkStep'
import ReferenceStep from '../steps/ReferenceStep'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const ReferencePanel = () => {
    const currentStep: StepName = 'referenceStep'

    const { data, isError }: IQuery<IOrder> = useGetOrders('WorkRespUser')

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <AllCategoryOrders
            currentData={currentData}
            editedOrdersData={editedOrdersData}
            completedOrdersData={completedOrdersData}
            passedForEditData={passedForEditData}
            renderedComponent={<ReferenceStep />}
            stepName="referenceStep"
        />
    )
}

export default ReferencePanel
