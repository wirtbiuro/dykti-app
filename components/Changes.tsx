import React, { FC } from 'react'
import { StepType } from '../types'
import { DateTime } from 'luxon'
import { ChangesStyled } from '../styles/styled-components'
import { getStepProps, isStepPropErrors, getEdgeDayMillis } from '../utilities'

interface IChangesProps {
    step: StepType
    prevStep?: StepType
}

const Changes: FC<IChangesProps> = ({ step, prevStep }) => {
    const getChanges = () => {
        const stepProps = getStepProps(step)
        const _stepProps = stepProps
            .filter((prop) => !['createdAt', 'id', 'stepCreator', 'shouldConfirmView'].includes(prop.key))
            .filter(
                (prop) => (prevStep && prop.value !== prevStep[prop.key]) || (!prevStep && prop.value !== null)
                // ['beffaringStepDocsSendDate'].includes(prop.key)
            )

        return _stepProps.map((prop) => {
            const className = isStepPropErrors[prop.key]
                ? isStepPropErrors[prop.key]!(step)
                    ? 'change error-change'
                    : 'change'
                : 'change'

            return (
                <div className={className} key={prop.key}>
                    <strong>{prop.fieldName}:</strong> <p>{prop.view}</p>
                </div>
            )
        })
    }

    const creatorName = step.stepCreator?.name || step.stepCreator?.username

    return (
        <ChangesStyled>
            <div className="col date">
                <strong>Godzina&nbsp;i&nbsp;data</strong>
                <p>{DateTime.fromISO(step.createdAt!).toFormat('dd.MM.yyyy HH:mm')}</p>
            </div>

            <div className="col creator">
                <strong>Kto&nbsp;zmienił</strong>
                <p>{creatorName}</p>
            </div>

            <div className="col">
                <strong>Co zostało zmienione</strong>
                {getChanges()}
            </div>
        </ChangesStyled>
    )
}

export default Changes
