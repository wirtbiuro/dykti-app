import React, { useState } from 'react'
import { IQuery, IOrder, StepName } from '../../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../../state/apiSlice'
import Orders from '../Orders'
import CreateContractStep from '../steps/CreateContractStep'
import CreateContractCreatorStep from '../steps/CreateContractCreatorStep'
import { getDatas } from '../../utilities'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const ContractCreatorPanel = () => {
    const currentStep: StepName = 'contractCreatorStep'

    const { data, isError }: IQuery<IOrder> = useGetOrders('ContractCreator')

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <AllCategoryOrders
            currentData={currentData}
            editedOrdersData={editedOrdersData}
            completedOrdersData={completedOrdersData}
            passedForEditData={passedForEditData}
            renderedComponent={<CreateContractCreatorStep />}
            stepName="contractCreatorStep"
        />
    )
}

export default ContractCreatorPanel
