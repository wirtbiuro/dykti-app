import React, { useState, useEffect } from 'react'
import CreateForm from '../steps/CreateForm'
import { useGetUserQuery, dyktiApi, useGetOrdersQuery } from '../../state/apiSlice'
import { IQuery, IOrder, stepNames, StepName } from '../../types'
import Step from '../Step'
import Orders from '../Orders'
import { getArrIdx, getDatas } from '../../utilities'
import useRefetchUserOnOrdersError from '../../hooks/useGetOrders'
import useGetOrders from '../../hooks/useGetOrders'
import { CreatorFormPanelStyled } from '../../styles/styled-components'

const CreatorFormPanel = () => {
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)

    // const userQueryData = useGetUserQuery('FormCreator')
    const { data, isError }: IQuery<IOrder> = useGetOrders('FormCreator')

    const currentStep: StepName = 'formStep'

    const {
        completedOrdersData,
        currentData,
        editedOrdersData,
        passedForEditData,
        currentOrEditedOrdersData,
    } = getDatas({ data, currentStep })

    const noMeetingDateData = data?.filter((order) => {
        const lastStep = order.steps[order.steps.length - 1]
        return lastStep.passedTo === 'beffaringStep' && !lastStep.formStepMeetingDate
    })

    const orderClicked = (orderId: number | null) => {
        const newOrderId = orderId === currentOrderId ? null : orderId
        setCurrentOrderId(newOrderId)
    }

    const [isVisible, setIsVisible] = useState<boolean>(false)

    // if (!data) return <>Ładowanie danych...</>

    return (
        <CreatorFormPanelStyled>
            <div>
                <button
                    onClick={() => {
                        setIsVisible((isVisible) => !isVisible)
                    }}
                    className="new-deal"
                >
                    {isVisible ? 'Anulować' : 'Nowa sprawa'}
                </button>
                {isVisible && <CreateForm isVisible={isVisible} setIsVisible={setIsVisible} />}
            </div>

            <h2>Sprawy bieżące:</h2>

            <Orders orders={currentOrEditedOrdersData} stepName="formStep" />

            {/* <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} stepName="formStep" /> */}

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} stepName="formStep" />

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
        </CreatorFormPanelStyled>
    )
}

export default CreatorFormPanel
