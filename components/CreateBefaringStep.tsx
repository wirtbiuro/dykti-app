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
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import FormInput from './UI/FormInput'
import CalendarWithTime from './CalendarWithTime'
import SendButtons from './UI/SendButtons'

interface AuxFields {
    uncompleteSave: boolean
}
type FormFields = StepType & AuxFields
type FieldsToSend = StepType & {
    order?: IOrder
}
type FormType = WithValueNFocus<FormFields>
type Names = PropNames<FormFields>
type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const commentDataRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {},
        getErrTitleElement: () => {},
    })

    const meetingDateOutputRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {},
        getErrTitleElement: () => {},
    })

    const docsSendDateOutputRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {},
        getErrTitleElement: () => {},
    })

    const offerDateOutputRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {},
        getErrTitleElement: () => {},
    })

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    const formCheck: (showMessage?: boolean) => void = (
        showMessage = false
    ) => {
        console.log('form check')

        // if (!formInputOutputRef.current?.check()) {
        //     showMessage ? formInputOutputRef.current?.showError() : null
        //     return setIsFormChecked(false)
        // }

        if (!meetingDateOutputRef.current?.check()) {
            showMessage ? meetingDateOutputRef.current?.showError() : null
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
        formCheck(false)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        console.log('submit')

        const target = e.target as typeof e.target & FormType

        if (
            (target.uncompleteSave &&
                !target.uncompleteSave?.checked &&
                !isFormChecked) ||
            (target.beffaringStepIsCompleted &&
                target.beffaringStepIsCompleted?.checked &&
                !isFormChecked)
        )
            return formCheck(true)

        console.log('Submit Form')

        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log('meeting date', meetingDateOutputRef.current.getValue())

        const data: FieldsToSend = {
            beffaringStepComment: commentDataRef.current.getValue(),

            ...sendButtonsOutputRef.current.getResults(),

            // beffaringStepIsCompleted: !order?.steps[order.steps.length - 1]
            //     .beffaringStepIsProceedToNext
            //     ? target.beffaringStepIsCompleted?.checked
            //     : isFormChecked,
            // beffaringStepShouldPerfomerConfirmView: order?.steps[
            //     order.steps.length - 1
            // ].beffaringStepIsProceedToNext
            //     ? target.beffaringStepShouldPerfomerConfirmView?.checked
            //     : true,

            formStepMeetingDate: meetingDateOutputRef.current.check()
                ? meetingDateOutputRef.current.getValue()
                : null,

            beffaringStepDocsSendDate: docsSendDateOutputRef.current.check()
                ? docsSendDateOutputRef.current.getValue()
                : null,

            beffaringStepOfferDate: offerDateOutputRef.current.check()
                ? offerDateOutputRef.current.getValue()
                : null,

            // beffaringStepIsProceedToNext:
            //     !order?.steps[order.steps.length - 1]
            //         .beffaringStepIsProceedToNext ??
            //     target.beffaringStepIsCompleted?.checked,

            order,
        }

        console.log({ data })

        _createOrder(data)
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
                        />

                        <br />
                        <br />
                        <p>Data wysłania dokumentów, zdjęć: </p>

                        <CalendarWithTime
                            defaultDate={
                                order && prevStep?.beffaringStepDocsSendDate
                            }
                            dataRef={docsSendDateOutputRef}
                        />

                        <br />
                        <br />
                        <p>Kiedy należy przygotować ofertę?</p>

                        <CalendarWithTime
                            defaultDate={
                                order && prevStep?.beffaringStepOfferDate
                            }
                            dataRef={offerDateOutputRef}
                        />

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

                        {/* {!order?.steps[order.steps.length - 1]
                            .beffaringStepIsProceedToNext && (
                            <>
                                <input
                                    type="checkbox"
                                    name="beffaringStepIsCompleted"
                                    defaultChecked={true}
                                />
                                Skończ i przekaż dalej
                            </>
                        )}
                        {order?.steps[order.steps.length - 1]
                            .beffaringStepIsProceedToNext &&
                            !isFormChecked && (
                                <FormInput<Names> name="uncompleteSave">
                                    <>
                                        <input
                                            type="checkbox"
                                            name="uncompleteSave"
                                            defaultChecked={false}
                                        />
                                        Zapisz z niekompletnymi danymi.
                                    </>
                                </FormInput>
                            )}
                        {order?.steps[order.steps.length - 1]
                            .beffaringStepIsProceedToNext && (
                            <FormInput name="formStepShouldPerfomerConfirmView">
                                <>
                                    <input
                                        type="checkbox"
                                        name="beffaringStepShouldPerfomerConfirmView"
                                        defaultChecked={false}
                                    />
                                    Czy następny użytkownik musi potwierdzić
                                    przeglądanie zmiany.
                                </>
                            </FormInput>
                        )} */}
                        <input type="submit" value="Zapisz" />
                    </form>
                </FormStyled>
            </CreateFormStyled>
        </div>
    )
}

export default CreateForm
