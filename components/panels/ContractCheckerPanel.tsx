import React, { useState } from 'react'
import { IQuery, IOrder, StepName } from '../../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../../state/apiSlice'
import Orders from '../Orders'
import CreateContractStep from '../steps/CreateContractStep'
import CreateContractCheckerStep from '../steps/CreateContractCheckerStep'
import { getDatas } from '../../utilities'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const ContractCheckerPanel = () => {
    const { data, isError }: IQuery<IOrder> = useGetOrders('ContractChecker')

    const currentStep: StepName = 'contractCheckerStep'

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
            renderedComponent={<CreateContractCheckerStep />}
            stepName="contractCheckerStep"
        />
    )
}

export default ContractCheckerPanel
