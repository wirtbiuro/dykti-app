import React, { FC } from 'react'
import { getStepProps, getLastStepWherePassedToWasChanged, getArrIdx } from '../utilities'
import { StepType, StepName, IOrder, stepNames } from '../types'
import { StepPropsStyled } from '../styles/styled-components'
import { useSimpleStore } from '../simple-store/store'

interface IStepPropsProps {
    step: StepType
    stepName: StepName
    order: IOrder
}

const MainStepProps: FC<IStepPropsProps> = ({ step, stepName, order }) => {
    const [orderStore, setOrderStore] = useSimpleStore()

    const props = getStepProps(step)
    type PropsType = typeof props

    const lastStepWherePassedToWasChanged = getLastStepWherePassedToWasChanged({ order, stepName })
    const lastStepWherePassedToWasChangedProps = lastStepWherePassedToWasChanged
        ? getStepProps(lastStepWherePassedToWasChanged)
        : []

    const directionIdx =
        getArrIdx(stepName, stepNames) - getArrIdx(lastStepWherePassedToWasChanged?.createdByStep!, stepNames)

    const getDescription = (propName: keyof StepType, props: PropsType): string => {
        return props.find((prop) => prop.key === propName)?.fieldName || ''
    }

    const getValue = (propName: keyof StepType, props: PropsType): string => {
        return props.find((prop) => prop.key === propName)?.view || ''
    }

    const onShowMore = (orderId?: number) => {
        setOrderStore({
            visibleOrderId: orderId || null,
        })
    }

    return (
        <StepPropsStyled>
            {step.passedTo === stepName && (
                <div className="direction">{directionIdx > 0 ? <>&rarr;</> : <>&larr;</>}</div>
            )}
            <div className="prop">
                <p className="description">{getDescription('formStepClientName', props)}:</p>
                <strong>
                    <p className="value">{getValue('formStepClientName', props)}</p>
                </strong>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepPhone', props)}:</p>
                <p className="value">{getValue('formStepPhone', props)}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepEmail', props)}:</p>
                <p className="value">{getValue('formStepEmail', props)}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepAddress', props)}:</p>
                <p className="value">{getValue('formStepAddress', props)}</p>
            </div>
            {lastStepWherePassedToWasChanged &&
                step.passedTo === stepName &&
                lastStepWherePassedToWasChanged.createdByStep === 'formStep' &&
                lastStepWherePassedToWasChanged.formStepComment && (
                    <div className="prop">
                        <p className="description">{getDescription('formStepComment', props)}:</p>
                        <p className="value">{getValue('formStepComment', props)}</p>
                    </div>
                )}
            {lastStepWherePassedToWasChanged &&
                step.passedTo === stepName &&
                lastStepWherePassedToWasChanged.createdByStep === 'beffaringStep' &&
                lastStepWherePassedToWasChanged.beffaringStepComment && (
                    <div className="prop">
                        <p className="description">{getDescription('beffaringStepComment', props)}:</p>
                        <p className="value">{getValue('beffaringStepComment', props)}</p>
                    </div>
                )}

            {step.passedTo === stepName && stepName !== 'formStep' && (
                <div className="prop">
                    <p className="description">{'Wplyneło'}:</p>
                    <p className="value">{getValue('createdAt', props)}</p>
                </div>
            )}

            {step.nextDeadline && step.passedTo === stepName && (
                <div className="prop">
                    <p className="description">{getDescription('deadline', props)}:</p>
                    <p className="value">{getValue('nextDeadline', props)}</p>
                </div>
            )}
            {stepName === 'offerStep' && (
                <div className="prop">
                    <p className="description">{getDescription('beffaringStepOfferDate', props)}:</p>
                    <p className="value">{getValue('beffaringStepOfferDate', props)}</p>
                </div>
            )}
            {stepName === 'contractCheckerStep' && (
                <>
                    <div className="prop">
                        <p className="description">{getDescription('contractStepSentForVerificationDate', props)}:</p>
                        <p className="value">{getValue('contractStepSentForVerificationDate', props)}</p>
                    </div>
                </>
            )}

            {orderStore.visibleOrderId === order.id ? (
                <button onClick={() => onShowMore()}>Pokaż mniej</button>
            ) : (
                <button onClick={() => onShowMore(order.id)}>Pokaż więcej</button>
            )}
        </StepPropsStyled>
    )
}

export default MainStepProps
