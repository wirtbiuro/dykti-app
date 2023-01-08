import React, { useState, FC } from 'react'
import { CompletedOrdersStepStyled } from '../../styles/styled-components'
import { roleTitles, roles, getStepnameByRole, IOrder, WithValueNFocus, ISendCheckboxes, IWithOrder } from '../../types'
import ServiceStep from './ServiceStep'
import ServiceProps from '../ServiceProps'

const CompletedOrdersStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    console.log('completed order', order)

    const [isServiceStepVisible, setIsServiceStepVisible] = useState(false)

    const _roles = roles
        .filter((role) => !['LastDecisionUser', 'RejectedOrdersViewer', 'CompletedOrdersViewer'].includes(role))
        .map((role) => {
            return [getStepnameByRole(role), roleTitles[role]]
        })

    const addService = () => {
        setIsServiceStepVisible((isServiceStepVisible) => !isServiceStepVisible)
    }

    return (
        <>
            {isVisible && (
                <CompletedOrdersStepStyled>
                    {order!.services && order!.services?.length > 0 && (
                        <>
                            <h3>Serwisy:</h3>
                            {order?.services?.map((service) => (
                                <ServiceProps order={order} service={service} key={service.id} />
                            ))}
                        </>
                    )}

                    <button className="add-service-btn" onClick={addService}>
                        {isServiceStepVisible ? 'Anulować' : 'Dodać Serwis'}
                    </button>
                    <ServiceStep
                        order={order}
                        isVisible={isServiceStepVisible}
                        setIsVisible={setIsServiceStepVisible}
                    />
                </CompletedOrdersStepStyled>
            )}
        </>
    )
}

export default CompletedOrdersStep
