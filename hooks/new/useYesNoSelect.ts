import { useState, useRef } from 'react'

interface IuseMultiSelectProps {
    initialValue?: boolean | null
    title?: string
}

export const useYesNoSelect = ({ initialValue = null, title = '' }: IuseMultiSelectProps) => {
    const [value, setValue] = useState<boolean | null>(initialValue)

    const [errorValue, setErrorValue] = useState<string>('')

    const ref = useRef<HTMLSelectElement>(null)

    const check: (showMessage: boolean) => boolean = (showMessage) => {
        if (value !== null) {
            setErrorValue('')
            return true
        } else if (showMessage) {
            setErrorValue('Pole wymagane')
            ref.current?.focus()
        }
        return false
    }

    const setValueByString: (value: string) => void = (value) => {
        const _value = value === 'select' ? null : value === 'yes' ? true : false
        setValue(_value)
    }

    return {
        value,
        setValue,
        setValueByString,
        errorValue,
        setErrorValue,
        check,
        title,
        ref,
    }
}

export type UseYesNoSelectType = typeof useYesNoSelect

export type YesNoSelectProps = ReturnType<UseYesNoSelectType>
