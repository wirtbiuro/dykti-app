import React, { FC } from 'react'
import { IOrder, StepName } from '../types'
import { OrderStyled } from '../styles/styled-components'
import Order from './Order'
import { DateTime } from 'luxon'

interface IOrderProps {
    orders: Array<IOrder>
    stepName: StepName
    children?: JSX.Element
}

const Orders: FC<IOrderProps> = ({ orders, stepName }) => {
    return (
        <>
            <OrderStyled>
                {orders &&
                    orders
                        .filter(
                            (order) =>
                                order.steps[order.steps.length - 1].passedTo !== 'lastDecisionStep' ||
                                stepName === 'lastDecisionStep'
                        )
                        .sort((a, b) => {
                            const alastStep = a.steps[a.steps.length - 1]
                            const blastStep = b.steps[b.steps.length - 1]
                            if (stepName === 'offerStep') {
                                const aOfferDate =
                                    (alastStep.beffaringStepOfferDate as string) ||
                                    DateTime.now().plus({ year: 1 }).toISO()
                                const bOfferDate =
                                    (blastStep.beffaringStepOfferDate as string) ||
                                    DateTime.now().plus({ year: 1 }).toISO()

                                return (
                                    (DateTime.fromISO(aOfferDate).toMillis() || 0) -
                                    (DateTime.fromISO(bOfferDate).toMillis() || 0)
                                )
                            }
                            const aCreatedAt = alastStep.createdAt || DateTime.now().toISO()
                            const bCreatedAt = blastStep.createdAt || DateTime.now().toISO()
                            return DateTime.fromISO(aCreatedAt).toMillis() - DateTime.fromISO(bCreatedAt).toMillis()
                        })
                        .map((order) => <Order order={order} key={order.id} stepName={stepName} />)}
            </OrderStyled>
        </>
    )
}

export default Orders
