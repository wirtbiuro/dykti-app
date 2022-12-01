import React, { FC } from 'react'
import { getStepProps } from '../utilities'
import { StepType, StepName } from '../types'
import { StepPropsStyled } from '../styles/styled-components'
import { useSimpleStore } from '../simple-store/store'

interface IStepPropsProps {
    step: StepType
    stepName: StepName
    orderId: number
}

const MainStepProps: FC<IStepPropsProps> = ({ step, stepName, orderId }) => {
    const [orderStore, setOrderStore] = useSimpleStore()

    const props = getStepProps(step)

    const getDescription = (propName: keyof StepType): string => {
        return props.find((prop) => prop.key === propName)?.fieldName || ''
    }

    const getValue = (propName: keyof StepType): string => {
        return props.find((prop) => prop.key === propName)?.view || ''
    }

    const onShowMore = (orderId?: number) => {
        setOrderStore({
            visibleOrderId: orderId || null,
        })
    }

    return (
        <StepPropsStyled>
            <div className="prop">
                <p className="description">{getDescription('formStepClientName')}:</p>
                <strong>
                    <p className="value">{getValue('formStepClientName')}</p>
                </strong>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepPhone')}:</p>
                <p className="value">{getValue('formStepPhone')}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepEmail')}:</p>
                <p className="value">{getValue('formStepEmail')}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepAddress')}:</p>
                <p className="value">{getValue('formStepAddress')}</p>
            </div>
            {stepName === 'offerStep' && (
                <div className="prop">
                    <p className="description">{getDescription('beffaringStepOfferDate')}:</p>
                    <p className="value">{getValue('beffaringStepOfferDate')}</p>
                </div>
            )}
            {stepName === 'contractCheckerStep' && (
                <>
                    <div className="prop">
                        <p className="description">{getDescription('contractStepSentForVerificationDate')}:</p>
                        <p className="value">{getValue('contractStepSentForVerificationDate')}</p>
                    </div>
                </>
            )}

            {orderStore.visibleOrderId === orderId ? (
                <button onClick={() => onShowMore()}>Pokaż mniej</button>
            ) : (
                <button onClick={() => onShowMore(orderId)}>Pokaż więcej</button>
            )}
        </StepPropsStyled>
    )
}

export default MainStepProps
