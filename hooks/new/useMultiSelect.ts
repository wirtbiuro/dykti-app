import { useState, useRef } from 'react'

export const divider = '<;;;>'

interface IuseMultiSelectProps {
    initialSelectedIdxs?: string[]
    title?: string
    options: string[][]
    disabled?: boolean
}

export const useMultiSelect = ({ initialSelectedIdxs = [], title = '', options }: IuseMultiSelectProps) => {
    const ref = useRef<HTMLSelectElement>(null)

    const [selectedIdxs, setSelectedIdxs] = useState<string[]>(initialSelectedIdxs)

    const [errorValue, setErrorValue] = useState<string>('')

    const check: (showMessage: boolean) => boolean = (showMessage) => {
        if (selectedIdxs.length !== 0) {
            setErrorValue('')
            return true
        } else if (showMessage) {
            setErrorValue('Required Field')
            ref.current?.focus()
        }
        return false
    }

    return {
        selectedIdxs,
        setSelectedIdxs,
        errorValue,
        setErrorValue,
        check,
        title,
        ref,
        options,
    }
}

export type UseMultiSelectType = typeof useMultiSelect

export type MultiSelectProps = ReturnType<UseMultiSelectType>
