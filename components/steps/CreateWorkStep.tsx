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
import FormMultiSelect from '../UI/FormMultiSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import { DateTime } from 'luxon'
import useErrFn from '../../hooks/useErrFn'
import { useFormMultiSelect } from '../../hooks/useFormMultiSelect'
import { Spin } from 'antd'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateWorkStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()
    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const prevStep = order?.steps[order.steps.length - 1]

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const workStartDateData = useCalendarData()
    const workEndDateData = useCalendarData()
    const shouldChangeContractData = useFormInput()
    const teamData = useFormMultiSelect()
    const contractEditsData = useFormInput()
    // const rejectionReasonData = useFormSelect()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    const workStartDateDataValue = workStartDateData.value as DateTime

    const isMainCondition =
        // workStartDateDataValue?.toUTC().toISO() === prevStep?.contractCheckerStepWorkStartDate &&
        shouldChangeContractData.isChecked

    // console.log('workStartDateDataValue', workStartDateDataValue?.toUTC().toISO())
    // console.log('prevStep?.contractCheckerStepWorkStartDate', prevStep?.contractCheckerStepWorkStartDate)

    // console.log(
    //     'workStartDateDataValue?.toUTC().toISO()',
    //     workStartDateDataValue?.toUTC().toISO(),
    //     ' === prevStep?.contractCheckerStepWorkStartDate',
    //     prevStep?.contractCheckerStepWorkStartDate
    // )
    // console.log({ isMainCondition })

    useEffect(() => {
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [
        workStartDateData.value,
        workEndDateData.isChecked,
        shouldChangeContractData.isChecked,
        teamData.isChecked,
        contractEditsData.isChecked,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!workStartDateData.isChecked) {
            console.log('workStartDateData error')
            showMessage ? workStartDateData.showError!() : null
            return setIsFormChecked(false)
        }

        if (!teamData.isChecked) {
            console.log('teamData error')
            showMessage ? teamData.showError!() : null
            return setIsFormChecked(false)
        }

        if (!workEndDateData.isChecked) {
            console.log('workEndDateData error')
            showMessage && workStartDateData ? workEndDateData.showError!() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (shouldChangeContractData.isChecked) {
            console.log('shouldChangeContractData error')
            showMessage ? shouldChangeContractData.showError!() : null
            return setIsPrevFormChecked(false)
        }

        if (!workStartDateData.isChecked) {
            console.log('workStartDateData error')
            showMessage && workStartDateData ? workStartDateData.showError!() : null
            return setIsPrevFormChecked(false)
        }

        if (workStartDateDataValue?.toUTC().toISO() !== prevStep?.contractCheckerStepWorkStartDate) {
            return setIsPrevFormChecked(true)
        }

        if (!contractEditsData.isChecked) {
            console.log('contractEditsData error')
            showMessage ? contractEditsData.showError!() : null
            return setIsPrevFormChecked(false)
        }

        return setIsPrevFormChecked(true)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log({ teamData })

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

        console.log('workEndDateData.value', workEndDateData.value)

        setIsSpinning(true)

        await submitForm({
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'workStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            isPrevFormChecked,
            toNextSendData: {
                order,
                workStepTeam: teamData.value,
                workStepWorkStartDate: workStartDateData.value,
                workStepContractEdits: null,
                workStepWorkEndDate: workEndDateData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toPrevSendData: {
                order,
                workStepTeam: teamData.value,
                workStepWorkStartDate: workStartDateData.value,
                workStepContractEdits: contractEditsData.value,
                workStepWorkEndDate: null,
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
                                    <p>Data rozpoczęcia pracy:</p>
                                    <CalendarWithTime
                                        defaultDate={
                                            order &&
                                            (prevStep?.workStepWorkStartDate ||
                                                prevStep?.contractCheckerStepWorkStartDate)
                                        }
                                        connection={workStartDateData}
                                        isTimeEnabled={false}
                                    />
                                </>

                                <>
                                    <FormInput
                                        type="checkbox"
                                        connection={shouldChangeContractData}
                                        defaultChecked={prevStep?.workStepContractEdits ? true : false}
                                    >
                                        <>Kontrakt wymaga zmiany</>
                                    </FormInput>
                                </>

                                {!shouldChangeContractData.isChecked && (
                                    <>
                                        <p>Zmiany w kontrakcie: </p>
                                        <FormInput
                                            placeholder="Jakich zmian wymaga kontrakt?"
                                            defaultValue={prevStep?.workStepContractEdits}
                                            connection={contractEditsData}
                                        />
                                    </>
                                )}

                                <>
                                    <p>Ekipa: </p>
                                    <FormMultiSelect
                                        placeholder="Ekipa"
                                        defaultValue={prevStep?.workStepTeam || ''}
                                        connection={teamData}
                                        options={[
                                            ['1', 'Piotr'],
                                            ['22', 'Adam'],
                                            ['3', 'Kamil'],
                                            ['4', 'Olek'],
                                        ]}
                                    />
                                </>

                                {/* {shouldChangeContractData.isChecked && ( */}
                                <>
                                    <p>Data zakończenia pracy:</p>
                                    <CalendarWithTime
                                        defaultDate={order && prevStep?.workStepWorkEndDate}
                                        connection={workEndDateData}
                                        isTimeEnabled={false}
                                    />
                                </>
                                {/* )} */}

                                {/* {sendingDateData.isChecked && !isContractAcceptedData.isChecked && (
                                <>
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
                            )} */}
                            </>

                            <SendButtons
                                isMainCondition={isMainCondition}
                                curStepName="workStep"
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

export default CreateWorkStep
