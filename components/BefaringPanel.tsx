import React, { useState } from 'react'
import { IQuery, IOrder } from '../types'
import {
    useGetOrdersQuery,
    useGetCompletedOrdersQuery,
    useConfirmViewingByPerfomerMutation,
    useCreateOrderMutation,
} from '../state/apiSlice'
import CreateBefaringStep from './CreateBefaringStep'
import { OrderStyled, StepStyled } from '../styles/styled-components'
import Step from './Step'
import { DateTime } from 'luxon'
import Orders from './Orders'

const BefaringPanel = () => {
    const { data }: IQuery<IOrder> = useGetOrdersQuery('BefaringUser')
    const { data: processedData }: IQuery<IOrder> = useGetCompletedOrdersQuery(
        'BefaringUser'
    )

    const completedOrdersData = processedData?.filter(
        (order) => order.steps[order.steps.length - 1].beffaringStepIsCompleted
    )
    const editedOrdersData = processedData?.filter(
        (order) => !order.steps[order.steps.length - 1].beffaringStepIsCompleted
    )
    const currentData = data?.filter(
        (order) => order.steps[order.steps.length - 1].formStepIsCompleted
    )
    const passedForEditData = data?.filter(
        (order) => !order.steps[order.steps.length - 1].formStepIsCompleted
    )

    if (!data || !completedOrdersData) return <>Ładowanie danych...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>

            <Orders
                orders={currentData}
                children={<CreateBefaringStep />}
                stepName="beffaringStep"
            />

            <h2>Do poprawienia:</h2>

            <Orders
                orders={editedOrdersData}
                children={<CreateBefaringStep />}
                stepName="beffaringStep"
            />

            <h2>Przekazane dalej:</h2>

            <Orders
                orders={completedOrdersData}
                children={<CreateBefaringStep />}
                stepName="beffaringStep"
            />

            <h2>Przekazane do poprawienia:</h2>

            <Orders
                orders={passedForEditData}
                children={<CreateBefaringStep />}
                stepName="beffaringStep"
            />
        </>
    )
}

export default BefaringPanel
