import React, { useState, useEffect } from 'react'
import CreateForm from '../steps/CreateForm'
import { useGetUserQuery, dyktiApi, useGetOrdersQuery } from '../../state/apiSlice'
import { IQuery, IOrder, stepNames, StepName } from '../../types'
import Step from '../Step'
import Orders from '../Orders'
import { getArrIdx, getDatas } from '../../utilities'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'

const CreatorFormPanel = () => {
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
    const [showNewOrder, setShowNewOrder] = useState<boolean>(false)

    // const userQueryData = useGetUserQuery('FormCreator')
    const { data, isError }: IQuery<IOrder> = useGetOrders('FormCreator')

    const currentStep: StepName = 'formStep'

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    const orderClicked = (orderId: number | null) => {
        const newOrderId = orderId === currentOrderId ? null : orderId
        setCurrentOrderId(newOrderId)
    }

    // if (!data) return <>Ładowanie danych...</>

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
                {showNewOrder && <CreateForm isVisible={showNewOrder} />}
            </div>

            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentData} children={<CreateForm />} stepName="formStep" />

            <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} children={<CreateForm />} stepName="formStep" />

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} children={<CreateForm />} stepName="formStep" />

            {/* <div>
                {ordersData?.map((order) => {
                    return (
                        <div key={order.id}>
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
                            <button
                                onClick={() => {
                                    orderClicked(order.id)
                                }}
                            >
                                {currentOrderId === order.id
                                    ? 'Anulować'
                                    : 'Edytować'}
                            </button>
                        </div>
                    )
                })}
            </div> */}
        </div>
    )
}

export default CreatorFormPanel
