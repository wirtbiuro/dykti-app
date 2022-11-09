import React, { FC } from 'react'
import { getStepProps, getUnactiveStepnames } from '../utilities'
import { StepType, StepNames } from '../types'
import { StepPropsStyled } from '../styles/styled-components'
import { useOrderStore } from '../simple-store/order'

interface IStepPropsProps {
    step: StepType
}

const MainStepProps: FC<IStepPropsProps> = ({ step }) => {
    const props = getStepProps(step)

    const getDescription = (propName: keyof StepType): string => {
        return props.find((prop) => prop.key === propName)?.fieldName || ''
    }

    const getValue = (propName: keyof StepType): string => {
        return props.find((prop) => prop.key === propName)?.view || ''
    }

    return (
        <StepPropsStyled>
            <div className="prop">
                <p className="description">{getDescription('formStepClientName')}:</p>
                <p className="value">{getValue('formStepClientName')}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepPhone')}:</p>
                <p className="value">{getValue('formStepPhone')}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepEmail')}:</p>
                <p className="value">{getValue('formStepEmail')}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('formStepAddress')}:</p>
                <p className="value">{getValue('formStepAddress')}</p>
            </div>
            <div className="prop">
                <p className="description">{getDescription('createdAt')}:</p>
                <p className="value">{getValue('createdAt')}</p>
            </div>
        </StepPropsStyled>
    )
}

export default MainStepProps
