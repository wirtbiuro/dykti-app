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

interface AuxFields {
    hours: number | 'hh'
    minutes: number | 'mm'
}

type FormFields = StepType & AuxFields
type FieldsToSend = StepType & {
    order?: IOrder
}

type FormType = WithValueNFocus<FormFields>

export type Names = PropNames<FormFields>

type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    //error message fields
    const [nameErr, setNameErr] = useState<HTMLDivElement | null>()
    const [phoneErr, setPhoneErr] = useState<HTMLDivElement | null>()
    const [emailErr, setEmailErr] = useState<HTMLDivElement | null>()
    const [cityErr, setCityErr] = useState<HTMLDivElement | null>()
    const [addressErr, setAddressErr] = useState<HTMLDivElement | null>()
    const [hoursErr, setHoursErr] = useState<HTMLDivElement | null>()

    const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now())

    const meetingDate = useMemo(() => {
        return order && order.steps[order.steps.length - 1].formStepMeetingDate
    }, [order])

    const defaultDate = useMemo(() => {
        return order && meetingDate
            ? DateTime.fromISO(meetingDate as string)
            : null
    }, [order, meetingDate])

    const defaultMinutes = defaultDate ? defaultDate.minute : 'mm'
    const defaultHours = defaultDate ? defaultDate.hour : 'hh'

    useEffect(() => {
        if (order && defaultDate) {
            setSelectedDate(defaultDate)
        }
    }, [order, defaultDate])

    const formCheck: (
        target: EventTarget & WithValueNFocus<FormFields>
    ) => boolean = (target) => {
        if (target.formStepClientName?.value?.trim() === '') {
            showErrorFormModal({
                element: target.formStepClientName as HTMLInputElement,
                errElement: nameErr!,
                modal: Modal,
            })
            return false
        }

        if (
            (!order?.id && !target.formStepIsCompleted?.checked) ||
            (order?.id &&
                !order?.steps[order.steps.length - 1].formStepIsCompleted)
        ) {
            return true
        }

        if (
            target.formStepPhone?.value?.trim() === '' &&
            target.formStepEmail?.value?.trim() === ''
        ) {
            showErrorFormModal({
                element: target.formStepPhone as HTMLInputElement,
                errElement: phoneErr!,
                modal: Modal,
                onOk: () => {
                    const phone = target.formStepPhone as HTMLInputElement
                    phone.focus()
                    phoneErr!.innerHTML = 'Telefon chy E-mail'
                    emailErr!.innerHTML = 'Telefon chy E-mail'
                },
            })
            return false
        }

        if (target.formStepCity?.value?.trim() === '') {
            showErrorFormModal({
                element: target.formStepCity as HTMLInputElement,
                errElement: cityErr!,
                modal: Modal,
            })
            return false
        }

        if (target.formStepAddress?.value?.trim() === '') {
            showErrorFormModal({
                element: target.formStepAddress as HTMLInputElement,
                errElement: addressErr!,
                modal: Modal,
            })
            return false
        }

        if (target.hours?.value === 'hh' || target.minutes.value === 'mm') {
            showErrorFormModal({
                element: target.hours as HTMLInputElement,
                errElement: hoursErr!,
                modal: Modal,
                onOk: () => {
                    const hours = target.hours as HTMLInputElement
                    const minutes = target.minutes as HTMLInputElement
                    hours.value === 'hh' ? hours.focus() : minutes.focus()
                    hoursErr!.innerHTML = 'określ czas'
                },
            })
            return false
        }

        return true
    }

    const formChanged = (e: SyntheticEvent<HTMLFormElement>) => {
        const target = e.target as HTMLFormElement
        const name = target.name as Names
        switch (name) {
            case 'formStepClientName':
                nameErr!.innerHTML = ''
            case 'formStepPhone':
            case 'formStepEmail':
                phoneErr!.innerHTML = ''
                emailErr!.innerHTML = ''
            case 'formStepCity':
                cityErr!.innerHTML = ''
            case 'formStepAddress':
                addressErr!.innerHTML = ''
            case 'hours':
            case 'minutes':
                hoursErr!.innerHTML = ''
        }
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        console.log({ order })

        const target = e.target as typeof e.target & FormType

        if (!formCheck(target)) return

        console.log('Submit Form')

        const _createOrder = createOrder as (data: FieldsToSend) => void

        const _selectedDate =
            formRef.current?.hours.value !== 'hh' &&
            formRef.current?.minutes.value !== 'mm'
                ? DateTime.fromObject({
                      year: selectedDate.year,
                      month: selectedDate.month,
                      day: selectedDate.day,
                      hour: Number(formRef.current?.hours.value),
                      minute: Number(formRef.current?.minutes.value),
                  })
                : undefined

        const data: FieldsToSend = {
            formStepComment: target.formStepComment?.value?.trim(),
            formStepAddress: target.formStepAddress?.value?.trim(),
            formStepCity: target.formStepCity?.value?.trim(),
            formStepClientName: target.formStepClientName?.value?.trim(),
            formStepWhereClientFound: target.formStepWhereClientFound?.value?.trim(),
            formStepEmail: target.formStepEmail?.value?.trim(),
            formStepPhone: target.formStepPhone?.value?.trim(),
            formStepIsCompleted: target.formStepIsCompleted?.checked,
            formStepShouldPerfomerConfirmView:
                target.formStepShouldPerfomerConfirmView?.checked,
            formStepMeetingDate: _selectedDate,
            order,
        }

        _createOrder(data)

        // target.clientInfo.value = ''
        // target.whereClientFound.value = ''
        // target.comment.value = ''
    }

    return (
        <CreateFormStyled>
            <h2>Nowa Sprawa:</h2>
            <FormStyled>
                <form onSubmit={submit} ref={formRef} onChange={formChanged}>
                    <p>Informacja klientów: </p>
                    <FormInput
                        name="formStepClientName"
                        placeholder="imię i nazwisko klienta"
                        // setErr={setNameErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1]
                                .formStepClientName
                        }
                    />
                    <FormInput
                        name="formStepPhone"
                        placeholder="Numer kontaktowy"
                        // setErr={setPhoneErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStepPhone
                        }
                    />
                    <FormInput
                        name="formStepEmail"
                        placeholder="E-mail"
                        // setErr={setEmailErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStepEmail
                        }
                    />
                    <p>Adres zamówienia: </p>
                    <FormInput
                        name="formStepCity"
                        placeholder="Miasto"
                        // setErr={setCityErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStepCity
                        }
                    />
                    <FormInput
                        // setErr={setAddressErr}
                        name="formStepAddress"
                        placeholder="Adres obiektu"
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStepAddress
                        }
                    />
                    <p>Gdzie znaleziono klienta: </p>
                    <FormInput
                        name="formStepWhereClientFound"
                        placeholder="Gdzie znaleziono klienta"
                        defaultValue={
                            order?.steps[order.steps.length - 1]
                                .formStepWhereClientFound
                        }
                    />
                    <p>Czas spotkania:</p>
                    <Calendar
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                    <FormInput
                        name="hoursAndMinutes"
                        // setErr={setHoursErr}
                    >
                        <>
                            <select name="hours" defaultValue={defaultHours}>
                                <option>hh</option>
                                <option value={7}>07</option>
                                <option value={8}>08</option>
                                <option value={9}>09</option>
                                <option value={10}>10</option>
                                <option value={11}>11</option>
                                <option value={12}>12</option>
                                <option value={13}>13</option>
                                <option value={14}>14</option>
                                <option value={15}>15</option>
                                <option value={16}>16</option>
                                <option value={17}>17</option>
                                <option value={18}>18</option>
                                <option value={19}>19</option>
                                <option value={20}>20</option>
                                <option value={21}>21</option>
                            </select>
                            <select
                                name="minutes"
                                defaultValue={defaultMinutes}
                            >
                                <option>mm</option>
                                <option value={0}>00</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={40}>40</option>
                                <option value={50}>50</option>
                            </select>
                        </>
                    </FormInput>
                    <p>Komentarz: </p>
                    <FormInput
                        name="formStepComment"
                        placeholder="komentarz"
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStepComment
                        }
                    />
                    {!order && (
                        <>
                            <input
                                type="checkbox"
                                name="formStepIsCompleted"
                                defaultChecked={true}
                            />
                            Skończ i przekaż dalej
                        </>
                    )}
                    {order && (
                        <FormInput name="formStepShouldPerfomerConfirmView">
                            <>
                                <input
                                    type="checkbox"
                                    name="formStepShouldPerfomerConfirmView"
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

            {/* <h2>Przekazane dalej:</h2> */}

            {/* {ordersData && (
                <OrderStyled>
                    {ordersData.map((order) => {
                        const step = order.steps[order.steps.length - 1]
                        return (
                            <StepStyled key={order.id}>
                                <Step step={step} />
                                {historyOrderId !== order.id && (
                                    <button
                                        onClick={() =>
                                            setHistoryOrderId(order.id)
                                        }
                                    >
                                        Pokaż historię zmian
                                    </button>
                                )}
                                {historyOrderId === order.id && (
                                    <button
                                        onClick={() => setHistoryOrderId(null)}
                                    >
                                        Zamknij historię zmian
                                    </button>
                                )}
                                {historyOrderId === order.id && (
                                    <div>
                                        Zmiany:
                                        {order.steps.map((step) => (
                                            <Step key={step.id} step={step} />
                                        ))}
                                    </div>
                                )}
                            </StepStyled>
                        )
                    })}
                </OrderStyled>
            )} */}
        </CreateFormStyled>
    )
}

export default CreateForm
