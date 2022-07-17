import React, { FC } from 'react'
import { IStep } from '../types'
import { StepComponentStyled } from '../styles/styled-components'
import { DateTime } from 'luxon'

type StepProps = {
    step: IStep
}

function Step({ step }: StepProps) {
    return (
        <StepComponentStyled>
            {step.formStep && (
                <div className="prop">
                    <p className="description">Dane klienta:</p>
                    <p className="value">
                        {step.formStep.clientName} {step.formStep.email}{' '}
                        {step.formStep.phone}
                    </p>
                </div>
            )}
            {step.formStep?.whereClientFound && (
                <div className="prop">
                    <p className="description">Skąd znaleziono klienta: </p>
                    <p className="value">{step.formStep?.whereClientFound}</p>
                </div>
            )}
            {step.formStep?.record.comment && (
                <div className="prop">
                    <p className="description">Komentarz:</p>
                    <p className="value">{step.formStep.record.comment}</p>
                </div>
            )}
            {/* {step.formStep.record.createdAt && (
                <div className="prop">
                    <p className="description">Stworzony w:</p>
                    <p className="value">{step.formStep.record.createdAt}</p>
                </div>
            )} */}
            {step.formStep?.record.creator && (
                <div className="prop">
                    <p className="description">Stworzone przez:</p>
                    <p className="value">
                        {step.formStep.record.creator.username}
                    </p>
                </div>
            )}
            {step.formStep?.record.perfomerViewingDate && (
                <div className="prop">
                    <p className="description">Przyjęty do realizacji:</p>
                    <p className="value">
                        {step.formStep.record.perfomerViewingDate}
                    </p>
                </div>
            )}
            {step.formStep?.record.perfomer && (
                <div className="prop">
                    <p className="description">Kto przyjął:</p>
                    <p className="value">
                        {step.formStep.record.perfomer.username}
                    </p>
                </div>
            )}
            {step.befaringStep?.infoSendingDate && (
                <div className="prop">
                    <p className="description">Data wysłania dokumentów:</p>
                </div>
            )}
            {step.formStep.meetingDate && (
                <div className="prop">
                    <p className="description">Termin spotkania:</p>
                    <p className="value">
                        {step.formStep.meetingDate as string}
                    </p>
                </div>
            )}
        </StepComponentStyled>
    )
}

export default Step
