import React, { FC } from 'react'
import { StepType, StepName } from '../types'
import { DateTime } from 'luxon'
import { ChangesStyled } from '../styles/styled-components'
import { getStepProps, getUnactiveStepnames } from '../utilities'

interface IChangesProps {
    step: StepType
    prevStep: StepType
}

const Changes: FC<IChangesProps> = ({ step, prevStep }) => {
    const getChanges = () => {
        const stepProps = getStepProps(step)
        const _stepProps = stepProps
            .filter((prop) => !['createdAt', 'id', 'stepCreator', 'shouldConfirmView'].includes(prop.key))
            .filter((prop) => prevStep && prop.value !== prevStep[prop.key])

        return _stepProps.map((prop) => {
            return (
                <div className="change" key={prop.key}>
                    <strong>{prop.fieldName}:</strong> <p>{prop.view}</p>
                </div>
            )
        })
    }

    const creatorName = prevStep.stepCreator?.name || prevStep.stepCreator?.username

    return (
        <ChangesStyled>
            <div className="col date">
                <strong>Godzina&nbsp;i&nbsp;data</strong>
                <p>{DateTime.fromISO(prevStep.createdAt!).toFormat('dd.MM.yyyy HH:mm')}</p>
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
