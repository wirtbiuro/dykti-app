import React, { useState, FC } from 'react'
import { IQuery, IOrder, StepName, StepType } from '../types'
import { OrderStyled, StepStyled } from '../styles/styled-components'
import Step from './Step'
import { DateTime } from 'luxon'
import { useCreateOrderMutation } from '../state/apiSlice'

interface IOrderProps {
    orders: Array<IOrder>
    stepName: StepName
    children?: JSX.Element
}

const Orders: FC<IOrderProps> = ({ orders, stepName, children }) => {
    const [viewingFormOrderId, setViewingFormOrderId] = useState<
        number | null
    >()

    const [historyOrderId, setHistoryOrderId] = useState<number | null>()

    const [createOrder] = useCreateOrderMutation()

    const getPrevStep: (order: IOrder, idx: number) => StepType = (
        order,
        idx
    ) => {
        return idx > 0 ? order.steps[idx - 1] : {}
    }

    return (
        <OrderStyled>
            {orders.map((order) => {
                const step = order.steps[order.steps.length - 1] as any
                const isViewConfirmed =
                    step[`${stepName}PrevStepConfirmationDate`]

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
                                onClick={() =>
                                    createOrder({
                                        order,
                                        [`${stepName}PrevStepConfirmationDate`]: DateTime.now(),
                                        [`${stepName}IsCompleted`]: false,
                                    })
                                }
                            >
                                Potwierdź akceptację
                            </button>
                        )}
                        {historyOrderId !== order.id && (
                            <button onClick={() => setHistoryOrderId(order.id)}>
                                Pokaż historię zmian
                            </button>
                        )}
                        {historyOrderId === order.id && (
                            <button onClick={() => setHistoryOrderId(null)}>
                                Zamknij histoię zmian
                            </button>
                        )}

                        {React.cloneElement(children as JSX.Element, {
                            isVisible: viewingFormOrderId === order.id,
                            order,
                        })}

                        {historyOrderId === order.id && (
                            <div>
                                Zmiany:
                                {order.steps.map((step, idx) => (
                                    <Step
                                        key={step.id}
                                        step={step}
                                        prevStep={getPrevStep(order, idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </StepStyled>
                )
            })}
        </OrderStyled>
    )
}

export default Orders
