import React, { FC, useEffect, useState } from 'react'
import { StepType, StepName } from '../types'
import { StepComponentStyled } from '../styles/styled-components'
import { DateTime } from 'luxon'

type StepProps = {
    step: StepType
    prevStep?: StepType
    stepName?: StepName
}

function Step({ step, prevStep, stepName }: StepProps) {
    const [changes, setChanges] = useState<Array<string>>()

    useEffect(() => {
        const changes = []
        let key: keyof typeof step
        for (key in step) {
            if (step.hasOwnProperty(key)) {
                if (prevStep && step[key] !== prevStep[key]) {
                    changes.push(`${prevStep[key]} --> ${step[key]}`)
                }
            }
        }
        setChanges(changes)
    }, [])

    return prevStep ? (
        <StepComponentStyled>{changes?.join(',  ')}</StepComponentStyled>
    ) : (
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
            {step.formStepWhereClientFound && (
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
            {/* {step.formStep.record.createdAt && (
                <div className="prop">
                    <p className="description">Stworzony w:</p>
                    <p className="value">{step.formStep.record.createdAt}</p>
                </div>
            )} */}
            {/* {step.formStepCreator && (
                <div className="prop">
                    <p className="description">Stworzone przez:</p>
                    <p className="value">{step.formStepCreator.username}</p>
                </div>
            )}
            {step.beffaringStepPrevStepConfirmationDate && (
                <div className="prop">
                    <p className="description">Przyjęty do realizacji:</p>
                    <p className="value">
                        {step.beffaringStepPrevStepConfirmationDate as string}
                    </p>
                </div>
            )} */}
            {step.beffaringStepCreator && (
                <div className="prop">
                    <p className="description">Kto przyjął:</p>
                    <p className="value">{step.beffaringStepCreator.username}</p>
                </div>
            )}
            {step.beffaringStepInfoSendingDate && (
                <div className="prop">
                    <p className="description">Data wysłania dokumentów:</p>
                    <p className="value">{step.beffaringStepInfoSendingDate as string}</p>
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
