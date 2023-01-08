import { useState, useRef, useEffect } from 'react'
import { useFormSelect } from './useFormSelect'
import { useTextFormInput } from './useTextFormInput'
import { useMultiSelect, divider } from './useMultiSelect'

interface IuseMultiSelectProps {
    initialValue?: string[]
    title?: string
    selectTitle?: string
    options: string[][]
    disabled?: boolean
    otherPlaceholder?: string
    otherTitle?: string
}

export const useFormMultiSelectWithOther = ({
    initialValue = [],
    title = '',
    selectTitle = '',
    disabled = false,
    options,
    otherPlaceholder = '',
    otherTitle = '',
}: IuseMultiSelectProps) => {
    const [value, setValue] = useState<string[]>(initialValue)

    const ref = useRef<HTMLSelectElement>(null)

    const optionKeys = options.map((option) => option[0])

    const initialSelectedIdxs = value.map((item) => {
        return optionKeys.includes(item) ? item : 'other'
    })

    const formMultiSelectData = useMultiSelect({
        options,
        title: selectTitle,
        initialSelectedIdxs,
    })

    const initialTextValue = value.find((item) => !optionKeys.includes(item))

    const textInputData = useTextFormInput({
        placeholder: otherPlaceholder,
        title: otherTitle,
        initialTextValue,
    })

    const otherIdx = formMultiSelectData.selectedIdxs.findIndex((item) => item === 'other')

    useEffect(() => {
        if (otherIdx < 0) {
            textInputData.setTextValue('')
            textInputData.setErrorValue('')
        }
    }, [formMultiSelectData.selectedIdxs])

    useEffect(() => {
        if (otherIdx >= 0 && textInputData.textValue) {
            const selectedIdxs = [...formMultiSelectData.selectedIdxs]
            const _selectedIdxs = [...formMultiSelectData.selectedIdxs]
            selectedIdxs.splice(otherIdx, 1, textInputData.textValue)
            setValue(selectedIdxs)
        } else {
            setValue(formMultiSelectData.selectedIdxs)
        }
    }, [formMultiSelectData.selectedIdxs, textInputData.textValue])

    const check: (showMessage?: boolean) => boolean = (showMessage = false) => {
        if (!formMultiSelectData.check(false)) {
            if (showMessage) {
                formMultiSelectData.check(true)
            }
            return false
        }
        if (otherIdx >= 0 && !textInputData.check(false)) {
            if (showMessage) {
                textInputData.check(true)
            }
            return false
        }
        return true
    }

    console.log({ value })

    return {
        value,
        setValue,
        check,
        title,
        ref,
        disabled,
        options,
        formMultiSelectData,
        textInputData,
    }
}

export type UseFormMultiSelectWithOtherType = typeof useFormMultiSelectWithOther

export type FormMultiSelectWithOtherProps = ReturnType<UseFormMultiSelectWithOtherType>
