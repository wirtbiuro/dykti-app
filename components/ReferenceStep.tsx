import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
    FieldsToSend,
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import FormInput from './UI/FormInput'
import CalendarWithTime from './CalendarWithTime'
import SendButtons from './UI/SendButtons'
import { submitForm, showErrorMessages } from '../utilities'
import { useFormInput } from '../hooks/useFormInput'
import { useCalendarData } from '../hooks/useCalendarData'
import { flushSync } from 'react-dom'
import FormSelect from './UI/FormSelect'
import { useFormSelect } from '../hooks/useFormSelect'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const ReferenceStep: FC<IWithOrder> = ({ order, isVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const wasSentReferenceRequestData = useFormInput()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [wasSentReferenceRequestData.isChecked])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!wasSentReferenceRequestData.isChecked) {
            console.log('wasSentReferenceRequestData error')
            showMessage ? wasSentReferenceRequestData?.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log(target)

        const isMainCondition = true

        const areErrors = showErrorMessages({
            flushSync,
            formCheck,
            isFormChecked,
            isMainCondition,
            target,
        })

        console.log('submit')

        if (areErrors) return

        submitForm({
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'referenceStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            toNextSendData: {
                order,
                referenceStepWasSentRequest: wasSentReferenceRequestData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
        })
    }

    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <CreateFormStyled>
                <FormStyled>
                    <form ref={formRef} onSubmit={submit}>
                        <>
                            <FormInput
                                type="checkbox"
                                connection={wasSentReferenceRequestData}
                                defaultChecked={
                                    typeof prevStep?.referenceStepWasSentRequest === 'boolean'
                                        ? prevStep?.referenceStepWasSentRequest
                                        : false
                                }
                                checkFn={(value: boolean) => value === true}
                            >
                                <>Czy wysłana prośba o referencję do klienta?</>
                            </FormInput>
                        </>

                        <SendButtons
                            curStepName="referenceStep"
                            maxPromotion={prevStep!.maxPromotion}
                            passedTo={prevStep!.passedTo}
                            dataRef={sendButtonsOutputRef}
                            isFormChecked={isFormChecked}
                            step={order?.steps[order.steps.length - 1]}
                            formCheck={formCheck}
                            isMainCondition={true}
                        />
                        <input type="submit" value="Zapisz" />
                    </form>
                </FormStyled>
            </CreateFormStyled>
        </div>
    )
}

export default ReferenceStep
