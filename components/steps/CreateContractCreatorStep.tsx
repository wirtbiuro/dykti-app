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
import FormSelect from '../UI/FormSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import useErrFn from '../../hooks/useErrFn'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractCreatorStep: FC<IWithOrder> = ({ order, isVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const errFn = useErrFn()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const sendingDateData = useCalendarData()
    const isContractAcceptedData = useFormInput()
    const rejectionReasonData = useFormSelect()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    const defaultRejectionValue = prevStep?.contractCreatorStepContractRejectionReason ?? 'select'

    const isMainCondition = isContractAcceptedData.isChecked

    useEffect(() => {
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [sendingDateData.isChecked, isContractAcceptedData.isChecked, rejectionReasonData.isChecked])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!sendingDateData.isChecked) {
            console.log('sendingDateData error')
            showMessage ? sendingDateData.showError() : null
            return setIsFormChecked(false)
        }

        if (!isContractAcceptedData.isChecked && !rejectionReasonData.isChecked) {
            console.log('rejectionReasonData error')
            showMessage ? rejectionReasonData.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (!rejectionReasonData.isChecked) {
            console.log('rejectionReasonData error')
            showMessage ? rejectionReasonData.showError() : null
            return setIsPrevFormChecked(false)
        }

        return setIsPrevFormChecked(true)
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

        submitForm({
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'contractCreatorStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            isPrevFormChecked,
            prevToPass:
                rejectionReasonData.value === 'time'
                    ? 'formStep'
                    : rejectionReasonData.value === 'offer'
                    ? 'offerStep'
                    : 'contractCheckerStep',
            toNextSendData: {
                order,
                contractCreatorStepContractSendingDate: sendingDateData.value,
                contractCreatorStepIsContractAccepted: true,
                contractCreatorStepContractRejectionReason: null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toPrevSendData: {
                order,
                contractCreatorStepContractSendingDate: sendingDateData.value,
                contractCreatorStepIsContractAccepted: false,
                contractCreatorStepContractRejectionReason: rejectionReasonData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })
    }

    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <CreateFormStyled>
                <FormStyled>
                    <form ref={formRef} onSubmit={submit}>
                        <>
                            <>
                                <p>Data wysłania kontraktu:</p>
                                <CalendarWithTime
                                    defaultDate={order && prevStep?.contractCreatorStepContractSendingDate}
                                    connection={sendingDateData}
                                    isTimeEnabled={false}
                                />
                            </>

                            {sendingDateData.isChecked && (
                                <FormInput
                                    type="checkbox"
                                    connection={isContractAcceptedData}
                                    defaultChecked={
                                        typeof prevStep?.contractCreatorStepIsContractAccepted === 'boolean'
                                            ? prevStep?.contractCreatorStepIsContractAccepted
                                            : false
                                    }
                                    checkFn={(value: boolean) => value}
                                >
                                    <>Kontrakt jest podpisany przez klienta?</>
                                </FormInput>
                            )}

                            {sendingDateData.isChecked && !isContractAcceptedData.isChecked && (
                                <>
                                    {/* <p>Powód, dla którego kontrakt nie został podpisany:</p> */}
                                    {/* <FormInput
                                        placeholder="Napisz tutaj..."
                                        defaultValue={prevStep?.contractCreatorStepContractRejectionReason}
                                        connection={rejectionReasonData}
                                    /> */}

                                    <FormSelect
                                        options={[
                                            ['select', 'Wybierz powód odrzucenia oferty'],
                                            ['time', 'Klient potrzebuje więcej czasu'],
                                            ['offer', 'Wymagane zmiany oferty'],
                                            ['contract', 'Wymagane zmiany kontraktu'],
                                        ]}
                                        name="rejectionReasons"
                                        title="Przyczyna odrzucenia oferty: "
                                        connection={rejectionReasonData}
                                        defaultValue={defaultRejectionValue}
                                    />
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
    )
}

export default CreateContractCreatorStep
