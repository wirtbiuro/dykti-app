import { useState, useRef } from 'react'

interface IuseMultiSelectProps {
    initialValue?: string
    title?: string
    options: string[][]
}

export const useFormSelect = ({ initialValue = 'select', title = '', options }: IuseMultiSelectProps) => {
    const [value, setValue] = useState<string>(initialValue)

    const [errorValue, setErrorValue] = useState<string>('')

    const ref = useRef<HTMLSelectElement>(null)

    const check: (showMessage: boolean) => boolean = (showMessage) => {
        console.log('useFormSelect check value', value)
        if (value !== 'select') {
            console.log('not equal select')
            setErrorValue('')
            return true
        } else if (showMessage) {
            console.log('showMessage')
            setErrorValue('Required Field')
            ref.current?.focus()
        }
        return false
    }

    return {
        value,
        setValue,
        errorValue,
        setErrorValue,
        check,
        title,
        ref,
        options,
    }
}

export type UseFormSelectType = typeof useFormSelect

export type FormSelectProps = ReturnType<UseFormSelectType>
