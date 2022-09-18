import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
    FieldsToSend,
    roleTitles,
    roles,
    getStepnameByRole,
} from '../../types'
import { useCreateOrderMutation } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages } from '../../utilities'
import { useFormInput } from '../../hooks/useFormInput'
import { flushSync } from 'react-dom'
import FormSelect from '../UI/FormSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import useErrFn from '../../hooks/useErrFn'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const LastDecisionStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const errFn = useErrFn()

    const closeConfirmationData = useFormInput()
    const nextToPassData = useFormSelect()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const formCheck: FormCheckType = () => {}

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log(target)
        console.log('closeConfirmationData.isChecked', closeConfirmationData.isChecked)
        console.log('nextToPassData.value', nextToPassData.value)

        const isMainCondition = true

        await submitForm({
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'lastDecisionStep',
            passedTo: prevStep!.passedTo,
            nextToPass: closeConfirmationData.isChecked ? 'lastDecisionStep' : nextToPassData.value,
            toNextSendData: {
                order,
                isCompleted: closeConfirmationData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsVisible!(false)
    }

    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <CreateFormStyled>
                <FormStyled>
                    <form ref={formRef} onSubmit={submit}>
                        <>
                            <FormInput
                                type="checkbox"
                                connection={closeConfirmationData}
                                defaultChecked={false}
                                checkFn={(value) => value === true}
                            >
                                <>Potwierdźić zamknięcie sprawy.</>
                            </FormInput>
                        </>

                        {!closeConfirmationData.isChecked && (
                            <FormSelect
                                options={roles.map((role) => {
                                    return [getStepnameByRole(role), roleTitles[role]]
                                })}
                                name="rejectionReasons"
                                title={`Na jaki poziom należy przenieść sprawę?`}
                                connection={nextToPassData}
                                defaultValue={prevStep?.passedTo}
                            />
                        )}

                        <SendButtons
                            curStepName="lastDecisionStep"
                            maxPromotion={prevStep!.maxPromotion}
                            passedTo={prevStep!.passedTo}
                            dataRef={sendButtonsOutputRef}
                            isFormChecked={true}
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

export default LastDecisionStep
