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
import FormMultiSelect from '../UI/FormMultiSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const QuestionnaireStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const errFn = useErrFn()

    const isAcceptanceReportData = useFormInput()
    const haveClientReceviedDocsData = useFormInput()
    const arePaymentsReceivedData = useFormInput()
    const isClientSatisfiedData = useFormInput()
    const clientSatisfactionData = useFormSelect()
    const otherSatisfactionData = useFormInput()
    const clientDissatisfactionData = useFormSelect()
    const otherDissatisfactionData = useFormInput()

    const defaultOpinionValue =
        prevStep?.questionnaireStepDissatisfaction ?? prevStep?.questionnaireStepSatisfaction ?? 'select'

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [
        isAcceptanceReportData.isChecked,
        haveClientReceviedDocsData.isChecked,
        arePaymentsReceivedData.isChecked,
        isClientSatisfiedData.isChecked,
        clientSatisfactionData.isChecked,
        otherSatisfactionData.isChecked,
        clientDissatisfactionData.isChecked,
        otherDissatisfactionData.isChecked,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')
        console.log('isClientSatisfiedData.value', isClientSatisfiedData.value)
        console.log('clientSatisfactionData.isChecked', clientSatisfactionData.isChecked)
        console.log('clientSatisfactionData.value', clientSatisfactionData.value)
        console.log('clientDissatisfactionData.isChecked', clientDissatisfactionData.isChecked)
        console.log('clientDissatisfactionData.value', clientDissatisfactionData.value)

        if (!isAcceptanceReportData.isChecked) {
            console.log('isAcceptanceReportData error')
            showMessage ? isAcceptanceReportData?.showError!() : null
            return setIsFormChecked(false)
        }

        if (!haveClientReceviedDocsData.isChecked) {
            console.log('haveClientReceviedDocsData error')
            showMessage ? haveClientReceviedDocsData?.showError!() : null
            return setIsFormChecked(false)
        }

        if (!arePaymentsReceivedData.isChecked) {
            console.log('arePaymentsReceivedData error')
            showMessage ? arePaymentsReceivedData?.showError!() : null
            return setIsFormChecked(false)
        }

        if (isClientSatisfiedData.value && !clientSatisfactionData.isChecked) {
            console.log('clientSatisfactionData error')
            showMessage ? clientSatisfactionData?.showError!() : null
            return setIsFormChecked(false)
        }

        if (clientSatisfactionData.value?.includes('other') && otherSatisfactionData.value === '') {
            console.log('otherSatisfactionData error')
            showMessage ? otherSatisfactionData?.showError!() : null
            return setIsFormChecked(false)
        }

        if (!isClientSatisfiedData.value && !clientDissatisfactionData.isChecked) {
            console.log('clientDissatisfactionData error')
            showMessage ? clientDissatisfactionData?.showError!() : null
            return setIsFormChecked(false)
        }

        if (clientDissatisfactionData.value?.includes('other') && otherDissatisfactionData.value === '') {
            console.log('otherDissatisfactionData error')
            showMessage ? otherDissatisfactionData?.showError!() : null
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
            curStepName: 'completionStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            nextToPass: isClientSatisfiedData.value ? 'referenceStep' : 'completionStep',
            toNextSendData: {
                order,
                questionnaireStepIsAcceptanceReport: isAcceptanceReportData.value,
                questionnaireStepHaveClientReceviedDocs: haveClientReceviedDocsData.value,
                questionnaireStepArePaymentsReceived: arePaymentsReceivedData.value,
                questionnaireStepIsClientSatisfied: isClientSatisfiedData.value,
                questionnaireStepSatisfaction: isClientSatisfiedData.value ? clientSatisfactionData.value : null,
                questionnaireStepOtherSatisfaction:
                    isClientSatisfiedData.value && clientSatisfactionData.value!.includes('other')
                        ? otherSatisfactionData.value
                        : null,
                questionnaireStepDissatisfaction: clientDissatisfactionData.value,
                questionnaireStepOtherDissatisfaction: clientDissatisfactionData.value!.includes('other')
                    ? otherDissatisfactionData.value
                    : null,
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
                            <FormInput
                                type="checkbox"
                                connection={isAcceptanceReportData}
                                defaultChecked={prevStep?.questionnaireStepIsAcceptanceReport}
                                checkFn={(value) => value === true}
                            >
                                <>Protokół odbioru</>
                            </FormInput>

                            <FormInput
                                type="checkbox"
                                connection={haveClientReceviedDocsData}
                                defaultChecked={prevStep?.questionnaireStepHaveClientReceviedDocs}
                                checkFn={(value) => value === true}
                            >
                                <>Klient otrzymał dokumentację</>
                            </FormInput>

                            <FormInput
                                type="checkbox"
                                connection={arePaymentsReceivedData}
                                defaultChecked={prevStep?.questionnaireStepArePaymentsReceived}
                                checkFn={(value) => value === true}
                            >
                                <>Wpłyneły wszystkie płatności</>
                            </FormInput>

                            <>
                                <FormInput
                                    type="checkbox"
                                    connection={isClientSatisfiedData}
                                    defaultChecked={prevStep?.questionnaireStepIsClientSatisfied}
                                    checkFn={(value) => value === true}
                                >
                                    <>Klient jest zadowolony</>
                                </FormInput>
                            </>

                            {isClientSatisfiedData.value && (
                                <>
                                    <FormMultiSelect
                                        options={[
                                            ['timeFrame', 'Ramy czasowe'],
                                            ['endDate', 'Data zakonczenia'],
                                            ['other', 'Inne'],
                                        ]}
                                        title={`Przyczyna zadowolenia klienta: `}
                                        connection={clientSatisfactionData}
                                        defaultValue={prevStep?.questionnaireStepSatisfaction || ''}
                                    />

                                    {clientSatisfactionData.value?.includes('other') && (
                                        <>
                                            <p>Inna przyczyna zadowolenia klienta:</p>
                                            <FormInput
                                                placeholder="Inna przyczyna zadowolenia klienta"
                                                defaultValue={prevStep?.questionnaireStepOtherSatisfaction}
                                                connection={otherSatisfactionData}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            <FormMultiSelect
                                options={[
                                    ['timeFrame', 'Ramy czasowe'],
                                    ['endDate', 'Data zakonczenia'],
                                    ['other', 'Inne'],
                                ]}
                                title={`Przyczyna niezadowolenia klienta: `}
                                connection={clientDissatisfactionData}
                                defaultValue={prevStep?.questionnaireStepDissatisfaction || ''}
                            />

                            {clientDissatisfactionData.value?.includes('other') && (
                                <>
                                    <p>Inna przyczyna niezadowolenia klienta:</p>
                                    <FormInput
                                        placeholder="Inna przyczyna niezadowolenia klienta"
                                        defaultValue={prevStep?.questionnaireStepOtherDissatisfaction}
                                        connection={otherDissatisfactionData}
                                    />
                                </>
                            )}

                            <SendButtons
                                curStepName="completionStep"
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

export default QuestionnaireStep
