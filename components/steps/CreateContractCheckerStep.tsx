import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
    FieldsToSend,
} from '../../types'
import { useCreateOrderMutation } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages } from '../../utilities'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import { useCalendarData } from '../../hooks/useCalendarData'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractCheckerStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [isSpinning, setIsSpinning] = useState(false)

    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const prevStep = order?.steps[order.steps.length - 1]

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const isContractCheckedData = useFormInput()
    const workStartDateData = useCalendarData()
    const workEndDateData = useCalendarData()
    const commentsData = useFormInput()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    useEffect(() => {
        // isMainCondition
        //     ? formCheck({ showMessage: false })
        //     : prevFormCheck({ showMessage: false })
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [
        isContractCheckedData.isChecked,
        workStartDateData.isChecked,
        commentsData.isChecked,
        workEndDateData.isChecked,
    ])

    const isMainCondition = isContractCheckedData.isChecked

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!workStartDateData.isChecked) {
            console.log('workStartDateData error')
            showMessage ? workStartDateData.showError() : null
            return setIsFormChecked(false)
        }
        if (!workEndDateData.isChecked) {
            console.log('workEndDateData error')
            showMessage ? workEndDateData.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        // if (!offerChangesData.isChecked) {
        //     console.log({ offerChangesData })
        //     showMessage && offerChangesData.showError
        //         ? offerChangesData?.showError()
        //         : null
        //     return setIsPrevFormChecked(false)
        // }

        if (!commentsData.isChecked) {
            console.log('commentsData error')
            showMessage ? commentsData.showError() : null
            return setIsPrevFormChecked(false)
        }

        console.log('prev form checked')

        return setIsPrevFormChecked(true)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        const areErrors = showErrorMessages({
            flushSync,
            formCheck,
            isFormChecked,
            isMainCondition,
            isPrevFormChecked,
            prevFormCheck,
            target,
        })

        console.log('submit')

        if (areErrors) return

        setIsSpinning(true)

        await submitForm({
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'contractCheckerStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            toPrevSendData: {
                order,
                contractCheckerStepIsContractChecked: isContractCheckedData.isChecked,
                contractCheckerStepWorkStartDate: null,
                contractCheckerStepWorkEndDate: null,
                contractCheckerStepComments: commentsData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                contractCheckerStepIsContractChecked: isContractCheckedData.isChecked,
                contractCheckerStepWorkStartDate: workStartDateData.value,
                contractCheckerStepWorkEndDate: workEndDateData.value,
                contractCheckerStepComments: commentsData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsVisible!(false)
        setIsSpinning(false)
    }

    return (
        <Spin spinning={isSpinning}>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            <>
                                <FormInput
                                    type="checkbox"
                                    connection={isContractCheckedData}
                                    defaultChecked={
                                        typeof prevStep?.contractCheckerStepIsContractChecked === 'boolean'
                                            ? prevStep?.contractCheckerStepIsContractChecked
                                            : false
                                    }
                                    checkFn={(value) => value as boolean}
                                >
                                    <>Kontrakt jest weryfikowan</>
                                </FormInput>

                                {isMainCondition && (
                                    <>
                                        <>
                                            <p>Przybliżona data rozpoczęcia pracy.</p>
                                            <CalendarWithTime
                                                defaultDate={order && prevStep?.contractCheckerStepWorkStartDate}
                                                connection={workStartDateData}
                                                isTimeEnabled={false}
                                            />
                                        </>
                                        <>
                                            <p>Przybliżona data zakończenia pracy.</p>
                                            <CalendarWithTime
                                                defaultDate={order && prevStep?.contractCheckerStepWorkEndDate}
                                                connection={workEndDateData}
                                                isTimeEnabled={false}
                                            />
                                        </>
                                    </>
                                )}

                                <>
                                    <p>Komentarz: </p>
                                    <FormInput
                                        placeholder={isMainCondition ? 'Komentarz' : 'Jakich zmian wymaga kontrakt?'}
                                        defaultValue={prevStep?.contractCheckerStepComments}
                                        connection={commentsData}
                                    />
                                </>
                            </>

                            <SendButtons
                                curStepName="contractCheckerStep"
                                maxPromotion={prevStep!.maxPromotion}
                                passedTo={prevStep!.passedTo}
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                step={prevStep}
                                formCheck={formCheck}
                                isMainCondition={isMainCondition}
                                isPrevFormChecked={isPrevFormChecked}
                                prevFormCheck={prevFormCheck}
                            />
                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateContractCheckerStep
