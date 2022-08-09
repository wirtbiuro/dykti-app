import React, { FC, useRef, RefObject, useEffect, useState } from 'react'
import {
    StepType,
    PropNames,
    StepName,
    ISendButtonsOutputRef,
    FormCheckType,
} from '../../types'
import { getOrderStatus } from '../../utilities'

interface ISendButtons {
    step?: StepType
    isFormChecked: boolean
    curStepName?: StepName
    prevStepName?: StepName
    dataRef?: RefObject<ISendButtonsOutputRef>
    formCheck?: FormCheckType // for nextBtn (checking main condition)
    prevFormCheck?: FormCheckType // for prevBtn (checking aux condition)
    isPrevFormChecked?: boolean
    isMainCondition?: boolean // nextBtn - true, prevBtn - false
}

const SendButtons: FC<ISendButtons> = ({
    step,
    isFormChecked,
    curStepName,
    dataRef,
    formCheck,
    prevStepName,
    prevFormCheck = () => {},
    isPrevFormChecked = true,
    isMainCondition = true,
}) => {
    const {
        isCurrent,
        isEdit,
        isProceedToNext,
        isProceedToEdit,
    } = getOrderStatus({ curStepName, prevStepName, step })

    const isCompletedRef = useRef<HTMLInputElement>(null)
    const uncompleteSaveRef = useRef<HTMLInputElement>(null)
    const shouldPerfomerConfirmViewRef = useRef<HTMLInputElement>(null)
    const isAltCompletedRef = useRef<HTMLInputElement>(null)

    const getResults = () => {
        return {
            [`${curStepName}IsProceedToNext`]:
                isCurrent || isEdit
                    ? isCompletedRef.current?.checked
                    : isProceedToNext
                    ? true
                    : false,
            [`${curStepName}IsCompleted`]:
                isCurrent || isEdit
                    ? isCompletedRef.current?.checked
                    : isProceedToNext
                    ? true
                    : false,
            [`${curStepName}ShouldPerfomerConfirmView`]:
                isCurrent || isEdit
                    ? isCompletedRef.current?.checked
                    : shouldPerfomerConfirmViewRef.current?.checked,
            [`${prevStepName}IsCompleted`]:
                isCurrent || isEdit
                    ? !isAltCompletedRef.current?.checked
                    : isProceedToNext
                    ? true
                    : isProceedToEdit
                    ? false
                    : false,
        }
    }

    useEffect(() => {
        dataRef!.current!.getResults = getResults
    }, [dataRef])

    // useEffect(() => {
    //     console.log('send buttons form check')
    //     if (formCheck) {
    //         formCheck({ showMessage: false })
    //     }
    // }, [formCheck])

    // useEffect(() => {
    //     if (prevFormCheck) {
    //         prevFormCheck({ showMessage: false })
    //     }
    // }, [prevFormCheck])

    return (
        <div>
            {(isCurrent || isEdit) && isMainCondition && (
                <>
                    <input
                        type="checkbox"
                        name="nextCheckbox"
                        defaultChecked={true}
                        ref={isCompletedRef}
                    />
                    Skończ i przekaż dalej
                </>
            )}
            {(isCurrent || isEdit) && !isMainCondition && (
                <>
                    <input
                        type="checkbox"
                        name="prevCheckbox"
                        defaultChecked={true}
                        ref={isAltCompletedRef}
                    />
                    Zakończ i przekaż poprzedniemu użytkownikowi.
                </>
            )}
            {(isProceedToEdit || isProceedToNext) &&
                (isMainCondition ? !isFormChecked : !isPrevFormChecked) && (
                    <>
                        <input
                            name="uncompleteCheckbox"
                            type="checkbox"
                            defaultChecked={false}
                            ref={uncompleteSaveRef}
                        />
                        Zapisz z niekompletnymi danymi.
                    </>
                )}
            {(isProceedToEdit || isProceedToNext) && (
                <>
                    <input
                        type="checkbox"
                        name="confirmCheckbox"
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
