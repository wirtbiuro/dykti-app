import React, { SyntheticEvent, useRef, useState, FC } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { mainSubmitForm, NullableFieldsToSend, getBranchValues } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import Calendar from '../../components/components/calendar'
import { useCalendarData } from '../../hooks/new/useCalendarData'
import { DateTime } from 'luxon'
import { selectData, workDayStartHours } from '../../accessories/constants'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import TextFormInput from '../components/TextFormInput'
import { useFormSelectWithOther } from '../../hooks/new/useFormSelectWithOther'
import FormSelectWithOther from '../components/FormSelectWithOther'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import NextPrevCheckbox from '../components/NextPrevCheckbox'

type FormType = WithValueNFocus<ISendCheckboxes>

type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [isSpinning, setIsSpinning] = useState(false)

    const { prevStep, globalStepWhereLastTransitionWas } = getBranchValues({
        stepName: 'formStep',
        order,
    })

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const calendarData = useCalendarData({
        withTime: true,
        selectedDate: prevStep?.formStepMeetingDate
            ? DateTime.fromISO(prevStep?.formStepMeetingDate as string)
            : undefined,
    })

    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const nameData = useTextFormInput({
        title: 'Informacja klientów:',
        placeholder: 'imię i nazwisko klienta',
        initialTextValue: prevStep?.formStepClientName,
    })

    const phoneData = useTextFormInput({
        placeholder: 'Numer kontaktowy',
        initialTextValue: prevStep?.formStepPhone,
    })
    const emailData = useTextFormInput({
        placeholder: 'E-mail',
        initialTextValue: prevStep?.formStepEmail,
    })

    const addressData = useTextFormInput({
        title: 'Adres zamówienia:',
        placeholder: 'Adres obiektu',
        initialTextValue: prevStep?.formStepAddress,
    })
    const commentData = useTextFormInput({
        title: 'Komentarz:',
        placeholder: 'komentarz',
        initialTextValue: prevStep?.formStepComment,
    })

    const whereClientFoundData = useFormSelectWithOther({
        options: selectData.formStepWhereClientFound,
        selectTitle: `Gdzie znaleziono klienta:`,
        initialValue: prevStep?.formStepWhereClientFound,
    })

    const nextCheck = (showMessage: boolean) => {
        if (!nameData.check(showMessage)) {
            return false
        }
        if (!emailData.check(showMessage)) {
            return false
        }
        if (!phoneData.check(showMessage)) {
            return false
        }
        if (!addressData.check(showMessage)) {
            return false
        }
        if (!whereClientFoundData.check(showMessage)) {
            return false
        }
        if (!calendarData.check(showMessage)) {
            return false
        }
        return true
    }

    const onSubmit = async (e: SyntheticEvent) => {
        const _createOrder = createOrder as (data: NullableFieldsToSend) => void

        e.preventDefault()
        console.log('on submit')
        if (nextPrevCheckboxData.check(false)) {
            if (!nextCheck(true)) {
                return
            }
        }

        const data = {
            formStepAddress: addressData.textValue,
            formStepClientName: nameData.textValue,
            formStepComment: commentData.textValue,
            formStepWhereClientFound: whereClientFoundData.value,
            formStepEmail: emailData.textValue,
            formStepPhone: phoneData.textValue,
            formStepMeetingDate: calendarData.date,
        }

        setIsSpinning(true)

        await mainSubmitForm({
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep?.maxPromotion || 'formStep',
            isMainCondition: true,
            curStepName: 'formStep',
            passedTo: prevStep?.passedTo || 'formStep',
            deadline: prevStep?.deadline,
            supposedNextDeadline: calendarData.date
                ?.endOf('day')
                .plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            sendData: {
                order,
                ...data,
            },
            createOrder: _createOrder,
            errFn,
        })

        console.log('submit end')

        setIsVisible!(false)
        setIsSpinning(false)
    }

    const enabledIfCurrentStepEqualesFormStepOrBefaringStepWithNoRecords =
        !prevStep ||
        globalStepWhereLastTransitionWas?.passedTo === 'formStep' ||
        (prevStep?.passedTo === 'beffaringStep' && prevStep.createdByStep === 'formStep')

    const enabled = {
        name: enabledIfCurrentStepEqualesFormStepOrBefaringStepWithNoRecords,
        phone: enabledIfCurrentStepEqualesFormStepOrBefaringStepWithNoRecords,
        email: enabledIfCurrentStepEqualesFormStepOrBefaringStepWithNoRecords,
        address: enabledIfCurrentStepEqualesFormStepOrBefaringStepWithNoRecords,
        whereClientFound: enabledIfCurrentStepEqualesFormStepOrBefaringStepWithNoRecords,
        calendar: !prevStep || globalStepWhereLastTransitionWas?.passedTo === 'formStep',
        comment: enabledIfCurrentStepEqualesFormStepOrBefaringStepWithNoRecords,
    }

    const isSendEnabled =
        enabled.name ||
        enabled.phone ||
        enabled.email ||
        enabled.address ||
        enabled.whereClientFound ||
        enabled.calendar ||
        enabled.comment

    return (
        <Spin spinning={isSpinning}>
            <div style={{ maxHeight: isVisible ? 'none' : '0px', overflow: 'hidden' }}>
                <CreateFormStyled>
                    {!order ? <h2>Nowa Sprawa:</h2> : false}
                    <FormStyled>
                        <form onSubmit={onSubmit} ref={formRef}>
                            <TextFormInput connection={nameData} disabled={!enabled.name} />
                            <TextFormInput connection={phoneData} disabled={!enabled.phone} />
                            <TextFormInput connection={emailData} disabled={!enabled.email} />
                            <TextFormInput connection={addressData} disabled={!enabled.address} />
                            <FormSelectWithOther
                                connection={whereClientFoundData}
                                disabled={!enabled.whereClientFound}
                            />

                            <p>Czas spotkania:</p>
                            <Calendar connection={calendarData} disabled={!enabled.calendar} />

                            <TextFormInput connection={commentData} disabled={!enabled.comment} />

                            {isSendEnabled && (
                                <>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={true}
                                        isCurrentStep={prevStep?.passedTo === 'formStep' || !prevStep}
                                    />
                                    <input type="submit" value="Zapisz" />
                                </>
                            )}
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateForm

// 308
