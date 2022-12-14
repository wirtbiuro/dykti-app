import React, { SyntheticEvent, useRef, useEffect, useState, FC } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    FormCheckType,
    FieldsToSend,
    ISendCheckboxes,
    ISendButtonsOutputRef,
} from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import { submitForm, getZeroArrElements } from '../../utilities'
import { useFormInput } from '../../hooks/useFormInput'
import { flushSync } from 'react-dom'
import SendButtons from '../UI/SendButtons'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import Calendar from '../calendar/Calendar'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import { DateTime } from 'luxon'
import { selectData, workDayStartHours } from '../../accessories/constants'
import FormSelect from '../UI/FormSelect'
import { useFormSelect } from '../../hooks/useFormSelect'

type FormType = WithValueNFocus<ISendCheckboxes>

type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [isSpinning, setIsSpinning] = useState(false)

    const prevStep = order?.steps[order.steps.length - 1]

    const [calendar] = useState<CalendarModule>(
        new CalendarModule({
            withTime: true,
            selectedDate: prevStep?.formStepMeetingDate
                ? DateTime.fromISO(prevStep?.formStepMeetingDate as string)
                : undefined,
        })
    )
    const calendarData = useCalendarData(calendar)

    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const nameData = useFormInput()
    const phoneData = useFormInput()
    const emailData = useFormInput()
    const cityData = useFormInput()
    const addressData = useFormInput()
    const commentData = useFormInput()
    const otherWhereClientFoundData = useFormInput()
    const whereClientFoundData = useFormSelect()
    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [
        nameData.isChecked,
        phoneData.isChecked,
        emailData.isChecked,
        cityData.isChecked,
        addressData.value,
        calendarData.dayMonthYear,
        calendarData.hours,
        calendarData.minutes,
        whereClientFoundData.value,
        otherWhereClientFoundData.isChecked,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!nameData.isChecked) {
            console.log('nameData error')
            showMessage ? nameData.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!emailData.isChecked && !phoneData.isChecked) {
            console.log('emailPhoneData error')
            showMessage ? phoneData.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!addressData.isChecked) {
            console.log('addressData error')
            showMessage ? addressData.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (whereClientFoundData.value?.includes('select')) {
            console.log('whereClientFoundData error')
            showMessage ? whereClientFoundData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (whereClientFoundData.value?.includes('other') && otherWhereClientFoundData.value === '') {
            console.log('otherWhereClientFoundData error')
            showMessage ? otherWhereClientFoundData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!calendar.getSelectedDate(showMessage)) {
            console.log('calendar error')
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

        const uncompleteCondition =
            target?.uncompleteCheckbox?.checked === false ||
            target?.nextCheckbox?.checked ||
            target?.prevCheckbox?.checked

        flushSync(() => {
            formCheck({ showMessage: uncompleteCondition })
        })

        if (!isFormChecked && uncompleteCondition) {
            return
        }

        setIsSpinning(true)

        await submitForm({
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep?.maxPromotion || 'formStep',
            target,
            isMainCondition: true,
            curStepName: 'formStep',
            passedTo: prevStep?.passedTo || 'formStep',
            formCheck,
            isFormChecked,
            deadline: prevStep?.deadline,
            supposedNextDeadline: calendar
                .getSelectedDate()
                ?.endOf('day')
                .plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            toNextSendData: {
                order,
                formStepAddress: addressData.value,
                formStepCity: cityData.value,
                formStepClientName: nameData.value,
                formStepComment: commentData.value,
                formStepWhereClientFound:
                    whereClientFoundData.value === 'other'
                        ? otherWhereClientFoundData.value
                        : whereClientFoundData.value,
                formStepEmail: emailData.value,
                formStepPhone: phoneData.value,
                formStepMeetingDate: calendar.getSelectedDate(),
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsSpinning(false)
        setIsVisible!(false)
    }

    const disabled =
        prevStep &&
        prevStep?.passedTo !== 'formStep' &&
        !(prevStep?.passedTo === 'beffaringStep' && prevStep?.createdByStep === 'formStep')

    return (
        <Spin spinning={isSpinning}>
            <div style={{ maxHeight: isVisible ? 'none' : '0px', overflow: 'hidden' }}>
                <CreateFormStyled>
                    {!order ? <h2>Nowa Sprawa:</h2> : false}
                    <FormStyled>
                        <form onSubmit={submit} ref={formRef}>
                            <p>Informacja klient??w: </p>
                            <FormInput
                                connection={nameData}
                                placeholder="imi?? i nazwisko klienta"
                                defaultValue={prevStep?.formStepClientName}
                                disabled={disabled}
                            />
                            <FormInput
                                connection={phoneData}
                                placeholder="Numer kontaktowy"
                                defaultValue={prevStep?.formStepPhone}
                                disabled={disabled}
                            />
                            <FormInput
                                connection={emailData}
                                placeholder="E-mail"
                                defaultValue={prevStep?.formStepEmail}
                                disabled={disabled}
                            />
                            <p>Adres zam??wienia: </p>
                            {/* <FormInput connection={cityData} placeholder="Miasto" defaultValue={prevStep?.formStepCity} /> */}
                            <FormInput
                                connection={addressData}
                                placeholder="Adres obiektu"
                                defaultValue={prevStep?.formStepAddress}
                                disabled={disabled}
                            />
                            {/* <p>Gdzie znaleziono klienta: </p> */}
                            {/* <FormInput
                                connection={whereClientFoundData}
                                placeholder="Gdzie znaleziono klienta"
                                defaultValue={prevStep?.formStepWhereClientFound}
                            /> */}
                            <FormSelect
                                options={selectData.formStepWhereClientFound}
                                title={`Gdzie znaleziono klienta: `}
                                connection={whereClientFoundData}
                                defaultValue={
                                    prevStep?.formStepWhereClientFound
                                        ? getZeroArrElements(selectData.formStepWhereClientFound).includes(
                                              prevStep?.formStepWhereClientFound
                                          )
                                            ? prevStep?.formStepWhereClientFound
                                            : 'other'
                                        : 'select'
                                }
                                disabled={disabled}
                            />

                            {whereClientFoundData.value?.includes('other') && (
                                <>
                                    <FormInput
                                        placeholder="Napisz tutaj"
                                        defaultValue={
                                            prevStep?.formStepWhereClientFound
                                                ? getZeroArrElements(selectData.formStepWhereClientFound).includes(
                                                      prevStep?.formStepWhereClientFound
                                                  )
                                                    ? ''
                                                    : prevStep?.formStepWhereClientFound
                                                : ''
                                        }
                                        connection={otherWhereClientFoundData}
                                        disabled={disabled}
                                    />
                                </>
                            )}

                            <p>Czas spotkania:</p>

                            <Calendar
                                calendar={calendar}
                                // disabled={prevStep && prevStep?.passedTo !== 'formStep'}
                                disabled={disabled}
                            />

                            <p>Komentarz: </p>
                            <FormInput
                                connection={commentData}
                                placeholder="komentarz"
                                defaultValue={prevStep?.formStepComment}
                                disabled={disabled}
                            />
                            {!disabled && (
                                <SendButtons
                                    passedTo={prevStep?.passedTo || 'formStep'}
                                    maxPromotion={prevStep?.maxPromotion || 'formStep'}
                                    curStepName="formStep"
                                    dataRef={sendButtonsOutputRef}
                                    isFormChecked={isFormChecked}
                                    step={order?.steps[order.steps.length - 1]}
                                    formCheck={formCheck}
                                    isMainCondition={true}
                                />
                            )}
                            {!disabled && <input type="submit" value="Zapisz" />}
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateForm
