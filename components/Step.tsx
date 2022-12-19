import React, { FC, useEffect, useState } from 'react'
import { StepType, StepName, roleTitles, Role, stepNamesRelations, IUser, IOrder, stepNames } from '../types'
import { StepComponentStyled } from '../styles/styled-components'
import Changes from './Changes'
import { getUnactiveStepnames } from '../utilities'
import StepProps from './StepProps'

type StepProps = {
    step: StepType
    stepName: StepName
    order: IOrder
}

function Step({ step, stepName, order }: StepProps) {
    return (
        <StepComponentStyled>
            {step?.passedTo === 'beffaringStep' &&
                !step?.formStepMeetingDate &&
                (stepName === 'beffaringStep' || stepName === 'formStep') && (
                    <div className="no-meeting-date">Brakuje terminu spotkania z klientem</div>
                )}
            {step?.passedTo === 'contractStep' &&
                step.contractStepOfferSendingDate &&
                step.contractStepAreOfferChanges === null &&
                stepName === 'contractStep' && (
                    <div className="no-meeting-date">Oczekiwanie na odpowiedź klienta na ofertę.</div>
                )}

            <StepProps step={step} stepName={stepName} order={order} />
        </StepComponentStyled>
    )
}

export default Step
