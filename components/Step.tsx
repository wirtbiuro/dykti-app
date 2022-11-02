import React, { FC, useEffect, useState } from 'react'
import { StepType, StepName, roleTitles, Role, stepNamesRelations, IUser } from '../types'
import { StepComponentStyled } from '../styles/styled-components'
import { DateTime } from 'luxon'
import { fieldNames, selectData } from '../accessories/constants'
import Changes from './Changes'

type StepProps = {
    step: StepType
    prevStep?: StepType
    stepName?: StepName
    isHistory?: boolean
}

function Step({ step, prevStep, stepName, isHistory }: StepProps) {
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
            <div className="prop">
                <p className="description">id:</p>
                <p className="value">{step.id} </p>
            </div>
            {step.formStepClientName && (
                <div className="prop">
                    <p className="description">Dane klienta:</p>
                    <p className="value">
                        {step.formStepClientName} {step.formStepEmail} {step.formStepPhone}
                    </p>
                </div>
            )}
            {step.formStepWhereClientFound && step.passedTo === 'formStep' && (
                <div className="prop">
                    <p className="description">Skąd znaleziono klienta: </p>
                    <p className="value">{step.formStepWhereClientFound}</p>
                </div>
            )}
            {step.formStepComment && (
                <div className="prop">
                    <p className="description">Komentarz:</p>
                    <p className="value">{step.formStepComment}</p>
                </div>
            )}
            {step.formStepMeetingDate && (
                <div className="prop">
                    <p className="description">Termin spotkania:</p>
                    <p className="value">{step.formStepMeetingDate as string}</p>
                </div>
            )}
        </StepComponentStyled>
    )
}

export default Step
