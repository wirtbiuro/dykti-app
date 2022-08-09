import { useState } from 'react'

export const useFormSelect = () => {
    const [check, __setCheck] = useState()
    const [isChecked, __setIsChecked] = useState()
    const [value, __setValue] = useState()
    const [setValue, __setSetValue] = useState()
    const [showError, __setShowError] = useState()
    const [errTitleElement, __setErrTitleElement] = useState()

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
