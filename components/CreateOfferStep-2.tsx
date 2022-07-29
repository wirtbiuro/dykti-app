import React, {
    SyntheticEvent,
    useRef,
    useEffect,
    useState,
    FC,
    useMemo,
} from 'react'
import { FormStyled, CreateFormStyled } from '../styles/styled-components'
import {
    IOrder,
    WithValueNFocus,
    PropNames,
    IWithOrder,
    StepType,
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import Calendar from './Calendar'
import { DateTime } from 'luxon'
import FormInput from './UI/FormInput'
import { Modal } from 'antd'
import { showErrorFormModal } from '../utilities'
import CalendarWithHours from './CalendarWithHours'
import { flushSync } from 'react-dom'

interface AuxFields {
    offerHours: number | 'hh'
    offerMinutes: number | 'mm'
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

    //error message fields
    const [offerHoursErr, setOfferHoursErr] = useState<HTMLDivElement | null>()

    const [offerDate, setOfferDate] = useState<DateTime>(DateTime.now())

    const offerDateShowHook = useState<boolean>(false)

    const offerCurrentDateRef = useRef('')

    const formCheck: (
        target: EventTarget & WithValueNFocus<FormFields>,
        showMessage?: boolean
    ) => boolean = (target, showMessage = false) => {
        if (target === null) return false

        if (
            target.offerStepAreBefDocsGood &&
            (target.offerHours?.value === 'hh' ||
                target.offerMinutes?.value === 'mm')
        ) {
            if (showMessage) {
                showErrorFormModal({
                    element: target.offerHours as HTMLInputElement,
                    errElement: offerHoursErr!,
                    modal: Modal,
                    onOk: () => {
                        const hours = target.offerHours as HTMLInputElement
                        const minutes = target.offerMinutes as HTMLInputElement
                        flushSync(() => {
                            offerDateShowHook[1](true)
                        })
                        hours.value === 'hh' ? hours.focus() : minutes.focus()
                        offerHoursErr!.innerHTML = 'określ czas'
                    },
                })
            }
            return false
        }

        return true
    }

    const formChanged = (e: SyntheticEvent<HTMLFormElement>) => {
        const target = e.target as HTMLFormElement
        const name = target.name as Names
        switch (name) {
            case 'offerHours':
            case 'offerMinutes':
                offerHoursErr!.innerHTML = ''
        }
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        console.log('submit')

        const target = e.target as typeof e.target & FormType

        if (!target.uncompleteSave?.checked && !formCheck(target, true)) return

        console.log('Submit Form')

        const _createOrder = createOrder as (data: FieldsToSend) => void
        const _offerDate =
            formRef.current?.offerHours !== undefined &&
            formRef.current?.offerMinutes !== undefined &&
            formRef.current?.offerHours?.value !== 'hh' &&
            formRef.current?.offerMinutes?.value !== 'mm'
                ? DateTime.fromObject({
                      year: offerDate.year,
                      month: offerDate.month,
                      day: offerDate.day,
                      hour: Number(formRef.current?.offerHours?.value),
                      minute: Number(formRef.current?.offerMinutes?.value),
                  })
                : undefined

        const data: FieldsToSend = {
            offerStepAreBefDocsGood: target.offerStepAreBefDocsGood?.checked,
            offerStepBefComments: target.offerStepBefComments?.value?.trim(),
            offerStepOfferDate: _offerDate,
            offerStepComment: target.offerStepComment?.value?.trim(),

            offerStepIsCompleted: !order?.steps[order.steps.length - 1]
                .offerStepIsProceedToNext
                ? target.offerStepIsCompleted?.checked
                : formCheck(target),
            offerStepShouldPerfomerConfirmView: order?.steps[
                order.steps.length - 1
            ].offerStepIsProceedToNext
                ? target.offerStepShouldPerfomerConfirmView?.checked
                : true,
            offerStepIsProceedToNext:
                !order?.steps[order.steps.length - 1]
                    .offerStepIsProceedToNext ??
                target.offerStepIsCompleted?.checked,

            order,
        }

        console.log({ data })

        _createOrder(data)
    }

    return (
        <div style={{ display: isVisible ? 'block' : 'none' }}>
            <CreateFormStyled>
                {/* <h2>Nowa Sprawa:</h2> */}
                <FormStyled>
                    <form
                        ref={formRef}
                        onChange={formChanged}
                        onSubmit={submit}
                    >
                        <FormInput<Names> name="offerStepAreBefDocsGood">
                            <>
                                <input
                                    type="checkbox"
                                    name="offerStepAreBefDocsGood"
                                    defaultChecked={true}
                                />
                                Czy dokumenty od Befaring Mana są w porządku?
                            </>
                        </FormInput>

                        {!formRef.current?.offerStepAreBefDocsGood?.checked && (
                            <>
                                <p>Co jest nie tak z dokumentami?: </p>
                                <FormInput<Names>
                                    name="offerStepBefComments"
                                    placeholder="Co jest nie tak z dokumentami."
                                    defaultValue={
                                        order?.steps[order.steps.length - 1]
                                            .offerStepBefComments
                                    }
                                />
                            </>
                        )}

                        <p>Data oferty: </p>
                        <CalendarWithHours<keyof AuxFields>
                            selectedDate={offerDate}
                            setSelectedDate={setOfferDate}
                            setHoursErr={setOfferHoursErr}
                            hoursName="offerHours"
                            minutesName="offerMinutes"
                            isVisibleHook={offerDateShowHook}
                            currentDateRef={offerCurrentDateRef}
                            defaultDate={
                                order &&
                                order.steps[order.steps.length - 1]
                                    .offerStepOfferDate
                            }
                        />

                        <br />
                        <br />

                        <p>Komentarz: </p>
                        <FormInput<Names>
                            name="offerStepComment"
                            placeholder="komentarz"
                            defaultValue={
                                order?.steps[order.steps.length - 1]
                                    .offerStepComment
                            }
                        />

                        {!order?.steps[order.steps.length - 1]
                            .offerStepIsProceedToNext && (
                            <>
                                <input
                                    type="checkbox"
                                    name="offerStepIsCompleted"
                                    defaultChecked={true}
                                />
                                Skończ i przekaż dalej
                            </>
                        )}
                        {order?.steps[order.steps.length - 1]
                            .offerStepIsProceedToNext &&
                            !formCheck(
                                formRef.current as EventTarget &
                                    WithValueNFocus<FormFields>,
                                false
                            ) && (
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
                            .offerStepIsProceedToNext && (
                            <FormInput<Names> name="offerStepIsProceedToNext">
                                <>
                                    <input
                                        type="checkbox"
                                        name="offerStepShouldPerfomerConfirmView"
                                        defaultChecked={false}
                                    />
                                    Czy następny użytkownik musi potwierdzić
                                    przeglądanie zmiany.
                                </>
                            </FormInput>
                        )}
                        <input type="submit" value="Zapisz" />
                    </form>
                </FormStyled>
            </CreateFormStyled>
        </div>
    )
}

export default CreateForm
