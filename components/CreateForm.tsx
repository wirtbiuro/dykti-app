import React, { SyntheticEvent, useRef, useEffect, useState, FC } from 'react'
import { FormStyled, CreateFormStyled } from '../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    FormCheckType,
    FieldsToSend,
    ISendCheckboxes,
    ISendButtonsOutputRef,
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import FormInput from './UI/FormInput'
import { submitFirstForm } from '../utilities'
import { useFormInput } from '../hooks/useFormInput'
import { useCalendarData } from '../hooks/useCalendarData'
import { flushSync } from 'react-dom'
import CalendarWithTime from './CalendarWithTime'
import SendButtons from './UI/SendButtons'

type FormType = WithValueNFocus<ISendCheckboxes>

type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const nameData = useFormInput()
    const phoneData = useFormInput()
    const emailData = useFormInput()
    const cityData = useFormInput()
    const addressData = useFormInput()
    const commentData = useFormInput()
    const whereClientFoundData = useFormInput()
    const meetingDateData = useCalendarData()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [
        nameData.isChecked,
        phoneData.isChecked,
        emailData.isChecked,
        cityData.isChecked,
        addressData.value,
        meetingDateData.isChecked,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!nameData.isChecked) {
            console.log('nameData error')
            showMessage ? nameData.showError() : null
            return setIsFormChecked(false)
        }

        if (!emailData.isChecked && !phoneData.isChecked) {
            console.log('emailPhoneData error')
            showMessage ? phoneData.showError() : null
            return setIsFormChecked(false)
        }

        if (!cityData.isChecked) {
            console.log('cityData error')
            showMessage ? cityData.showError() : null
            return setIsFormChecked(false)
        }

        if (!addressData.isChecked) {
            console.log('addressData error')
            showMessage ? addressData.showError() : null
            return setIsFormChecked(false)
        }

        if (!meetingDateData.isChecked) {
            console.log('meetingDateData error')
            showMessage ? meetingDateData.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
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

        submitFirstForm({
            target,
            curStepName: 'formStep',
            step: prevStep!,
            formCheck,
            isFormChecked,
            toNextSendData: {
                order,
                formStepAddress: addressData.value,
                formStepCity: cityData.value,
                formStepClientName: nameData.value,
                formStepComment: commentData.value,
                formStepWhereClientFound: whereClientFoundData.value,
                formStepEmail: emailData.value,
                formStepPhone: phoneData.value,
                formStepMeetingDate: meetingDateData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
        })
    }

    return (
        <CreateFormStyled>
            <h2>Nowa Sprawa:</h2>
            <FormStyled>
                <form onSubmit={submit} ref={formRef}>
                    <p>Informacja klientów: </p>
                    <FormInput
                        connection={nameData}
                        placeholder="imię i nazwisko klienta"
                        defaultValue={prevStep?.formStepClientName}
                    />
                    <FormInput
                        connection={phoneData}
                        placeholder="Numer kontaktowy"
                        defaultValue={prevStep?.formStepPhone}
                    />
                    <FormInput
                        connection={emailData}
                        placeholder="E-mail"
                        defaultValue={prevStep?.formStepEmail}
                    />
                    <p>Adres zamówienia: </p>
                    <FormInput
                        connection={cityData}
                        placeholder="Miasto"
                        defaultValue={prevStep?.formStepCity}
                    />
                    <FormInput
                        connection={addressData}
                        placeholder="Adres obiektu"
                        defaultValue={prevStep?.formStepAddress}
                    />
                    <p>Gdzie znaleziono klienta: </p>
                    <FormInput
                        connection={whereClientFoundData}
                        placeholder="Gdzie znaleziono klienta"
                        defaultValue={prevStep?.formStepWhereClientFound}
                    />
                    <p>Czas spotkania:</p>
                    <CalendarWithTime
                        defaultDate={order && prevStep?.formStepMeetingDate}
                        connection={meetingDateData}
                        isTimeEnabled={true}
                    />

                    <p>Komentarz: </p>
                    <FormInput
                        connection={commentData}
                        placeholder="komentarz"
                        defaultValue={prevStep?.formStepComment}
                    />
                    <SendButtons
                        curStepName="formStep"
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
    )
}

export default CreateForm
