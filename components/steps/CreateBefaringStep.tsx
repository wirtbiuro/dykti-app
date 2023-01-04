import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes } from '../../types'
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
        globalStepWhereLastTransitionWas,
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
        globalStepWhereLastTransitionWas,
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

    const isMeetingDataChecked =
        DateTime.now().toMillis() > (meetingCalendarData.date?.toMillis() || DateTime.now().plus({ day: 1 }).toMillis())

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
        if (meetingCalendarData.date && offerCalendarData.setDay) {
            offerCalendarData.setDay(meetingCalendarData.date.endOf('day').plus({ days: 7 }))
        }
    }, [meetingCalendarData.date])

    useEffect(() => {
        if (!isMeetingDataChecked) {
            wasThereMeeting.setCheckboxValue(false)
            wasThereMeeting.setErrorValue('')
            wereDocsSent.setCheckboxValue(false)
            wereDocsSent.setErrorValue('')
            offerCalendarData.setDate(null)
            offerCalendarData.setErrorValue('')
        }
        if (isMeetingDataChecked) {
            offerCalendarData.setDay(meetingCalendarData.date!.endOf('day').plus({ days: 7 }))
            offerCalendarData.setErrorValue('')
        }
    }, [isMeetingDataChecked])

    const enabled = {
        meetingCalendar:
            globalStepWhereLastTransitionWas?.passedTo === 'beffaringStep' &&
            globalStepWhereLastTransitionWas.createdByStep === 'formStep',
        wasThereMeeting:
            globalStepWhereLastTransitionWas?.passedTo === 'beffaringStep' &&
            globalStepWhereLastTransitionWas.createdByStep === 'formStep',
        wereDocsSent: wasThereMeeting.checkboxValue && globalStepWhereLastTransitionWas?.passedTo === 'beffaringStep',
        offerCalendar:
            wasThereMeeting.checkboxValue &&
            globalStepWhereLastTransitionWas?.passedTo === 'beffaringStep' &&
            globalStepWhereLastTransitionWas?.createdByStep === 'formStep',
        comment: globalStepWhereLastTransitionWas?.passedTo === 'beffaringStep',
    }

    const isSendEnabled =
        enabled.meetingCalendar ||
        enabled.wasThereMeeting ||
        enabled.wereDocsSent ||
        enabled.offerCalendar ||
        enabled.comment

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

    return (
        <Spin spinning={isSpinning}>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={onSubmit}>
                            <p>Termin spotkania: </p>

                            <Calendar connection={meetingCalendarData} disabled={!enabled.meetingCalendar} />

                            {isMeetingDataChecked && (
                                <CheckboxFormInput connection={wasThereMeeting} disabled={!enabled.wasThereMeeting} />
                            )}

                            {wasThereMeeting.checkboxValue === true && (
                                <div>
                                    <CheckboxFormInput connection={wereDocsSent} disabled={!enabled.wereDocsSent} />

                                    <p>Kiedy należy przygotować ofertę?</p>

                                    <Calendar connection={offerCalendarData} disabled={!enabled.offerCalendar} />
                                </div>
                            )}

                            {prevBranchOnProp && (
                                <PrevBranchProp prevStepChangeStep={prevBranchOnProp} propName="beffaringStepComment" />
                            )}
                            <TextFormInput connection={commentData} disabled={!enabled.comment} />

                            {isSendEnabled && (
                                <>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={isMainCondition}
                                        isCurrentStep={prevStep?.passedTo === 'beffaringStep'}
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

export default CreateBefaringStep

// 414
