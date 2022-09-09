import React, { useState } from 'react'
import { IQuery, IOrder, StepName, stepNames } from '../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../state/apiSlice'
import CreateOfferStep from './CreateOfferStep'
import Orders from './Orders'
import CreateContractStep from './CreateContractStep'
import { getArrIdx, getDatas } from '../utilities'

const ContractPreparerPanel = () => {
    const { data }: IQuery<IOrder> = useGetOrdersQuery('ContractPreparer')

    const currentStep: StepName = 'contractStep'

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<CreateContractStep />} stepName="contractStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<CreateContractStep />} stepName="contractStep" />

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} children={<CreateContractStep />} stepName="contractStep" />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} children={<CreateContractStep />} stepName="contractStep" />
        </>
    )
}

export default ContractPreparerPanel
