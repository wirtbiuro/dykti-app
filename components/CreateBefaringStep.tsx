import React, { SyntheticEvent, useRef, FC } from 'react'
import { IOrder, CreateBefaringStepReqData } from '../types'
import Calendar from './Calendar'
import { useCreateBefaringStepMutation } from '../state/apiSlice'
import useMeetingDate from '../hooks/useMeetingDate'
import { DateTime } from 'luxon'
import { FormStyled } from '../styles/styled-components'

type FormType = {
    wasOfferSent: { checked: boolean; focus: Function }
    comment: { value: string; focus: Function }
}

// interface FormElement extends HTMLFormElement {}
// interface FormElement extends FormType {}

type FormElement = HTMLFormElement & FormType

type CreateBefaringStepType = {
    order: IOrder
    wasOfferSent?: boolean
    comment?: string
    meetingDate?: string
}

const CreateBefaringStep: FC<CreateBefaringStepType> = ({
    order,
    wasOfferSent,
    comment,
    meetingDate,
}) => {
    const [createBefaringStep] = useCreateBefaringStepMutation()

    const [selectedDate, setSelectedDate] = useMeetingDate(meetingDate)

    console.log({ meetingDate, selectedDate })

    const wasOfferSentErrRef = useRef<HTMLInputElement>(null)
    const commentErrRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<FormElement>(null)

    function formCheck(
        target: (EventTarget & FormType) | HTMLFormElement
    ): boolean {
        wasOfferSentErrRef.current!.innerHTML = ''
        return true
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        if (!formCheck(target)) return

        const data: CreateBefaringStepReqData = {
            wasOfferSent: target.wasOfferSent.checked,
            comment: target.comment.value,
            meetingDate: selectedDate,
            orderId: order.id,
            formStepId: order.steps[order.steps.length - 1].formStep.id,
        }
        console.log('Submit Form', { data })

        createBefaringStep(data)
    }

    const formChanged = (e: SyntheticEvent<HTMLFormElement>) => {
        const target = e.target as HTMLFormElement
        switch (target.name) {
            case 'wasOfferSent':
                wasOfferSentErrRef.current!.innerHTML = ''
        }
    }

    return (
        <FormStyled>
            <form onSubmit={submit} onChange={formChanged} ref={formRef}>
                <h3>Termin spotkania:</h3>

                <Calendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />

                <h3>Komentarz:</h3>

                <div className="withErr">
                    <div className="formError" ref={commentErrRef}></div>
                    <input
                        type="text"
                        name="comment"
                        placeholder="Komentarz"
                        defaultValue={comment ?? ''}
                    />
                </div>

                <div className="withErr">
                    <div className="formError" ref={wasOfferSentErrRef}></div>
                    <input
                        type="checkbox"
                        name="wasOfferSent"
                        defaultChecked={wasOfferSent}
                    />
                    Czy oferta została wysłana?
                </div>

                <input type="submit" value="Dalej" />
            </form>
        </FormStyled>
    )
}

export default CreateBefaringStep
