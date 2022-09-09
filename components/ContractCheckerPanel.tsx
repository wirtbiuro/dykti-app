import React, { useState } from 'react'
import { IQuery, IOrder, StepName } from '../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery } from '../state/apiSlice'
import Orders from './Orders'
import CreateContractStep from './CreateContractStep'
import CreateContractCheckerStep from './CreateContractCheckerStep'
import { getDatas } from '../utilities'

const ContractCheckerPanel = () => {
    const { data }: IQuery<IOrder> = useGetOrdersQuery('ContractChecker')

    const currentStep: StepName = 'contractCheckerStep'

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<CreateContractCheckerStep />} stepName="contractCheckerStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<CreateContractCheckerStep />} stepName="contractCheckerStep" />

            <h2>Przekazane dalej:</h2>

            <Orders
                orders={completedOrdersData}
                children={<CreateContractCheckerStep />}
                stepName="contractCheckerStep"
            />

            <h2>Przekazane do poprawienia:</h2>

            <Orders
                orders={passedForEditData}
                children={<CreateContractCheckerStep />}
                stepName="contractCheckerStep"
            />
        </>
    )
}

export default ContractCheckerPanel
