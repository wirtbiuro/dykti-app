import React, { FC } from 'react'
import CheckboxFormInput from './CheckboxFormInput'
import { CheckboxFormInputProps } from '../../hooks/new/useCheckboxFormInput'

interface NextPrevCheckboxProps {
    isMainCondition?: boolean
    isCurrentStep: boolean
    connection: CheckboxFormInputProps
}

const NextPrevCheckbox: FC<NextPrevCheckboxProps> = ({ isMainCondition = true, isCurrentStep, connection }) => {
    connection.setTitle(isMainCondition ? 'Skończ i przekaż dalej' : 'Zakończ i przekaż poprzedniemu użytkownikowi')

    if (!isCurrentStep) {
        return null
    }

    return <CheckboxFormInput connection={connection} />
}

export default NextPrevCheckbox
