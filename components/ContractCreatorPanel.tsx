import React, { useState } from 'react'
import { IQuery, IOrder, StepName } from '../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../state/apiSlice'
import Orders from './Orders'
import CreateContractStep from './CreateContractStep'
import CreateContractCreatorStep from './CreateContractCreatorStep'
import { getDatas } from '../utilities'

const ContractCreatorPanel = () => {
    const currentStep: StepName = 'contractCreatorStep'

    const { data }: IQuery<IOrder> = useGetOrdersQuery('ContractCreator')

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<CreateContractCreatorStep />} stepName="contractCreatorStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<CreateContractCreatorStep />} stepName="contractCreatorStep" />

            <h2>Przekazane dalej:</h2>

            <Orders
                orders={completedOrdersData}
                children={<CreateContractCreatorStep />}
                stepName="contractCreatorStep"
            />

            <h2>Przekazane do poprawienia:</h2>

            <Orders
                orders={passedForEditData}
                children={<CreateContractCreatorStep />}
                stepName="contractCreatorStep"
            />
        </>
    )
}

export default ContractCreatorPanel
