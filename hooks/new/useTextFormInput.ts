import { useState, useRef } from 'react'

export const useTextFormInput = ({ initialTextValue = '', placeholder = '', title = '' }) => {
    const [textValue, setTextValue] = useState<string>(initialTextValue)

    const [errorValue, setErrorValue] = useState<string>('')

    const ref = useRef<HTMLInputElement>(null)

    const check: (showMessage: boolean) => boolean = (showMessage) => {
        if (textValue) {
            setErrorValue('')
            return true
        } else if (showMessage) {
            setErrorValue('Pole wymagane')
            ref.current?.focus()
        }
        return false
    }

    return {
        textValue,
        setTextValue,
        errorValue,
        setErrorValue,
        check,
        title,
        placeholder,
        ref,
    }
}

export type UseTextFormInputType = typeof useTextFormInput

export type TextFormInputProps = ReturnType<UseTextFormInputType>
