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
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages } from '../../utilities'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import { useCalendarData } from '../../hooks/useCalendarData'
import { useFormSelect } from '../../hooks/useFormSelect'
import FormSelect from '../UI/FormSelect'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { selectData } from '../../accessories/constants'

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

    const prevStep = order?.steps[order.steps.length - 1]

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const offerSendingDateData = useCalendarData()
    const areOfferChangesData = useFormInput()
    const offerChangesData = useFormInput()
    const isOfferAcceptedData = useFormInput()
    const sentForVerificationDateData = useCalendarData()
    const otherRejectionData = useFormInput()
    const rejectionReasonsData = useFormSelect()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [
        offerSendingDateData.isChecked,
        areOfferChangesData.isChecked,
        sentForVerificationDateData.isChecked,
        offerChangesData.isChecked,
        rejectionReasonsData.value,
        otherRejectionData.isChecked,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!offerSendingDateData.isChecked) {
            console.log('offerSendingDateData error')
            showMessage ? offerSendingDateData.showError!() : null
            return setIsFormChecked(false)
        }

        if (isOfferAcceptedData.isChecked && !sentForVerificationDateData.isChecked) {
            showMessage ? sentForVerificationDateData.showError!() : null
            console.log('sentForVerificationDateData error')
            return setIsFormChecked(false)
        }

        if (!isOfferAcceptedData.isChecked && !rejectionReasonsData.isChecked) {
            showMessage ? rejectionReasonsData.showError!() : null
            console.log('rejectionReasonsData error')
            return setIsFormChecked(false)
        }

        if (!isOfferAcceptedData.isChecked && rejectionReasonsData.value === 'other' && !otherRejectionData.isChecked) {
            showMessage ? otherRejectionData.showError!() : null
            console.log('otherRejectionData error')
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (!offerChangesData.isChecked) {
            console.log({ offerChangesData })
            showMessage && offerChangesData.showError ? offerChangesData?.showError() : null
            return setIsPrevFormChecked(false)
        }

        console.log('prev form checked')

        return setIsPrevFormChecked(true)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        const isMainCondition = areOfferChangesData.isChecked

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
            prevStep: prevStep!,
            userId: userData.id,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'contractStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            toPrevSendData: {
                order,
                contractStepAreOfferChanges: true,
                contractStepOfferChangesComment: offerChangesData.value,
                contractStepIsOfferAccepted: false,
                contractStepOfferSendingDate: offerSendingDateData.value,
                contractStepOfferRejectionReason: null,
                contractStepSentForVerificationDate: null,
                // offerStepOfferDate: null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                contractStepAreOfferChanges: false,
                contractStepOfferChangesComment: null,
                contractStepIsOfferAccepted: isOfferAcceptedData.value,
                contractStepOfferSendingDate: offerSendingDateData.value,
                contractStepSentForVerificationDate: sentForVerificationDateData.value,
                contractStepOfferRejectionReason: isOfferAcceptedData.value
                    ? 'select'
                    : rejectionReasonsData.value === 'other'
                    ? otherRejectionData.value
                    : rejectionReasonsData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsSpinning(false)
        setIsVisible!(false)
    }

    const standardRejValues = ['select', 'price', 'date']
    const defaultRejectionValue = prevStep?.contractStepOfferRejectionReason
        ? standardRejValues.includes(prevStep?.contractStepOfferRejectionReason)
            ? prevStep?.contractStepOfferRejectionReason
            : 'other'
        : 'select'
    const defaultOtherRejectionValue = prevStep?.contractStepOfferRejectionReason
        ? standardRejValues.includes(prevStep?.contractStepOfferRejectionReason)
            ? ''
            : prevStep?.contractStepOfferRejectionReason
        : ''

    return (
        <Spin spinning={isSpinning}>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            <>
                                <p>Data wysłania oferty: </p>
                                <CalendarWithTime
                                    defaultDate={order && prevStep?.contractStepOfferSendingDate}
                                    connection={offerSendingDateData}
                                    isTimeEnabled={false}
                                />
                            </>

                            <FormInput
                                type="checkbox"
                                connection={areOfferChangesData}
                                defaultChecked={
                                    typeof prevStep?.contractStepAreOfferChanges === 'boolean'
                                        ? prevStep?.contractStepAreOfferChanges
                                        : false
                                }
                                // checkFn={(value: boolean) => value}
                            >
                                <>Oferta potrzebuje zmian</>
                            </FormInput>
                            {!areOfferChangesData.isChecked && (
                                <>
                                    <p>Zmiany w ofercie: </p>
                                    <FormInput
                                        placeholder="Jakich zmian wymaga oferta?"
                                        defaultValue={prevStep?.contractStepOfferChangesComment}
                                        connection={offerChangesData}
                                    />
                                </>
                            )}
                            {areOfferChangesData.isChecked && (
                                <>
                                    <FormInput
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
                                    </FormInput>

                                    {isOfferAcceptedData.isChecked && (
                                        <>
                                            <p>Data wysłania kontraktu do weryfikacji:</p>
                                            <CalendarWithTime
                                                defaultDate={order && prevStep?.contractStepSentForVerificationDate}
                                                connection={sentForVerificationDateData}
                                                isTimeEnabled={false}
                                            />
                                        </>
                                    )}

                                    {!isOfferAcceptedData.isChecked && (
                                        <>
                                            <FormSelect
                                                options={selectData.contractStepOfferRejectionReason}
                                                name="rejectionReasons"
                                                title="Przyczyna odrzucenia oferty: "
                                                connection={rejectionReasonsData}
                                                defaultValue={defaultRejectionValue}
                                            />

                                            {rejectionReasonsData.value === 'other' && (
                                                <>
                                                    <p>Inna przyczyna odrzucenia oferty: </p>
                                                    <FormInput
                                                        placeholder="Inna przyczyna odrzucenia oferty"
                                                        defaultValue={defaultOtherRejectionValue}
                                                        connection={otherRejectionData}
                                                    />
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                            <SendButtons
                                maxPromotion={prevStep!.maxPromotion}
                                passedTo={prevStep!.passedTo}
                                curStepName="contractStep"
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                step={order?.steps[order.steps.length - 1]}
                                formCheck={formCheck}
                                isMainCondition={areOfferChangesData.isChecked}
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

export default CreateContractStep
