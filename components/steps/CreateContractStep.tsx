import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled, SendButtonsWrapper } from '../../styles/styled-components'
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
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages, getBranchValues } from '../../utilities'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import { useCalendarData } from '../../hooks/useCalendarData'
import { useFormSelect } from '../../hooks/useFormSelect'
import FormSelect from '../UI/FormSelect'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { selectData } from '../../accessories/constants'
import { DateTime } from 'luxon'
import PrevBranchProp from '../PrevBranchProp'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [isSpinning, setIsSpinning] = useState(false)
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const {
        prevStep,
        branchIdx,
        prevStepChangeStep,
        isNewBranchComparedByLastStepnameChange,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'contractStep',
        order,
    })

    console.log({ prevStep, branchIdx, prevStepChangeStep, isNewBranchComparedByLastStepnameChange, prevBranchOnProp })

    const isOfferSentData = useFormInput()
    const offerSendingDateData = useCalendarData()
    const areOfferChangesData = useFormSelect()
    const offerChangesData = useFormInput()
    const isOfferAcceptedData = useFormSelect()
    const sentForVerificationData = useFormInput()
    const otherRejectionData = useFormInput()
    const rejectionReasonsData = useFormSelect()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [
        isOfferSentData.isChecked,
        areOfferChangesData.isChecked,
        sentForVerificationData.isChecked,
        offerChangesData.isChecked,
        rejectionReasonsData.value,
        otherRejectionData.isChecked,
    ])

    const isOfferSentDefault =
        // isNewBranchComparedByLastStepnameChange
        //     ? false
        //     :
        prevStepChangeStep?.contractStepOfferSendingDate ? true : false

    console.log({ isOfferSentDefault })

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!isOfferSentDefault) {
            return true
        }

        if (!isOfferSentData.isChecked) {
            console.log('isOfferSentData error')
            showMessage ? isOfferSentData.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!areOfferChangesData.isChecked) {
            showMessage ? areOfferChangesData.showError!() : null
            console.log('areOfferChangesData error')
            setIsFormChecked(false)
            return false
        }

        if (!isOfferAcceptedData.isChecked) {
            showMessage ? isOfferAcceptedData.showError!() : null
            console.log('isOfferAcceptedData error')
            setIsFormChecked(false)
            return false
        }

        if (isOfferAcceptedData.value === 'yes' && !sentForVerificationData.isChecked) {
            showMessage ? sentForVerificationData.showError!() : null
            console.log('sentForVerificationData error')
            setIsFormChecked(false)
            return false
        }

        if (isOfferAcceptedData.value === 'no' && !rejectionReasonsData.isChecked) {
            showMessage ? rejectionReasonsData.showError!() : null
            console.log('rejectionReasonsData error')
            setIsFormChecked(false)
            return false
        }

        if (
            isOfferAcceptedData.value === 'no' &&
            rejectionReasonsData.value === 'other' &&
            !otherRejectionData.isChecked
        ) {
            showMessage ? otherRejectionData.showError!() : null
            console.log('otherRejectionData error')
            setIsFormChecked(false)
            return false
        }

        console.log('form checked')

        setIsFormChecked(true)
        return true
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (!offerChangesData.isChecked) {
            console.log({ offerChangesData })
            showMessage ? offerChangesData.showError!() : null
            setIsPrevFormChecked(false)
            return false
        }

        console.log('prev form checked')

        setIsPrevFormChecked(true)
        return true
    }

    const getIsMainCondition = () => {
        if (!isOfferSentDefault) {
            return true
        }
        return !isOfferSentData.isChecked || (isOfferSentData.isChecked && areOfferChangesData.value !== 'yes')
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        const isMainCondition = getIsMainCondition()

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

        const contractStepAreOfferChanges = !areOfferChangesData.value
            ? null
            : areOfferChangesData.value === 'select'
            ? null
            : areOfferChangesData.value === 'yes'
            ? true
            : false

        const contractStepOfferSendingDate = !isOfferSentData.value
            ? null
            : isNewBranchComparedByLastStepnameChange
            ? DateTime.now()
            : prevStep?.contractStepOfferSendingDate || DateTime.now()

        const contractStepSentForVerificationDate = !sentForVerificationData.value
            ? null
            : isNewBranchComparedByLastStepnameChange
            ? DateTime.now()
            : prevStep?.contractStepSentForVerificationDate || DateTime.now()

        await submitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'contractStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            nextToPass: !isOfferSentDefault
                ? 'contractStep'
                : isOfferAcceptedData.value === 'no' &&
                  (rejectionReasonsData.value === 'select'
                      ? false
                      : rejectionReasonsData.value === 'other'
                      ? otherRejectionData.isChecked
                      : true)
                ? 'lastDecisionStep'
                : 'contractCheckerStep',
            toPrevSendData: {
                order,
                contractStepAreOfferChanges,
                contractStepOfferChangesComment: offerChangesData.value,
                contractStepIsOfferAccepted: false,
                contractStepOfferSendingDate,
                contractStepOfferRejectionReason: null,
                contractStepSentForVerificationDate: null,
                // offerStepOfferDate: null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                contractStepAreOfferChanges,
                contractStepOfferChangesComment: offerChangesData.value,
                contractStepIsOfferAccepted:
                    isOfferAcceptedData.value === 'yes' ? true : isOfferAcceptedData.value === 'no' ? false : null,
                contractStepOfferSendingDate,
                contractStepSentForVerificationDate,
                contractStepOfferRejectionReason:
                    isOfferAcceptedData.value === 'no'
                        ? rejectionReasonsData.value === 'other'
                            ? otherRejectionData.isChecked
                                ? otherRejectionData.value
                                : 'other'
                            : rejectionReasonsData.value
                        : null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsSpinning(false)
        setIsVisible!(false)
    }

    const standardRejValues = ['select', 'price', 'date']

    const defaultRejectionValue = isNewBranchComparedByLastStepnameChange
        ? 'select'
        : prevStep?.contractStepOfferRejectionReason
        ? standardRejValues.includes(prevStep?.contractStepOfferRejectionReason)
            ? prevStep?.contractStepOfferRejectionReason
            : 'other'
        : 'select'

    const defaultOtherRejectionValue = isNewBranchComparedByLastStepnameChange
        ? ''
        : prevStep?.contractStepOfferRejectionReason
        ? prevStep?.contractStepOfferRejectionReason === 'other'
            ? ''
            : standardRejValues.includes(prevStep?.contractStepOfferRejectionReason)
            ? ''
            : prevStep?.contractStepOfferRejectionReason
        : ''

    return (
        <Spin spinning={isSpinning}>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            {/* <>
                                <p>Data wysłania oferty: </p>
                                <CalendarWithTime
                                    defaultDate={order && prevStep?.contractStepOfferSendingDate}
                                    connection={offerSendingDateData}
                                    isTimeEnabled={false}
                                />
                            </> */}
                            <FormInput
                                type="checkbox"
                                connection={isOfferSentData}
                                defaultChecked={isOfferSentDefault}
                                checkFn={(value) => value === true}
                                disabled={(prevStep && prevStep.passedTo !== 'contractStep') || isOfferSentDefault}
                            >
                                <>Oferta wysłana</>
                            </FormInput>

                            {isOfferSentDefault && isOfferSentData.isChecked && (
                                // <FormInput
                                //     type="checkbox"
                                //     connection={areOfferChangesData}
                                //     defaultChecked={
                                //         typeof prevStep?.contractStepAreOfferChanges === 'boolean'
                                //             ? prevStep?.contractStepAreOfferChanges
                                //             : false
                                //     }
                                //     // checkFn={(value: boolean) => value}
                                // >
                                //     <>Oferta potrzebuje zmian</>
                                // </FormInput>

                                <FormSelect
                                    options={selectData.standardSelect}
                                    name="areDocsGood"
                                    title="Oferta potrzebuje zmian:"
                                    connection={areOfferChangesData}
                                    defaultValue={
                                        isNewBranchComparedByLastStepnameChange
                                            ? 'select'
                                            : typeof prevStep?.contractStepAreOfferChanges !== 'boolean'
                                            ? 'select'
                                            : prevStep?.contractStepAreOfferChanges
                                            ? 'yes'
                                            : 'no'
                                    }
                                    disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                />
                            )}
                            {isOfferSentDefault && isOfferSentData.isChecked && areOfferChangesData.value === 'yes' && (
                                <>
                                    <p>Zmiany w ofercie: </p>
                                    {prevBranchOnProp && (
                                        <PrevBranchProp
                                            prevStepChangeStep={prevBranchOnProp}
                                            propName="contractStepOfferChangesComment"
                                        />
                                    )}
                                    <FormInput
                                        placeholder="Jakich zmian wymaga oferta?"
                                        defaultValue={
                                            isNewBranchComparedByLastStepnameChange
                                                ? ''
                                                : prevStep?.contractStepOfferChangesComment
                                        }
                                        connection={offerChangesData}
                                        disabled={
                                            prevStep &&
                                            prevStep.passedTo !== 'contractStep' &&
                                            !(
                                                prevStep?.passedTo === 'offerStep' &&
                                                prevStep?.createdByStep === 'contractStep'
                                            )
                                        }
                                    />
                                </>
                            )}
                            {isOfferSentDefault && isOfferSentData.isChecked && areOfferChangesData.value === 'no' && (
                                <>
                                    {/* <FormInput
                                        type="checkbox"
                                        connection={isOfferAcceptedData}
                                        defaultChecked={
                                            typeof prevStep?.contractStepIsOfferAccepted === 'boolean'
                                                ? prevStep?.contractStepIsOfferAccepted
                                                : false
                                        }
                                        checkFn={(value) => value as boolean}
                                    >
                                        <>Klient przyjął ofertę</>
                                    </FormInput> */}

                                    <FormSelect
                                        options={selectData.standardSelect}
                                        name="isOfferAcceptedData"
                                        title="Klient przyjął ofertę:"
                                        connection={isOfferAcceptedData}
                                        defaultValue={
                                            isNewBranchComparedByLastStepnameChange
                                                ? 'select'
                                                : typeof prevStep?.contractStepIsOfferAccepted !== 'boolean'
                                                ? 'select'
                                                : prevStep?.contractStepIsOfferAccepted
                                                ? 'yes'
                                                : 'no'
                                        }
                                        disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                    />

                                    {isOfferAcceptedData.value === 'yes' && (
                                        <>
                                            {/* <p>Data wysłania kontraktu do weryfikacji:</p>
                                            <CalendarWithTime
                                                defaultDate={order && prevStep?.contractStepSentForVerificationDate}
                                                connection={sentForVerificationDateData}
                                                isTimeEnabled={false}
                                            /> */}
                                            <FormInput
                                                type="checkbox"
                                                connection={sentForVerificationData}
                                                defaultChecked={
                                                    isNewBranchComparedByLastStepnameChange
                                                        ? false
                                                        : prevStepChangeStep?.contractStepSentForVerificationDate
                                                        ? true
                                                        : false
                                                }
                                                checkFn={(value) => value === true}
                                                disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                            >
                                                <>Kontrakt jest przygotowany i wysłany do weryfikacji</>
                                            </FormInput>
                                        </>
                                    )}

                                    {isOfferAcceptedData.value === 'no' && (
                                        <>
                                            <FormSelect
                                                options={selectData.contractStepOfferRejectionReason}
                                                name="rejectionReasons"
                                                title="Przyczyna odrzucenia oferty: "
                                                connection={rejectionReasonsData}
                                                defaultValue={defaultRejectionValue}
                                                disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                            />

                                            {rejectionReasonsData.value === 'other' && (
                                                <>
                                                    <p>Inna przyczyna odrzucenia oferty: </p>
                                                    <FormInput
                                                        placeholder="Inna przyczyna odrzucenia oferty"
                                                        defaultValue={defaultOtherRejectionValue}
                                                        connection={otherRejectionData}
                                                        disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                                    />
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <SendButtonsWrapper visible={isOfferSentDefault}>
                                <SendButtons
                                    maxPromotion={prevStep!.maxPromotion}
                                    passedTo={prevStep!.passedTo}
                                    curStepName="contractStep"
                                    dataRef={sendButtonsOutputRef}
                                    isFormChecked={isFormChecked}
                                    step={order?.steps[order.steps.length - 1]}
                                    formCheck={formCheck}
                                    isMainCondition={getIsMainCondition()}
                                    isPrevFormChecked={isPrevFormChecked}
                                    prevFormCheck={prevFormCheck}
                                />
                            </SendButtonsWrapper>
                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateContractStep
