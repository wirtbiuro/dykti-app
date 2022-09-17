import React, { FC } from 'react'
import { IOrder, StepName } from '../types'
import { OrderStyled } from '../styles/styled-components'
import Order from './Order'

interface IOrderProps {
    orders: Array<IOrder>
    stepName: StepName
    children?: JSX.Element
}

const Orders: FC<IOrderProps> = ({ orders, stepName, children }) => {
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
                        .map((order) => <Order order={order} stepName={stepName} children={children} />)}
            </OrderStyled>
        </>
    )
}

export default Orders
