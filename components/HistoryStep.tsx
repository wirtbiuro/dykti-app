import React, { FC, useEffect, useState } from 'react'
import { StepType, StepName, roleTitles, Role, stepNamesRelations, IUser } from '../types'
import { StepComponentStyled } from '../styles/styled-components'
import Changes from './Changes'
import { getUnactiveStepnames } from '../utilities'
import StepProps from './StepProps'

type StepProps = {
    step: StepType
    prevStep?: StepType
    stepName?: StepName
    isHistory?: boolean
}

function HistoryStep({ step, prevStep, stepName, isHistory }: StepProps) {
    const unactiveStepNames = getUnactiveStepnames({ passedTo: step.passedTo, returnStep: step.returnStep })

    console.log({ unactiveStepNames })

    if (!isHistory) return null

    return (
        <StepComponentStyled>
            <Changes step={step} prevStep={prevStep} />
        </StepComponentStyled>
    )
}

export default HistoryStep
