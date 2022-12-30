import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { IOrder, WithValueNFocus, IWithOrder, StepType, ISendCheckboxes } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, NullableFieldsToSend, mainSubmitForm } from '../../utilities'
import { DateTime } from 'luxon'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import Calendar from '../components/calendar'
import { useCalendarData } from '../../hooks/new/useCalendarData'
import { Modal } from 'antd'
import PrevBranchProp from '../PrevBranchProp'
import { workDayStartHours } from '../../accessories/constants'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import CheckboxFormInput from '../components/CheckboxFormInput'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import TextFormInput from '../components/TextFormInput'
import NextPrevCheckbox from '../components/NextPrevCheckbox'

type FieldsToSend = StepType & {
    order?: IOrder
}
type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateBefaringStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        lastStepWherePassedToWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'beffaringStep',
        order,
    })

    console.log({
        prevStep,
        branchIdx,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        lastStepWherePassedToWasChanged,
        prevBranchOnProp,
    })

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const isMainCondition = true

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const meetingCalendarData = useCalendarData({
        selectedDate: prevStep?.beffaringStepMeetingDate
            ? DateTime.fromISO(prevStep?.beffaringStepMeetingDate as string)
            : prevStep?.formStepMeetingDate
            ? DateTime.fromISO(prevStep?.formStepMeetingDate as string)
            : undefined,
        withTime: true,
    })

    const offerCalendarData = useCalendarData({
        withTime: false,
        selectedDate: prevStep?.beffaringStepOfferDate
            ? DateTime.fromISO(prevStep?.beffaringStepOfferDate as string)
            : undefined,
    })

    const isMeetingDataChecked = meetingCalendarData.date
    DateTime.now().toMillis() > (meetingCalendarData.date?.toMillis() || 0)

    const wereDocsSent = useCheckboxFormInput({
        title: 'Dokumenty zostały wysłane',
        initialValue: prevStep?.beffaringStepDocsSendDate !== null,
    })

    const wasThereMeeting = useCheckboxFormInput({
        title: 'Spotkanie sie odbyło',
        initialValue: prevStep?.beffaringStepWasThereMeeting,
    })

    const commentData = useTextFormInput({
        title: 'Komentarz:',
        initialTextValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? ''
            : lastStepWhereSomethingWasChanged?.beffaringStepComment,
    })

    useEffect(() => {
        if (meetingCalendarData.date) {
            offerCalendarData.setDate(meetingCalendarData.date.endOf('day').plus({ days: 7 }))
        }
    }, [meetingCalendarData.date])

    const nextCheck = (showMessage: boolean) => {
        if (!meetingCalendarData.check(showMessage)) {
            return false
        }
        if (!isMeetingDataChecked) {
            if (showMessage) {
                Modal.warning({
                    content: 'Nie możesz przejść dalej, dopóki spotkanie się nie rozpocznie.',
                })
            }
            return false
        }

        if (!wasThereMeeting.check(showMessage)) {
            return false
        }
        if (!wereDocsSent.check(showMessage)) {
            return false
        }
        if (!offerCalendarData.check(showMessage)) {
            return false
        }
        return true
    }

    const onSubmit = async (e: SyntheticEvent) => {
        const _createOrder = createOrder as (data: NullableFieldsToSend) => void

        e.preventDefault()
        console.log('on submit')
        if (isMainCondition && nextPrevCheckboxData.check(false)) {
            if (!nextCheck(true)) {
                return
            }
        }

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'beffaringStep',
            passedTo: prevStep!.passedTo,
            deadline:
                meetingCalendarData.date?.endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }) ||
                prevStep?.nextDeadline,
            supposedNextDeadline: offerCalendarData.date,
            sendData: {
                order,
                beffaringStepMeetingDate: meetingCalendarData.date,
                beffaringStepWasThereMeeting: wasThereMeeting.checkboxValue,
                beffaringStepDocsSendDate:
                    wereDocsSent.checkboxValue === false
                        ? null
                        : isNewBranchComparedByLastStepWhereSomethingWasChanged
                        ? DateTime.now()
                        : prevStep?.beffaringStepDocsSendDate || DateTime.now(),
                beffaringStepOfferDate: offerCalendarData.date,
                beffaringStepComment: commentData.textValue,
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsVisible!(false)
        setIsSpinning(false)
    }

    const disabled =
        prevStep &&
        prevStep?.passedTo !== 'beffaringStep' &&
        !(prevStep?.passedTo === 'offerStep' && prevStep?.createdByStep === 'beffaringStep')

    return (
        <Spin spinning={isSpinning}>
            {' '}
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={onSubmit}>
                            <p>Termin spotkania: </p>

                            <Calendar
                                connection={meetingCalendarData}
                                disabled={prevStep?.maxPromotion !== 'beffaringStep'}
                            />

                            {isMeetingDataChecked && (
                                <CheckboxFormInput
                                    connection={wasThereMeeting}
                                    disabled={prevStep?.maxPromotion !== 'beffaringStep'}
                                />
                            )}

                            {wasThereMeeting.check(false) && (
                                <div>
                                    <CheckboxFormInput
                                        connection={wereDocsSent}
                                        disabled={prevStep && prevStep?.passedTo !== 'beffaringStep'}
                                    />

                                    <p>Kiedy należy przygotować ofertę?</p>

                                    <Calendar connection={offerCalendarData} disabled={disabled} />
                                </div>
                            )}

                            <p>Komentarz: </p>
                            {prevBranchOnProp && (
                                <PrevBranchProp prevStepChangeStep={prevBranchOnProp} propName="beffaringStepComment" />
                            )}
                            <TextFormInput connection={commentData} disabled={disabled} />

                            {!disabled && (
                                <NextPrevCheckbox
                                    connection={nextPrevCheckboxData}
                                    isMainCondition={isMainCondition}
                                    isCurrentStep={prevStep?.passedTo === 'beffaringStep'}
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

export default CreateBefaringStep

// 414
