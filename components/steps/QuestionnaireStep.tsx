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
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages, getBranchValues } from '../../utilities'
import { useFormInput } from '../../hooks/useFormInput'
import { flushSync } from 'react-dom'
import FormMultiSelect from '../UI/FormMultiSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import useErrFn from '../../hooks/useErrFn'
import { Spin, Modal } from 'antd'
import { selectData } from '../../accessories/constants'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const QuestionnaireStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const {
        prevStep,
        branchIdx,
        prevStepChangeStep,
        isNewBranchComparedByLastStepnameChange,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'questionnaireStep',
        order,
    })

    const errFn = useErrFn()

    const isAcceptanceReportData = useFormInput()
    const haveClientReceviedDocsData = useFormInput()
    const arePaymentsReceivedData = useFormInput()
    const isClientSatisfiedData = useFormInput()
    const isClientDissatisfiedData = useFormInput()
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
            setIsFormChecked(false)
            return false
        }

        if (!haveClientReceviedDocsData.isChecked) {
            console.log('haveClientReceviedDocsData error')
            showMessage ? haveClientReceviedDocsData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!arePaymentsReceivedData.isChecked) {
            console.log('arePaymentsReceivedData error')
            showMessage ? arePaymentsReceivedData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (isClientSatisfiedData.isChecked && !clientSatisfactionData.isChecked) {
            console.log('clientSatisfactionData error')
            showMessage ? clientSatisfactionData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (
            isClientSatisfiedData.isChecked &&
            clientSatisfactionData.value?.includes('other') &&
            otherSatisfactionData.value === ''
        ) {
            console.log('otherSatisfactionData error')
            showMessage ? otherSatisfactionData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (isClientDissatisfiedData.isChecked && !clientDissatisfactionData.isChecked) {
            console.log('clientDissatisfactionData error')
            showMessage ? clientDissatisfactionData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (
            isClientDissatisfiedData.isChecked &&
            clientDissatisfactionData.value?.includes('other') &&
            otherDissatisfactionData.value === ''
        ) {
            console.log('otherDissatisfactionData error')
            showMessage ? otherDissatisfactionData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        console.log('form checked')

        setIsFormChecked(true)
        return true
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

        console.log('submit', { areErrors })

        const isNextChecked = target.nextCheckbox !== undefined && target.nextCheckbox.checked

        if (areErrors) return

        setIsSpinning(true)

        await submitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'questionnaireStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            nextToPass: isClientSatisfiedData.value ? 'referenceStep' : 'questionnaireStep',
            // nextToPass: 'questionnaireStep',
            toNextSendData: {
                order,
                isCompleted: isNextChecked && isClientSatisfiedData.value ? false : true,
                questionnaireStepIsAcceptanceReport: isAcceptanceReportData.value,
                questionnaireStepHaveClientReceviedDocs: haveClientReceviedDocsData.value,
                questionnaireStepArePaymentsReceived: arePaymentsReceivedData.value,
                questionnaireStepIsClientSatisfied: isClientSatisfiedData.value,
                questionnaireStepSatisfaction: isClientSatisfiedData.value ? clientSatisfactionData.value : null,
                questionnaireStepOtherSatisfaction:
                    isClientSatisfiedData.value && clientSatisfactionData.value?.includes('other')
                        ? otherSatisfactionData.value
                        : null,
                questionnaireStepDissatisfaction: isClientDissatisfiedData.value
                    ? clientDissatisfactionData.value
                    : null,
                questionnaireStepOtherDissatisfaction:
                    isClientDissatisfiedData.value && clientDissatisfactionData.value?.includes('other')
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
                                    defaultChecked={
                                        isNewBranchComparedByLastStepnameChange
                                            ? false
                                            : prevStep?.questionnaireStepSatisfaction &&
                                              prevStep?.questionnaireStepSatisfaction !== ''
                                            ? true
                                            : false
                                    }
                                    checkFn={(value) => value === true}
                                >
                                    <>Klient jest zadowolony</>
                                </FormInput>
                            </>

                            {isClientSatisfiedData.value && (
                                <>
                                    <FormMultiSelect
                                        options={selectData.questionnaireStepSatisfaction}
                                        title={`Przyczyna zadowolenia klienta: `}
                                        connection={clientSatisfactionData}
                                        defaultValue={
                                            isNewBranchComparedByLastStepnameChange
                                                ? ''
                                                : prevStep?.questionnaireStepSatisfaction || ''
                                        }
                                    />

                                    {clientSatisfactionData.value?.includes('other') && (
                                        <>
                                            <p>Inna przyczyna zadowolenia klienta:</p>
                                            <FormInput
                                                placeholder="Inna przyczyna zadowolenia klienta"
                                                defaultValue={
                                                    isNewBranchComparedByLastStepnameChange
                                                        ? ''
                                                        : prevStep?.questionnaireStepOtherSatisfaction
                                                }
                                                connection={otherSatisfactionData}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            <>
                                <FormInput
                                    type="checkbox"
                                    connection={isClientDissatisfiedData}
                                    checkFn={(value) => value === true}
                                    defaultChecked={
                                        isNewBranchComparedByLastStepnameChange
                                            ? false
                                            : prevStep?.questionnaireStepDissatisfaction &&
                                              prevStep?.questionnaireStepDissatisfaction !== ''
                                            ? true
                                            : false
                                    }
                                >
                                    <>Klient jest niezadowolony</>
                                </FormInput>
                            </>

                            {isClientDissatisfiedData.isChecked && (
                                <>
                                    <FormMultiSelect
                                        options={selectData.questionnaireStepDissatisfaction}
                                        title={`Przyczyna niezadowolenia klienta: `}
                                        connection={clientDissatisfactionData}
                                        defaultValue={
                                            isNewBranchComparedByLastStepnameChange
                                                ? ''
                                                : prevStep?.questionnaireStepDissatisfaction || ''
                                        }
                                    />
                                    {clientDissatisfactionData.value?.includes('other') && (
                                        <>
                                            <p>Inna przyczyna niezadowolenia klienta:</p>
                                            <FormInput
                                                placeholder="Inna przyczyna niezadowolenia klienta"
                                                defaultValue={
                                                    isNewBranchComparedByLastStepnameChange
                                                        ? ''
                                                        : prevStep?.questionnaireStepOtherDissatisfaction
                                                }
                                                connection={otherDissatisfactionData}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            <SendButtons
                                curStepName="questionnaireStep"
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
