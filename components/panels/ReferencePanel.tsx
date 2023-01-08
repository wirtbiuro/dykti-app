import React from 'react'
import { IQuery, IOrder, StepName, Role, getStepnameByRole } from '../../types'
import { useGetOrdersQuery } from '../../state/apiSlice'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import CreateWorkStep from '../steps/CreateWorkStep'
import ReferenceStep from '../steps/ReferenceStep'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const ReferencePanel = () => {
    const role: Role = 'ReferenceUser'

    const currentStep: StepName = getStepnameByRole(role)

    const { data, isError }: IQuery<IOrder> = useGetOrders(role)

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
            renderedComponent={<ReferenceStep />}
            stepName="referenceStep"
        />
    )
}

export default ReferencePanel
