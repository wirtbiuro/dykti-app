import React, { FC } from 'react'
import { getPrevBranchStep, getPrevStepChangeStep } from '../utilities'
import { IOrder, StepType } from '../types'
import { PrevBranchPropStyled } from '../styles/styled-components'

type PrevBranchPropType = {
    propName: keyof StepType
    prevStepChangeStep: StepType | null
}

const PrevBranchProp: FC<PrevBranchPropType> = ({ propName, prevStepChangeStep }) => {
    if (!prevStepChangeStep) return null

    return <PrevBranchPropStyled>{prevStepChangeStep[propName]}</PrevBranchPropStyled>
}

export default PrevBranchProp
