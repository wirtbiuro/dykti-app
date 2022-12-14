import React, { FC, useRef, RefObject, useEffect, useState } from 'react'
import { StepType, PropNames, StepName, ISendButtonsOutputRef, FormCheckType } from '../../types'
import {
    getOrderStatus,
    getFirstStepOrderStatus,
    getNextStepName,
    getPrevStepName,
    getMaxPromotion,
} from '../../utilities'

interface ISendButtons {
    step?: StepType
    isFormChecked: boolean
    curStepName: StepName
    passedTo: StepName
    maxPromotion: StepName
    nextToPass?: StepName
    dataRef?: RefObject<ISendButtonsOutputRef>
    formCheck?: FormCheckType
    prevFormCheck?: FormCheckType
    isPrevFormChecked?: boolean
    isMainCondition?: boolean
}

const SendButtons: FC<ISendButtons> = ({
    step,
    isFormChecked,
    curStepName,
    dataRef,
    formCheck,
    passedTo,
    maxPromotion,
    nextToPass,
    prevFormCheck = () => {},
    isPrevFormChecked = true,
    isMainCondition = true,
}) => {
    const { isCurrent, isProceedToEdit, isEdit, isProceedToNext } = getOrderStatus({
        passedTo,
        curStepName,
        maxPromotion,
    })

    const isCompletedRef = useRef<HTMLInputElement>(null)
    const uncompleteSaveRef = useRef<HTMLInputElement>(null)
    const shouldPerfomerConfirmViewRef = useRef<HTMLInputElement>(null)
    const isAltCompletedRef = useRef<HTMLInputElement>(null)

    const getResults = () => {
        const _passedTo = isMainCondition
            ? isCompletedRef.current?.checked
                ? getNextStepName(passedTo)
                : passedTo
            : isAltCompletedRef.current?.checked
            ? getPrevStepName(passedTo)
            : passedTo

        const _nextToPass = nextToPass ?? _passedTo

        const data = {
            passedTo: _nextToPass,
            createdByStep: passedTo,
            maxPromotion: getMaxPromotion(_passedTo, maxPromotion),
            shouldConfirmView: _nextToPass !== passedTo,
        }

        return data
    }

    useEffect(() => {
        dataRef!.current!.getResults = getResults
    }, [dataRef])

    return (
        <div>
            {(isCurrent || isEdit) && isMainCondition && curStepName !== 'lastDecisionStep' && (
                <div className="checkbox-styled">
                    <input type="checkbox" name="nextCheckbox" defaultChecked={true} ref={isCompletedRef} />
                    Sko??cz i przeka?? dalej
                </div>
            )}
            {(isCurrent || isEdit) && !isMainCondition && (
                <div className="checkbox-styled">
                    <input type="checkbox" name="prevCheckbox" defaultChecked={true} ref={isAltCompletedRef} />
                    Zako??cz i przeka?? poprzedniemu u??ytkownikowi.
                </div>
            )}
            {(isProceedToEdit || isProceedToNext) && (isMainCondition ? !isFormChecked : !isPrevFormChecked) && (
                <div className="checkbox-styled">
                    <input name="uncompleteCheckbox" type="checkbox" defaultChecked={false} ref={uncompleteSaveRef} />
                    Zapisz z niekompletnymi danymi.
                </div>
            )}
            {/* {(isProceedToEdit || isProceedToNext) && (
                <>
                    <input
                        type="checkbox"
                        name="confirmCheckbox"
                        defaultChecked={false}
                        ref={shouldPerfomerConfirmViewRef}
                    />
                    Czy nast??pny u??ytkownik musi potwierdzi?? przegl??danie
                    zmiany.
                </>
            )} */}
        </div>
    )
}

export default SendButtons
