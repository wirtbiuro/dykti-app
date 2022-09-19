import { useState } from 'react'
import { DateTime } from 'luxon'

export const useCalendarData = () => {
    const [check, __setCheck] = useState<Function>()
    const [isChecked, __setIsChecked] = useState<boolean>(false)
    const [value, __setValue] = useState<DateTime | null | string>()
    const [setValue, __setSetValue] = useState<Function>()
    const [showError, __setShowError] = useState<Function>()
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

export type useCalendarDataType = ReturnType<typeof useCalendarData>
