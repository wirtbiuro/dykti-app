import React, { useState } from 'react'
import { IQuery, IOrder } from '../types'
import {
    useGetOrdersQuery,
    useGetCompletedOrdersQuery,
    useConfirmViewingByPerfomerMutation,
} from '../state/apiSlice'
import CreateBefaringStep from './CreateBefaringStep'
import { OrderStyled, StepStyled } from '../styles/styled-components'
import Step from './Step'

const BefaringPanel = () => {
    const { data }: IQuery<IOrder> = useGetOrdersQuery()
    const {
        data: completedOrdersData,
    }: IQuery<IOrder> = useGetCompletedOrdersQuery()

    const [confirmViewing] = useConfirmViewingByPerfomerMutation()

    console.log({ data })
    console.log({ completedOrdersData })

    const [viewingFormOrderId, setViewingFormOrderId] = useState<
        number | null
    >()
    const [editOrderId, setEditOrderId] = useState<number | null>()

    const [historyOrderId, setHistoryOrderId] = useState<number | null>()
    const [historyCompletedOrderId, setHistoryCompletedOrderId] = useState<
        number | null
    >()

    if (!data || !completedOrdersData) return <>No data yet...</>

    return (
        <>
            <h2>Sprawy bieżące:</h2>
            <OrderStyled>
                {data.map((order) => {
                    const step = order.steps[order.steps.length - 1]
                    const isViewConfirmed =
                        step.formStep?.record.isViewingConfirmedByPerfomer

                    return (
                        <StepStyled key={order.id}>
                            <Step step={step} />
                            {viewingFormOrderId !== order.id && (
                                <button
                                    onClick={() =>
                                        setViewingFormOrderId(Number(order.id))
                                    }
                                >
                                    Kontynuować
                                </button>
                            )}
                            {viewingFormOrderId === order.id && (
                                <button
                                    onClick={() =>
                                        setViewingFormOrderId(Number(null))
                                    }
                                >
                                    Zamknij
                                </button>
                            )}
                            {!isViewConfirmed && (
                                <button
                                    onClick={() => confirmViewing({ order })}
                                >
                                    Potwierdź akceptację
                                </button>
                            )}
                            {historyOrderId !== order.id && (
                                <button
                                    onClick={() => setHistoryOrderId(order.id)}
                                >
                                    Pokaż historię zmian
                                </button>
                            )}
                            {historyOrderId === order.id && (
                                <button onClick={() => setHistoryOrderId(null)}>
                                    Zamknij histoię zmian
                                </button>
                            )}

                            {viewingFormOrderId === order.id && (
                                <CreateBefaringStep order={order} />
                            )}

                            {historyOrderId === order.id && (
                                <div>
                                    Zmiany:
                                    {order.steps.map((step) => (
                                        <Step key={step.id} step={step} />
                                    ))}
                                </div>
                            )}
                        </StepStyled>
                    )
                })}
            </OrderStyled>
            <h2>Przekazane dalej:</h2>
            <OrderStyled>
                {completedOrdersData.map((order) => {
                    const step = order.steps[order.steps.length - 1]
                    const wasOfferSent = step.befaringStep?.wasOfferSent
                    const meetingDate = step.befaringStep?.meetingDate
                    const comment = step.befaringStep?.record.comment
                    return (
                        <StepStyled key={order.id}>
                            <Step step={step} />
                            {editOrderId !== order.id && (
                                <button
                                    onClick={() =>
                                        setEditOrderId(Number(order.id))
                                    }
                                >
                                    Edytować
                                </button>
                            )}
                            {editOrderId === order.id && (
                                <button onClick={() => setEditOrderId(null)}>
                                    Anulować
                                </button>
                            )}
                            {historyCompletedOrderId !== order.id && (
                                <button
                                    onClick={() =>
                                        setHistoryCompletedOrderId(order.id)
                                    }
                                >
                                    Pokaż historię zmian
                                </button>
                            )}
                            {historyCompletedOrderId === order.id && (
                                <button
                                    onClick={() =>
                                        setHistoryCompletedOrderId(null)
                                    }
                                >
                                    Zamknij historię zmian
                                </button>
                            )}
                            {editOrderId === order.id && (
                                <CreateBefaringStep
                                    order={order}
                                    wasOfferSent={wasOfferSent}
                                    comment={comment}
                                    meetingDate={meetingDate}
                                />
                            )}
                            {historyCompletedOrderId === order.id && (
                                <div>
                                    Zmiany:
                                    {order.steps.map((step) => (
                                        <Step key={step.id} step={step} />
                                    ))}
                                </div>
                            )}
                        </StepStyled>
                    )
                })}
            </OrderStyled>
        </>
    )
}

export default BefaringPanel
