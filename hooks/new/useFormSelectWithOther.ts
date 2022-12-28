import { useState, useRef, useEffect } from 'react'
import { useFormSelect } from './useFormSelect'
import { useTextFormInput } from './useTextFormInput'

interface IuseMultiSelectProps {
    initialValue?: string
    title?: string
    selectTitle?: string
    options: string[][]
    otherPlaceholder?: string
    otherTitle?: string
}

export const useFormSelectWithOther = ({
    initialValue = 'select',
    title = '',
    selectTitle = '',
    options,
    otherPlaceholder = '',
    otherTitle = '',
}: IuseMultiSelectProps) => {
    const [value, setValue] = useState<string>(initialValue)

    const ref = useRef<HTMLSelectElement>(null)

    const optionKeys = options.map((option) => option[0])

    const formSelectData = useFormSelect({
        options,
        title: selectTitle,
        initialValue: optionKeys.includes(initialValue) ? initialValue : 'other',
    })

    const textInputData = useTextFormInput({
        placeholder: otherPlaceholder,
        title: otherTitle,
        initialTextValue: optionKeys.includes(initialValue) ? '' : initialValue,
    })

    useEffect(() => {
        if (formSelectData.value !== 'other') {
            console.log('setTextValue to nothing')
            textInputData.setTextValue('')
            textInputData.setErrorValue('')
        }
    }, [formSelectData.value])

    useEffect(() => {
        if (formSelectData.value === 'other') {
            setValue(textInputData.textValue)
        } else {
            setValue(formSelectData.value)
        }
    }, [formSelectData.value, textInputData.textValue])

    const check: (showMessage?: boolean) => boolean = (showMessage = false) => {
        if (!formSelectData.check(false)) {
            if (showMessage) {
                formSelectData.check(true)
            }
            return false
        }
        if (formSelectData.value === 'other' && !textInputData.check(false)) {
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
        options,
        formSelectData,
        textInputData,
    }
}

export type UseFormSelectWithOtherType = typeof useFormSelectWithOther

export type FormSelectWithOtherProps = ReturnType<UseFormSelectWithOtherType>
