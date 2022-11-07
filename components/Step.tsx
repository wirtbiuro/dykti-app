import React, { FC, useEffect, useState } from 'react'
import { StepType, StepName, roleTitles, Role, stepNamesRelations, IUser } from '../types'
import { StepComponentStyled } from '../styles/styled-components'
import Changes from './Changes'
import { getStepProps, getUnactiveStepnames } from '../utilities'

type StepProps = {
    step: StepType
    prevStep?: StepType
    stepName?: StepName
    isHistory?: boolean
}

function Step({ step, prevStep, stepName, isHistory }: StepProps) {
    const unactiveStepNames = getUnactiveStepnames({ passedTo: step.passedTo, returnStep: step.returnStep })

    console.log({ unactiveStepNames })

    const getProps = () => {
        const props = getStepProps(step)

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

    return prevStep ? (
        <StepComponentStyled>
            <Changes step={step} prevStep={prevStep} />
        </StepComponentStyled>
    ) : isHistory ? null : (
        <StepComponentStyled>
            {step?.passedTo === 'beffaringStep' &&
                !step?.formStepMeetingDate &&
                (stepName === 'beffaringStep' || stepName === 'formStep') && (
                    <div className="no-meeting-date">Brakuje terminu spotkania z klientem</div>
                )}

            <>{getProps()}</>
        </StepComponentStyled>
    )
}

export default Step
