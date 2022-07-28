import React, { FC, useRef, RefObject, useEffect, useState } from 'react'
import {
    StepType,
    PropNames,
    StepName,
    ISendButtonsOutputRef,
} from '../../types'

interface ISendButtons {
    step?: StepType
    isFormChecked: boolean
    curStepName?: StepName
    prevStepName?: StepName
    dataRef?: RefObject<ISendButtonsOutputRef>
    formCheck?: Function
}

const SendButtons: FC<ISendButtons> = ({
    step,
    isFormChecked,
    curStepName,
    dataRef,
    formCheck,
    prevStepName,
}) => {
    const curStepIsProceedToNextName = `${curStepName}IsProceedToNext` as PropNames<
        StepType
    >

    const prevStepIsProceedToNextName = `${prevStepName}IsProceedToNext` as PropNames<
        StepType
    >

    const curStepIsCompletedName = `${curStepName}IsCompleted` as PropNames<
        StepType
    >

    const prevStepIsCompletedName = `${prevStepName}IsCompleted` as PropNames<
        StepType
    >

    const curStepShouldPerfomerConfirmViewName = `${curStepName}ShouldPerfomerConfirmView` as PropNames<
        StepType
    >

    const curStepIsProceedToNext = step?.[curStepIsProceedToNextName]
    const prevStepIsProceedToNext = step?.[prevStepIsProceedToNextName]
    const curStepIsCompleted = step?.[curStepIsCompletedName]
    const prevStepIsCompleted = step?.[prevStepIsCompletedName]

    console.log({
        curStepIsProceedToNext,
        prevStepIsProceedToNext,
        curStepIsCompleted,
        prevStepIsCompleted,
    })

    const isCurrent =
        prevStepIsProceedToNext &&
        prevStepIsCompleted &&
        !curStepIsProceedToNext &&
        !curStepIsCompleted
    const isEdit =
        prevStepIsProceedToNext &&
        prevStepIsCompleted &&
        curStepIsProceedToNext &&
        !curStepIsCompleted
    const IsProceedToNext =
        prevStepIsProceedToNext &&
        prevStepIsCompleted &&
        curStepIsProceedToNext &&
        curStepIsCompleted
    const IsProceedToEdit =
        prevStepIsProceedToNext &&
        !prevStepIsCompleted &&
        !curStepIsProceedToNext &&
        !curStepIsCompleted

    console.log({ isCurrent, isEdit, IsProceedToEdit, IsProceedToNext })

    const isCompletedRef = useRef<HTMLInputElement>(null)
    const uncompleteSaveRef = useRef<HTMLInputElement>(null)
    const shouldPerfomerConfirmViewRef = useRef<HTMLInputElement>(null)

    const getResults = () => {
        return {
            [`${curStepName}IsProceedToNext`]:
                isCurrent || isEdit
                    ? isCompletedRef.current?.checked
                    : IsProceedToNext
                    ? true
                    : false,
            [`${curStepName}IsCompleted`]:
                isCurrent || isEdit
                    ? isCompletedRef.current?.checked
                    : IsProceedToNext
                    ? true
                    : false,
            [`${curStepName}ShouldPerfomerConfirmView`]:
                isCurrent || isEdit
                    ? isCompletedRef.current?.checked
                    : shouldPerfomerConfirmViewRef.current?.checked,
        }
    }

    useEffect(() => {
        dataRef!.current!.getResults = getResults
    }, [dataRef])

    useEffect(() => {
        if (formCheck) {
            formCheck(false)
        }
    }, [formCheck])

    return (
        <div>
            {(isCurrent || isEdit) && (
                <>
                    <input
                        type="checkbox"
                        name={curStepIsCompletedName}
                        defaultChecked={true}
                        ref={isCompletedRef}
                    />
                    Skończ i przekaż dalej
                </>
            )}
            {(IsProceedToEdit || IsProceedToNext) && !isFormChecked && (
                <>
                    <input
                        name="uncompleteSave"
                        type="checkbox"
                        defaultChecked={false}
                        ref={uncompleteSaveRef}
                    />
                    Zapisz z niekompletnymi danymi.
                </>
            )}
            {(IsProceedToEdit || IsProceedToNext) && (
                <>
                    <input
                        type="checkbox"
                        name={curStepShouldPerfomerConfirmViewName}
                        defaultChecked={false}
                        ref={shouldPerfomerConfirmViewRef}
                    />
                    Czy następny użytkownik musi potwierdzić przeglądanie
                    zmiany.
                </>
            )}
        </div>
    )
}

export default SendButtons
