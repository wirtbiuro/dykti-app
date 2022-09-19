import { useState } from 'react'

export const useFormInput = () => {
    const [check, __setCheck] = useState<Function>()
    const [isChecked, __setIsChecked] = useState<boolean>(false)
    const [value, __setValue] = useState<string | boolean>()
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

export type useFormInputType = ReturnType<typeof useFormInput>
