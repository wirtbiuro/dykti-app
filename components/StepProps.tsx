import React, { FC } from 'react'
import { getStepProps, getUnactiveStepnames } from '../utilities'
import { StepType, stepNames, stepNamesRelations, roleTitles, getStepNames, StepName } from '../types'
import { StepPropsStyled } from '../styles/styled-components'
import { useOrderStore } from '../simple-store/order'
import MainStepProps from './MainStepProps'

interface IStepPropsProps {
    step: StepType
    stepName: StepName
    orderId: number
}

const StepProps: FC<IStepPropsProps> = ({ step, stepName, orderId }) => {
    const [orderStore, setOrderStore] = useOrderStore()

    const unactiveStepNames = getUnactiveStepnames({ passedTo: step.passedTo, returnStep: step.returnStep })

    const props = getStepProps(step)

    const getProps = () => {
        let _props = props
            .filter(
                (prop) =>
                    !['createdAt', 'id', 'stepCreator', 'orderId', 'maxPromotion', 'shouldConfirmView'].includes(
                        prop.key
                    )
            )
            .filter((prop) => prop.value !== null && prop.value !== '')

        return _props.map((prop) => {
            const belongedUnactiveStepName = unactiveStepNames.find((stepName) => prop.key.includes(stepName))
            const className = belongedUnactiveStepName ? 'prop unactive' : 'prop'

            return (
                <div className={className} key={prop.key}>
                    <p className="description">{prop.fieldName}:</p>
                    <p className="value">{prop.view}</p>
                </div>
            )
        })
    }

    const getStepNameProps = (stepName: string) => {
        const _props = props.filter((prop) => prop.key.includes(stepName))

        return _props.map((prop) => {
            const belongedUnactiveStepName = unactiveStepNames.find((stepName) => prop.key.includes(stepName))
            const className = belongedUnactiveStepName ? 'prop unactive' : 'prop'

            return (
                <div className={className} key={prop.key}>
                    <p className="description">{prop.fieldName}:</p>
                    <p className="value">{prop.view}</p>
                </div>
            )
        })
    }

    return (
        <StepPropsStyled>
            <div className="wrapper">
                <MainStepProps step={step} stepName={stepName} orderId={orderId} />
                {orderStore.visibleOrderId === step.orderId && (
                    <div className="all-props">
                        {stepNamesRelations
                            .filter((relation, idx) => {
                                const stepNames = getStepNames(stepNamesRelations)
                                const maxStepIdx = stepNames.findIndex((stepName) => stepName === step.maxPromotion)
                                return idx <= maxStepIdx
                            })
                            .filter((relation) => !['lastDecisionStep'].includes(relation[1]))
                            .map((relation) => {
                                return (
                                    <div className="all-prop" key={relation[0]}>
                                        <div className="prop-title">{roleTitles[relation[0]]}</div>
                                        <div>{getStepNameProps(relation[1])}</div>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </div>
        </StepPropsStyled>
    )
}

export default StepProps
