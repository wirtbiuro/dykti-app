import React, { useState } from 'react'
import CreateForm from './CreateForm'
import { useGetUserQuery, useGetCompletedOrdersQuery } from '../state/apiSlice'
import { IQuery, IOrder } from '../types'
import Step from './Step'

const CreatorFormPanel = () => {
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
    const [showNewOrder, setShowNewOrder] = useState<boolean>(false)

    const userQueryData = useGetUserQuery()
    const { data: ordersData }: IQuery<IOrder> = useGetCompletedOrdersQuery()

    const orderClicked = (orderId: number | null) => {
        const newOrderId = orderId === currentOrderId ? null : orderId
        setCurrentOrderId(newOrderId)
    }

    return (
        <div>
            <div>
                <button
                    onClick={() => {
                        setShowNewOrder((showOrder) => !showOrder)
                    }}
                >
                    {showNewOrder ? 'Anulować' : 'Nowa sprawa'}
                </button>
                {showNewOrder && <CreateForm />}
            </div>

            <div>
                {ordersData?.map((order) => {
                    return (
                        <div key={order.id}>
                            <button
                                onClick={() => {
                                    orderClicked(order.id)
                                }}
                            >
                                {currentOrderId === order.id
                                    ? 'Anulować'
                                    : 'Edytować'}
                            </button>
                            {currentOrderId === order.id && (
                                <CreateForm order={order} />
                            )}
                            {currentOrderId !== order.id && (
                                <div>
                                    <Step
                                        step={
                                            order.steps[order.steps.length - 1]
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CreatorFormPanel
