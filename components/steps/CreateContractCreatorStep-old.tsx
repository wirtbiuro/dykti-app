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
import { submitForm, showErrorMessages, getBranchValues } from '../../utilities'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import FormSelect from '../UI/FormSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import Calendar from '../calendar/Calendar'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import { DateTime } from 'luxon'
import { selectData, workDayStartHours } from '../../accessories/constants'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractCreatorStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'contractCreatorStep',
        order,
    })

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const isContractSentData = useFormInput()
    const isContractAcceptedData = useFormSelect()
    const rejectionReasonData = useFormSelect()
    const otherRejectionData = useFormInput()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    // const defaultRejectionValue = prevStep?.contractCreatorStepContractRejectionReason ?? 'select'

    const standardRejValues = ['select', 'time', 'offer', 'contract']

    const defaultRejectionValue = isNewBranchComparedByLastStepWhereSomethingWasChanged
        ? 'select'
        : prevStep?.contractCreatorStepContractRejectionReason
        ? standardRejValues.includes(prevStep?.contractCreatorStepContractRejectionReason)
            ? prevStep?.contractCreatorStepContractRejectionReason
            : 'other'
        : 'select'

    const defaultOtherRejectionValue = isNewBranchComparedByLastStepWhereSomethingWasChanged
        ? ''
        : prevStep?.contractCreatorStepContractRejectionReason
        ? prevStep?.contractCreatorStepContractRejectionReason === 'other'
            ? ''
            : standardRejValues.includes(prevStep?.contractCreatorStepContractRejectionReason)
            ? ''
            : prevStep?.contractStepOfferRejectionReason
        : ''

    const isMainCondition = isContractSentData.isChecked && isContractAcceptedData.value === 'no' ? false : true
    console.log({ isMainCondition })

    useEffect(() => {
        console.log('useeffect check')
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [
        isContractSentData.isChecked,
        isContractAcceptedData.isChecked,
        rejectionReasonData.isChecked,
        otherRejectionData.isChecked,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!isContractSentData.isChecked) {
            showMessage ? isContractSentData.showError!() : null
            console.log('isContractSentData error')
            setIsFormChecked(false)
            return false
        }

        // if (!sendingDateData.isChecked) {
        //     console.log('sendingDateData error')
        //     showMessage ? sendingDateData.showError!() : null
        //     return setIsFormChecked(false)
        // }
        if (!isContractAcceptedData.isChecked) {
            showMessage ? isContractAcceptedData.showError!() : null
            console.log('isContractAcceptedData error')
            setIsFormChecked(false)
            return false
        }

        if (isContractAcceptedData.value === 'no' && !rejectionReasonData.isChecked) {
            console.log('rejectionReasonData error')
            showMessage ? rejectionReasonData.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (
            isContractAcceptedData.value === 'no' &&
            rejectionReasonData.value === 'other' &&
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

        if (!rejectionReasonData.isChecked) {
            console.log('rejectionReasonData error')
            showMessage ? rejectionReasonData.showError!() : null
            setIsPrevFormChecked(false)
            return false
        }

        if (
            isContractAcceptedData.value === 'no' &&
            rejectionReasonData.value === 'other' &&
            !otherRejectionData.isChecked
        ) {
            showMessage ? otherRejectionData.showError!() : null
            console.log('otherRejectionData error')
            setIsFormChecked(false)
            return false
        }

        setIsPrevFormChecked(true)
        return true
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        const areErrors = showErrorMessages({
            flushSync,
            formCheck,
            prevFormCheck,
            isFormChecked,
            isPrevFormChecked,
            isMainCondition,
            target,
        })

        console.log('submit')

        console.log({ areErrors })

        if (areErrors) return

        setIsSpinning(true)

        const contractCreatorStepContractSendingDate = !isContractSentData.value
            ? null
            : isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? DateTime.now()
            : prevStep?.contractCreatorStepContractSendingDate || DateTime.now()

        await submitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'contractCreatorStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            isPrevFormChecked,
            deadline: prevStep?.nextDeadline,
            supposedNextDeadline: DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            prevToPass:
                rejectionReasonData.value === 'time'
                    ? 'contractStep'
                    : rejectionReasonData.value === 'offer'
                    ? 'offerStep'
                    : rejectionReasonData.value === 'contract'
                    ? 'contractCheckerStep'
                    : 'lastDecisionStep',
            toNextSendData: {
                order,
                contractCreatorStepContractSendingDate,
                contractCreatorStepIsContractAccepted:
                    isContractAcceptedData.value === 'yes'
                        ? true
                        : isContractAcceptedData.value === 'no'
                        ? false
                        : null,
                contractCreatorStepContractRejectionReason: null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toPrevSendData: {
                order,
                contractCreatorStepContractSendingDate,
                contractCreatorStepIsContractAccepted:
                    isContractAcceptedData.value === 'yes'
                        ? true
                        : isContractAcceptedData.value === 'no'
                        ? false
                        : null,
                contractCreatorStepContractRejectionReason: rejectionReasonData.value,
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
                                <>
                                    {/* <p>Data wysłania kontraktu:</p> */}
                                    {/* <CalendarWithTime
                                        defaultDate={order && prevStep?.contractCreatorStepContractSendingDate}
                                        connection={sendingDateData}
                                        isTimeEnabled={false}
                                    /> */}
                                    {/* <Calendar
                                        calendar={calendar}
                                        disabled={prevStep && prevStep?.passedTo !== 'contractCreatorStep'}
                                    /> */}
                                    <FormInput
                                        type="checkbox"
                                        connection={isContractSentData}
                                        defaultChecked={
                                            isNewBranchComparedByLastStepWhereSomethingWasChanged
                                                ? false
                                                : lastStepWhereSomethingWasChanged?.contractCreatorStepContractSendingDate
                                                ? true
                                                : false
                                        }
                                        checkFn={(value) => value === true}
                                    >
                                        <>Kontrakt wysłany</>
                                    </FormInput>
                                </>

                                {isContractSentData.isChecked && (
                                    <FormSelect
                                        options={selectData.standardSelect}
                                        name="isContractAcceptedData"
                                        title="Kontrakt jest podpisany przez klienta?"
                                        connection={isContractAcceptedData}
                                        defaultValue={
                                            isNewBranchComparedByLastStepWhereSomethingWasChanged
                                                ? 'select'
                                                : typeof prevStep?.contractCreatorStepIsContractAccepted !== 'boolean'
                                                ? 'select'
                                                : prevStep?.contractCreatorStepIsContractAccepted
                                                ? 'yes'
                                                : 'no'
                                        }
                                    />

                                    // <FormInput
                                    //     type="checkbox"
                                    //     connection={isContractAcceptedData}
                                    //     defaultChecked={
                                    //         typeof prevStep?.contractCreatorStepIsContractAccepted === 'boolean'
                                    //             ? prevStep?.contractCreatorStepIsContractAccepted
                                    //             : false
                                    //     }
                                    //     checkFn={(value) => value as boolean}
                                    // >
                                    //     <>Kontrakt jest podpisany przez klienta?</>
                                    // </FormInput>
                                )}

                                {isContractSentData.isChecked && isContractAcceptedData.value === 'no' && (
                                    <>
                                        {/* <p>Powód, dla którego kontrakt nie został podpisany:</p> */}
                                        {/* <FormInput
                                        placeholder="Napisz tutaj..."
                                        defaultValue={prevStep?.contractCreatorStepContractRejectionReason}
                                        connection={rejectionReasonData}
                                    /> */}

                                        <FormSelect
                                            options={[
                                                ['select', 'Wybierz powód odrzucenia kontraktu'],
                                                ['time', 'Klient potrzebuje więcej czasu'],
                                                ['offer', 'Wymagane zmiany oferty'],
                                                ['contract', 'Wymagane zmiany kontraktu'],
                                                ['other', 'Inne'],
                                            ]}
                                            name="rejectionReasons"
                                            title="Przyczyna odrzucenia kontraktu: "
                                            connection={rejectionReasonData}
                                            defaultValue={defaultRejectionValue}
                                        />

                                        {rejectionReasonData.value === 'other' && (
                                            <>
                                                <p>Inna przyczyna odrzucenia kontraktu: </p>
                                                <FormInput
                                                    placeholder="Napisz tutaj"
                                                    defaultValue={defaultOtherRejectionValue}
                                                    connection={otherRejectionData}
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                            </>

                            <SendButtons
                                isMainCondition={isMainCondition}
                                curStepName="contractCreatorStep"
                                maxPromotion={prevStep!.maxPromotion}
                                passedTo={prevStep!.passedTo}
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                isPrevFormChecked={isPrevFormChecked}
                                step={prevStep}
                                formCheck={formCheck}
                            />
                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateContractCreatorStep
