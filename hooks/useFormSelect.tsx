import { useState } from 'react'

export const useFormSelect = () => {
    const [check, __setCheck] = useState<Function>()
    const [isChecked, __setIsChecked] = useState<boolean>(false)
    const [value, __setValue] = useState<string>()
    const [setValue, __setSetValue] = useState<Function>()
    const [showError, __setShowError] = useState<Function>()
    const [errTitleElement, __setErrTitleElement] = useState<HTMLDivElement | null>()

    return {
        check,
        __setCheck,
        isChecked,
        __setIsChecked,
        value,
        __setValue,
        setValue,
        __setSetValue,
        showError,
        __setShowError,
        errTitleElement,
        __setErrTitleElement,
    }
}

export type useFormSelectType = ReturnType<typeof useFormSelect>
