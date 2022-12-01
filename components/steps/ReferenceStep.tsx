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
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import FormMultiSelect from '../UI/FormMultiSelect'
import { useFormMultiSelect } from '../../hooks/useFormMultiSelect'
import { selectData } from '../../accessories/constants'
import FormSelect from '../UI/FormSelect'
import { useFormSelect } from '../../hooks/useFormSelect'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const ReferenceStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
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
        stepName: 'referenceStep',
        order,
    })

    const errFn = useErrFn()

    const wasReferenceRequestSentData = useFormInput()
    const isClientReferenceData = useFormSelect()
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
            showMessage ? wasReferenceRequestSentData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!isClientReferenceData.isChecked) {
            console.log('isClientReferenceData error')
            showMessage ? isClientReferenceData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        console.log('isClientReferenceData.isChecked', isClientReferenceData.isChecked)
        console.log('referenceLocationData.value', referenceLocationData.value)

        if (isClientReferenceData.value === 'yes' && !referenceLocationData.isChecked) {
            console.log('referenceLocationData error')
            showMessage ? referenceLocationData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        console.log('form checked')

        setIsFormChecked(true)
        return true
    }

    // const isMainCondition = wasReferenceRequestSentData.isChecked && isClientReferenceData.value === 'yes'
    const isMainCondition = true

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log(target)

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

        const isNextChecked = target.nextCheckbox !== undefined && target.nextCheckbox.checked

        await submitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'referenceStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            nextToPass: 'referenceStep',
            toNextSendData: {
                order,
                isCompleted:
                    wasReferenceRequestSentData.value &&
                    isClientReferenceData.value === 'yes' &&
                    referenceLocationData.value &&
                    isNextChecked
                        ? true
                        : false,
                referenceStepWasSentRequest: wasReferenceRequestSentData.value,
                referenceStepIsClientReference:
                    isClientReferenceData.value === 'yes' ? true : isClientReferenceData.value === 'no' ? false : null,
                referenceStepReferenceLocation:
                    isClientReferenceData.value === 'yes' ? referenceLocationData.value : null,
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
                                        isNewBranchComparedByLastStepnameChange
                                            ? false
                                            : typeof prevStep?.referenceStepWasSentRequest === 'boolean'
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
                                    {/* <FormInput
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
                                    </FormInput> */}

                                    <FormSelect
                                        options={selectData.standardSelect}
                                        name="referenceStepIsClientReference"
                                        title="Klient wystawil referencje"
                                        connection={isClientReferenceData}
                                        defaultValue={
                                            isNewBranchComparedByLastStepnameChange
                                                ? 'select'
                                                : typeof prevStep?.referenceStepIsClientReference !== 'boolean'
                                                ? 'select'
                                                : prevStep?.referenceStepIsClientReference
                                                ? 'yes'
                                                : 'no'
                                        }
                                    />

                                    {isClientReferenceData.value === 'yes' && (
                                        <FormMultiSelect
                                            options={selectData.referenceStepReferenceLocation}
                                            title={`Gdzie wysłano referencję:`}
                                            connection={referenceLocationData}
                                            defaultValue={
                                                isNewBranchComparedByLastStepnameChange
                                                    ? ''
                                                    : prevStep?.referenceStepReferenceLocation || ''
                                            }
                                        />
                                    )}
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
                                isMainCondition={isMainCondition}
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
