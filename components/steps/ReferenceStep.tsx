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
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages } from '../../utilities'
import { useFormInput } from '../../hooks/useFormInput'
import { flushSync } from 'react-dom'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import FormMultiSelect from '../UI/FormMultiSelect'
import { useFormMultiSelect } from '../../hooks/useFormMultiSelect'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const ReferenceStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const errFn = useErrFn()

    const wasReferenceRequestSentData = useFormInput()
    const isClientReferenceData = useFormInput()
    const referenceLocationData = useFormMultiSelect()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [wasReferenceRequestSentData.isChecked, isClientReferenceData.isChecked, referenceLocationData.isChecked])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!wasReferenceRequestSentData.isChecked) {
            console.log('wasReferenceRequestSentData error')
            showMessage ? wasReferenceRequestSentData?.showError() : null
            return setIsFormChecked(false)
        }

        if (!isClientReferenceData.isChecked) {
            console.log('isClientReferenceData error')
            showMessage ? isClientReferenceData?.showError() : null
            return setIsFormChecked(false)
        }

        if (!referenceLocationData.isChecked) {
            console.log('referenceLocationData error')
            showMessage ? referenceLocationData?.showError() : null
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

        setIsSpinning(true)

        await submitForm({
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'referenceStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            toNextSendData: {
                order,
                referenceStepWasSentRequest: wasReferenceRequestSentData.value,
                referenceStepIsClientReference: isClientReferenceData.value,
                referenceStepReferenceLocation: referenceLocationData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsSpinning(false)
        setIsVisible!(false)
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
                                    connection={wasReferenceRequestSentData}
                                    defaultChecked={
                                        typeof prevStep?.referenceStepWasSentRequest === 'boolean'
                                            ? prevStep?.referenceStepWasSentRequest
                                            : false
                                    }
                                    checkFn={(value) => value === true}
                                >
                                    <>Prośba o referencję do klienta jest wysłana</>
                                </FormInput>
                            </>

                            {wasReferenceRequestSentData.isChecked && (
                                <>
                                    <FormInput
                                        type="checkbox"
                                        connection={isClientReferenceData}
                                        defaultChecked={
                                            typeof prevStep?.referenceStepWasSentRequest === 'boolean'
                                                ? prevStep?.referenceStepWasSentRequest
                                                : false
                                        }
                                        checkFn={(value) => value === true}
                                    >
                                        <>Klient wystawil referencje</>
                                    </FormInput>

                                    <FormMultiSelect
                                        options={[
                                            ['mittanbud', 'Mittanbud'],
                                            ['google', 'Google'],
                                            ['site', 'Strona internetowa'],
                                        ]}
                                        title={`Gdzie wysłano referencję: `}
                                        connection={referenceLocationData}
                                        defaultValue={prevStep?.questionnaireStepSatisfaction || ''}
                                    />
                                </>
                            )}

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
        </Spin>
    )
}

export default ReferenceStep
