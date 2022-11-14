import React, { FC, useEffect, useState } from 'react'
import { StepType, StepName, roleTitles, Role, stepNamesRelations, IUser } from '../types'
import { StepComponentStyled } from '../styles/styled-components'
import Changes from './Changes'
import { getUnactiveStepnames } from '../utilities'
import StepProps from './StepProps'

type StepProps = {
    step: StepType
    stepName: StepName
    orderId: number
}

function Step({ step, stepName, orderId }: StepProps) {
    return (
        <StepComponentStyled>
            {step?.passedTo === 'beffaringStep' &&
                !step?.formStepMeetingDate &&
                (stepName === 'beffaringStep' || stepName === 'formStep') && (
                    <div className="no-meeting-date">Brakuje terminu spotkania z klientem</div>
                )}
            <StepProps step={step} stepName={stepName} orderId={orderId} />
        </StepComponentStyled>
    )
}

export default Step
