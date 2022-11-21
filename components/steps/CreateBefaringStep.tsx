import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import {
    IOrder,
    WithValueNFocus,
    IWithOrder,
    StepType,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
} from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, getMaxPromotion, showErrorMessages, getReturnStep } from '../../utilities'
import { DateTime } from 'luxon'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import Calendar from '../calendar/Calendar'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import { Modal } from 'antd'

type FieldsToSend = StepType & {
    order?: IOrder
}
type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateBefaringStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const prevStep = order?.steps[order.steps.length - 1]

    const [meetingCalendar] = useState<CalendarModule>(
        new CalendarModule({
            withTime: true,
            selectedDate: prevStep?.formStepMeetingDate
                ? DateTime.fromISO(prevStep?.formStepMeetingDate as string)
                : undefined,
        })
    )
    const meetingCalendarData = useCalendarData(meetingCalendar)

    const [offerCalendar] = useState<CalendarModule>(
        new CalendarModule({
            withTime: false,
            selectedDate: prevStep?.beffaringStepOfferDate
                ? DateTime.fromISO(prevStep?.beffaringStepOfferDate as string)
                : undefined,
        })
    )
    const offerCalendarData = useCalendarData(offerCalendar)

    const isMeetingDataChecked =
        meetingCalendarData.dayMonthYear &&
        meetingCalendarData.hours !== 'hh' &&
        meetingCalendarData.minutes !== 'mm' &&
        DateTime.now().toMillis() > meetingCalendar.getSelectedDateWithoutError()!.toMillis()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const docsSendDateData = useFormInput()
    // const offerDateData = useCalendarData()

    const wasThereMeeting = useFormInput()
    const wereDocsSent = useFormInput()
    const commentData = useFormInput()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        console.log('meetingCalendarData.dayMonthYear changed')

        const meetingDate = meetingCalendar.getSelectedDate(false)

        meetingDate && isMeetingDataChecked && wasThereMeeting.isChecked
            ? offerCalendar.setSelectedDate(meetingDate.endOf('day').plus({ days: 7 }))
            : offerCalendar.setSelectedDate(null)

        console.log('offerCalendarData', meetingDate && isMeetingDataChecked && wasThereMeeting.isChecked)

        // offerDateData.setValue && offerDateData.setValue(meetingDate?.endOf('day').plus({ days: 7 }))
    }, [
        isMeetingDataChecked,
        meetingCalendarData.dayMonthYear,
        meetingCalendarData.minutes,
        meetingCalendarData.hours,
        wasThereMeeting.isChecked,
    ])

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [
        meetingCalendarData.dayMonthYear,
        meetingCalendarData.minutes,
        meetingCalendarData.hours,
        wasThereMeeting.isChecked,
        docsSendDateData.isChecked,
        wereDocsSent.isChecked,
        offerCalendarData.dayMonthYear,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!meetingCalendar.getSelectedDate(showMessage)) {
            return setIsFormChecked(false)
        }

        if (!isMeetingDataChecked) {
            showMessage
                ? Modal.warning({
                      content: 'Nie możesz przejść dalej, dopóki spotkanie się nie rozpocznie.',
                  })
                : null
            return setIsFormChecked(false)
        }

        // if (!meetingDateData.isChecked) {
        //     console.log('meeting date error')
        //     showMessage ? meetingDateData?.showError!() : null
        //     return setIsFormChecked(false)
        // }
        if (!wasThereMeeting.isChecked) {
            console.log('was there meeting error')
            showMessage ? wasThereMeeting?.showError!() : null
            return setIsFormChecked(false)
        }
        if (!wereDocsSent.isChecked) {
            console.log('docs send date error')
            showMessage ? wereDocsSent?.showError!() : null
            return setIsFormChecked(false)
        }

        if (!offerCalendar.getSelectedDate(showMessage)) {
            return setIsFormChecked(false)
        }

        // if (!offerDateData.isChecked) {
        //     console.log('offer date error')
        //     showMessage ? offerDateData?.showError!() : null
        //     return setIsFormChecked(false)
        // }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log(target)

        // const isUncompletedChecked =
        //     (target.uncompleteCheckbox !== undefined && target.uncompleteCheckbox.checked) ||
        //     (target.nextCheckbox !== undefined && !target.nextCheckbox.checked) ||
        //     flushSync(() => {
        //         formCheck({ showMessage: !isUncompletedChecked })
        //     })

        // if (!isFormChecked && !isUncompletedChecked) {
        //     return
        // }

        const isMainCondition = true

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

        await submitForm({
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'beffaringStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            toNextSendData: {
                order,
                formStepMeetingDate: meetingCalendar.getSelectedDate(),
                beffaringStepWasThereMeeting: meetingCalendar.getSelectedDate() ? wasThereMeeting.value : undefined,
                // beffaringStepDocsSendDate: docsSendDateData.isChecked ? docsSendDateData.value : null,
                beffaringStepDocsSendDate: !meetingCalendar.getSelectedDate()
                    ? null
                    : !wereDocsSent.isChecked
                    ? null
                    : prevStep?.beffaringStepDocsSendDate || DateTime.now(),
                beffaringStepOfferDate: offerCalendar.getSelectedDate(),
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
            {' '}
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            <p>Termin spotkania: </p>

                            {/* <CalendarWithTime
                                defaultDate={order && prevStep?.formStepMeetingDate}
                                connection={meetingDateData}
                            /> */}

                            <Calendar calendar={meetingCalendar} />

                            {/* {meetingData?.check !== undefined && meetingDateData?.isChecked && ( */}
                            {isMeetingDataChecked && (
                                <div
                                    style={{
                                        display: isMeetingDataChecked ? 'block' : 'none',
                                    }}
                                >
                                    <FormInput
                                        type="checkbox"
                                        connection={wasThereMeeting}
                                        defaultChecked={
                                            typeof prevStep?.beffaringStepWasThereMeeting === 'boolean'
                                                ? prevStep?.beffaringStepWasThereMeeting
                                                : false
                                        }
                                        checkFn={(value) => value as boolean}
                                    >
                                        <>Spotkanie sie odbyło</>
                                    </FormInput>
                                </div>
                            )}

                            {wasThereMeeting.value && isMeetingDataChecked && (
                                <div
                                    style={{
                                        display: wasThereMeeting.value && isMeetingDataChecked ? 'block' : 'none',
                                    }}
                                >
                                    {/* <p>Data wysłania dokumentów, zdjęć: </p>

                                    <CalendarWithTime
                                        defaultDate={order && prevStep?.beffaringStepDocsSendDate}
                                        connection={docsSendDateData}
                                        isTimeEnabled={false}
                                    /> */}

                                    <FormInput
                                        type="checkbox"
                                        connection={wereDocsSent}
                                        defaultChecked={prevStep?.beffaringStepDocsSendDate !== null}
                                        checkFn={(value) => value as boolean}
                                    >
                                        <>Dokumenty zostały wysłane.</>
                                    </FormInput>

                                    <p>Kiedy należy przygotować ofertę?</p>

                                    {/* <CalendarWithTime
                                        defaultDate={
                                            (order && prevStep?.beffaringStepOfferDate) ||
                                            meetingDateData.value?.endOf('day').plus({ days: 7 })
                                        }
                                        connection={offerDateData}
                                        isTimeEnabled={false}
                                    /> */}

                                    <Calendar calendar={offerCalendar} />
                                </div>
                            )}
                            <p>Komentarz: </p>
                            <FormInput
                                placeholder="komentarz"
                                defaultValue={prevStep?.beffaringStepComment}
                                connection={commentData}
                            />

                            <SendButtons
                                curStepName="beffaringStep"
                                passedTo={prevStep!.passedTo}
                                maxPromotion={prevStep!.maxPromotion}
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                step={order?.steps[order.steps.length - 1]}
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

export default CreateBefaringStep
