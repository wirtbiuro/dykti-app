import { useState, useRef } from 'react'

export const useCheckboxFormInput = ({ initialValue = false, title = '', checkFn = (value: boolean) => value }) => {
    const [checkboxValue, setCheckboxValue] = useState<boolean>(initialValue)

    const [errorValue, setErrorValue] = useState<string>('')

    const [_title, setTitle] = useState<string>(title)

    const ref = useRef<HTMLInputElement>(null)

    const check: (showMessage: boolean) => boolean = (showMessage) => {
        if (checkFn(checkboxValue)) {
            setErrorValue('')
            return true
        } else if (showMessage) {
            setErrorValue('Pole wymagane')
            ref.current?.focus()
        }
        return false
    }

    return {
        checkboxValue,
        setCheckboxValue,
        errorValue,
        setErrorValue,
        check,
        title: _title,
        setTitle,
        ref,
    }
}

export type UseCheckboxFormInputType = typeof useCheckboxFormInput

export type CheckboxFormInputProps = ReturnType<UseCheckboxFormInputType>
