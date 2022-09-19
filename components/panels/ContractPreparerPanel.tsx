import React, { useState } from 'react'
import { IQuery, IOrder, StepName, stepNames } from '../../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../../state/apiSlice'
import CreateOfferStep from '../steps/CreateOfferStep'
import Orders from '../Orders'
import CreateContractStep from '../steps/CreateContractStep'
import { getArrIdx, getDatas } from '../../utilities'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const ContractPreparerPanel = () => {
    const { data, isError }: IQuery<IOrder> = useGetOrders('ContractPreparer')

    const currentStep: StepName = 'contractStep'

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <AllCategoryOrders
            currentData={currentData}
            editedOrdersData={editedOrdersData}
            completedOrdersData={completedOrdersData}
            passedForEditData={passedForEditData}
            renderedComponent={<CreateContractStep />}
            stepName="contractStep"
        />
    )
}

export default ContractPreparerPanel
