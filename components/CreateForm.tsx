import React, {
    SyntheticEvent,
    useRef,
    FormEvent,
    useEffect,
    useState,
    FC,
    useMemo,
} from 'react'
import { FormStyled, CreateFormStyled } from '../styles/styled-components'
import {
    IQuery,
    IOrder,
    IFormStep,
    EditableTypes,
    WithValueNFocus,
    PropNames,
    ToSendToApi,
    IWithOrder,
} from '../types'
import {
    useCreateUserMutation,
    useGetUserQuery,
    useLoginMutation,
    useCreateOrderMutation,
    useGetCompletedOrdersQuery,
} from '../state/apiSlice'
import Step from './Step'
import Calendar from './Calendar'
import { DateTime } from 'luxon'
import FormInput, { CreateFormFormInput } from './UI/FormInput'
import { Modal } from 'antd'
import { showErrorFormModal } from '../utilities'

type TypedStep = IFormStep

interface AuxFields {
    comment: string
    hours: string
    minutes: string
    isCompleted: boolean
    shouldPerfomerConfirmViewing: boolean
}

type FormFields = EditableTypes<TypedStep> & AuxFields
type FieldsToSend = ToSendToApi<TypedStep>

type FormType = WithValueNFocus<FormFields>

export type Names = PropNames<FormFields>

interface FormElement extends HTMLFormElement {}
interface FormElement extends FormType {}

const CreateForm: FC<IWithOrder> = ({ order }) => {
    console.log({ order })
    const userQueryData = useGetUserQuery()
    const { data: ordersData }: IQuery<IOrder> = useGetCompletedOrdersQuery()
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    //error message fields
    const [nameErr, setNameErr] = useState<HTMLDivElement | null>()
    const [phoneErr, setPhoneErr] = useState<HTMLDivElement | null>()
    const [emailErr, setEmailErr] = useState<HTMLDivElement | null>()
    const [cityErr, setCityErr] = useState<HTMLDivElement | null>()
    const [addressErr, setAddressErr] = useState<HTMLDivElement | null>()
    const [hoursErr, setHoursErr] = useState<HTMLDivElement | null>()

    const [historyOrderId, setHistoryOrderId] = useState<number | null>()

    const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now())

    console.log({ selectedDate })

    const meetingDate = useMemo(() => {
        return (
            order && order.steps[order.steps.length - 1].formStep.meetingDate!
        )
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
        console.log('form check', target.hours.value)

        if (target.clientName?.value?.trim() === '') {
            showErrorFormModal({
                element: target.clientName as HTMLInputElement,
                errElement: nameErr!,
                modal: Modal,
            })
            return false
        }

        if (
            (!order?.id && !target.isCompleted.checked) ||
            (order?.id &&
                !order?.steps[order.steps.length - 1].formStep.record
                    .isCompleted)
        ) {
            return true
        }

        if (
            target.phone?.value?.trim() === '' &&
            target.email?.value?.trim() === ''
        ) {
            showErrorFormModal({
                element: target.phone as HTMLInputElement,
                errElement: phoneErr!,
                modal: Modal,
                onOk: () => {
                    const phone = target.phone as HTMLInputElement
                    phone.focus()
                    phoneErr!.innerHTML = 'Telefon chy E-mail'
                    emailErr!.innerHTML = 'Telefon chy E-mail'
                },
            })
            return false
        }

        if (target.city?.value?.trim() === '') {
            showErrorFormModal({
                element: target.city as HTMLInputElement,
                errElement: cityErr!,
                modal: Modal,
            })
            return false
        }

        if (target.address?.value?.trim() === '') {
            showErrorFormModal({
                element: target.address as HTMLInputElement,
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
            case 'clientName':
                nameErr!.innerHTML = ''
            case 'phone':
            case 'email':
                phoneErr!.innerHTML = ''
                emailErr!.innerHTML = ''
            case 'city':
                cityErr!.innerHTML = ''
            case 'address':
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
        console.log(target.address)
        console.log(target.hours?.value)
        console.log(target.comment?.value)

        const _createOrder = createOrder as (data: FieldsToSend) => void

        const _selectedDate =
            formRef.current?.hours.value !== 'hh' &&
            formRef.current?.hours.value !== 'mm'
                ? DateTime.fromObject({
                      year: selectedDate.year,
                      month: selectedDate.month,
                      day: selectedDate.day,
                      hour: Number(formRef.current?.hours.value),
                      minute: Number(formRef.current?.minutes.value),
                  })
                : undefined

        const data: FieldsToSend = {
            comment: target.comment.value.trim(),
            address: target.address?.value?.trim(),
            city: target.city?.value?.trim(),
            clientName: target.clientName?.value?.trim(),
            whereClientFound: target.whereClientFound?.value?.trim(),
            email: target.email?.value?.trim(),
            phone: target.phone?.value?.trim(),
            isCompleted: order ? true : target.isCompleted.checked,
            shouldPerfomerConfirmViewing: order
                ? target.shouldPerfomerConfirmViewing.checked
                : true,
            meetingDate: _selectedDate,
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
                    <CreateFormFormInput
                        name="clientName"
                        placeholder="imię i nazwisko klienta"
                        setErr={setNameErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStep
                                .clientName
                        }
                    />
                    <CreateFormFormInput
                        name="phone"
                        placeholder="Numer kontaktowy"
                        setErr={setPhoneErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStep.phone
                        }
                    />
                    <CreateFormFormInput
                        name="email"
                        placeholder="E-mail"
                        setErr={setEmailErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStep.email
                        }
                    />
                    <p>Adres zamówienia: </p>
                    <CreateFormFormInput
                        name="city"
                        placeholder="Miasto"
                        setErr={setCityErr}
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStep.city
                        }
                    />
                    <CreateFormFormInput
                        setErr={setAddressErr}
                        name="address"
                        placeholder="Adres obiektu"
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStep
                                .address
                        }
                    />
                    <p>Gdzie znaleziono klienta: </p>
                    <CreateFormFormInput
                        name="whereClientFound"
                        placeholder="Gdzie znaleziono klienta"
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStep
                                .whereClientFound
                        }
                    />
                    <p>Czas spotkania:</p>
                    <Calendar
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                    <FormInput name="hoursAndMinutes" setErr={setHoursErr}>
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
                    <CreateFormFormInput
                        name="comment"
                        placeholder="komentarz"
                        defaultValue={
                            order?.steps[order.steps.length - 1].formStep.record
                                .comment
                        }
                    />
                    {!order && (
                        <>
                            <input type="checkbox" name="isCompleted" />
                            Skończ i przekaż dalej
                        </>
                    )}
                    {order && (
                        <CreateFormFormInput name="shouldPerfomerConfirmViewing">
                            <>
                                <input
                                    type="checkbox"
                                    name="shouldPerfomerConfirmViewing"
                                />
                                Czy następny użytkownik musi potwierdzić
                                przeglądanie zmiany.
                            </>
                        </CreateFormFormInput>
                    )}
                    <input type="submit" value="Zapisz" />
                </form>
            </FormStyled>

            <h2>Przekazane dalej:</h2>

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
