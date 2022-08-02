import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../styles/styled-components'
import {
    IOrder,
    WithValueNFocus,
    PropNames,
    IWithOrder,
    StepType,
    IOutputRef,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import FormInput from './UI/FormInput'
import CalendarWithTime from './CalendarWithTime'
import SendButtons from './UI/SendButtons'
import { initOutputRef, submitForm } from '../utilities'
import { DateTime } from 'luxon'
import { flushSync } from 'react-dom'

interface AuxFields {
    uncompleteSave: boolean
}
type FormFields = StepType & AuxFields
type FieldsToSend = StepType & {
    order?: IOrder
}
type FormType = WithValueNFocus<ISendCheckboxes>
type Names = PropNames<FormFields>
type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const commentDataRef = useRef<IOutputRef>(initOutputRef())
    const meetingDateOutputRef = useRef<IOutputRef>(initOutputRef())
    const docsSendDateOutputRef = useRef<IOutputRef>(initOutputRef())
    const offerDateOutputRef = useRef<IOutputRef>(initOutputRef())
    const wasThereMeetingRef = useRef<IOutputRef>(initOutputRef())
    const wasMeetingCheckboxName = 'wasMeetingCheckbox'

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const prevStepMeetingStringDate = prevStep?.formStepMeetingDate as string
    const prevMeetingDateValueRef = useRef<DateTime>(
        DateTime.fromISO(prevStepMeetingStringDate)
    )

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [wasThereMeeting, setWasThereMeeting] = useState<boolean>(false)
    const [isMeetingDateChecked, setIsMeetingDateChecked] = useState<boolean>(
        false
    )

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!meetingDateOutputRef.current?.check()) {
            showMessage ? meetingDateOutputRef.current?.showError() : null
            return setIsFormChecked(false)
        }
        if (!wasThereMeetingRef.current?.check()) {
            showMessage ? wasThereMeetingRef.current?.showError() : null
            return setIsFormChecked(false)
        }
        if (!docsSendDateOutputRef.current?.check()) {
            showMessage ? docsSendDateOutputRef.current?.showError() : null
            return setIsFormChecked(false)
        }
        if (!offerDateOutputRef.current?.check()) {
            showMessage ? offerDateOutputRef.current?.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const formChanged = (e: SyntheticEvent<HTMLFormElement>) => {
        console.log(
            'form changed wasThereMeetingRef.current.getValue()',
            wasThereMeetingRef.current.getValue()
        )
        console.log({ prevStep })
        console.log(
            'prevStep?.beffaringStepWasThereMeeting',
            prevStep?.beffaringStepWasThereMeeting
        )
        if (
            !wasThereMeetingRef.current.getValue() &&
            prevStep?.beffaringStepWasThereMeeting
        ) {
            setWasThereMeeting(prevStep?.beffaringStepWasThereMeeting)
        }
        setIsMeetingDateChecked(meetingDateOutputRef.current.check())

        if (e) {
            flushSync(() => {
                setWasThereMeeting(wasThereMeetingRef.current.getValue())
                setIsMeetingDateChecked(meetingDateOutputRef.current.check())
            })

            const target = e.target as typeof e.target & HTMLInputElement
            console.log({ targetName: target.name })
            if (
                target.name === wasMeetingCheckboxName &&
                meetingDateOutputRef.current.check()
            ) {
                console.log('set default offer date')
                const meetingDate = meetingDateOutputRef.current.getValue() as DateTime
                console.log({ meetingDate })
                offerDateOutputRef.current.setValue(
                    meetingDate?.endOf('day').plus({ days: 7 })
                )
                console.log('offerDate', offerDateOutputRef.current)
            }
        }
        formCheck({ showMessage: false })
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        submitForm({
            target,
            isMainCondition: true,
            curStepName: 'beffaringStep',
            prevStepName: 'formStep',
            step: prevStep!,
            formCheck,
            isFormChecked,
            toNextSendData: {
                order,
                formStepMeetingDate: meetingDateOutputRef.current.check()
                    ? meetingDateOutputRef.current.getValue()
                    : null,
                beffaringStepWasThereMeeting: wasThereMeetingRef.current.getValue(),
                beffaringStepDocsSendDate: docsSendDateOutputRef.current.check()
                    ? docsSendDateOutputRef.current.getValue()
                    : null,
                beffaringStepOfferDate: offerDateOutputRef.current.check()
                    ? offerDateOutputRef.current.getValue()
                    : null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
        })
    }

    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <CreateFormStyled>
                <FormStyled>
                    <form
                        ref={formRef}
                        onChange={formChanged}
                        onSubmit={submit}
                    >
                        <p>Termin spotkania: </p>

                        <CalendarWithTime
                            defaultDate={order && prevStep?.formStepMeetingDate}
                            dataRef={meetingDateOutputRef}
                            formChanged={formChanged}
                        />
                        {isMeetingDateChecked && (
                            <FormInput
                                type="checkbox"
                                dataRef={wasThereMeetingRef}
                                defaultChecked={
                                    typeof prevStep?.beffaringStepWasThereMeeting ===
                                    'boolean'
                                        ? prevStep?.beffaringStepWasThereMeeting
                                        : false
                                }
                                name={wasMeetingCheckboxName}
                                checkFn={(value: boolean) => value}
                            >
                                <>Czy było spotkanie?</>
                            </FormInput>
                        )}

                        {wasThereMeeting && isMeetingDateChecked && (
                            <>
                                <br />
                                <br />
                                <p>Data wysłania dokumentów, zdjęć: </p>

                                <CalendarWithTime
                                    defaultDate={
                                        order &&
                                        prevStep?.beffaringStepDocsSendDate
                                    }
                                    dataRef={docsSendDateOutputRef}
                                    isTimeEnabled={false}
                                    formChanged={formChanged}
                                />

                                <br />
                                <br />
                                <p>Kiedy należy przygotować ofertę?</p>

                                <CalendarWithTime
                                    defaultDate={
                                        order &&
                                        prevStep?.beffaringStepOfferDate
                                    }
                                    dataRef={offerDateOutputRef}
                                    isTimeEnabled={false}
                                    formChanged={formChanged}
                                />
                            </>
                        )}

                        <p>Komentarz: </p>
                        <FormInput
                            placeholder="komentarz"
                            defaultValue={
                                order?.steps[order.steps.length - 1]
                                    .beffaringStepComment
                            }
                            dataRef={commentDataRef}
                        />

                        <SendButtons
                            curStepName="beffaringStep"
                            prevStepName="formStep"
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
    )
}

export default CreateForm
