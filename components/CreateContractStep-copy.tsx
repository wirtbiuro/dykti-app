import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    IOutputRef,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
    FieldsToSend,
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import FormInput from './UI/FormInput'
import CalendarWithTime from './CalendarWithTime'
import SendButtons from './UI/SendButtons'
import { getOrderStatus, submitForm, initOutputRef } from '../utilities'
import { flushSync } from 'react-dom'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractStep: FC<IWithOrder> = ({ order, isVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const areDocsGoodDataRef = useRef<IOutputRef>(initOutputRef())
    const befCommentsRef = useRef<IOutputRef>(initOutputRef())
    const commentDataRef = useRef<IOutputRef>(initOutputRef())
    const offerDateOutputRef = useRef<IOutputRef>(initOutputRef())

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const areOfferChangesRef = useRef<IOutputRef>(initOutputRef())
    const offerChangesRef = useRef<IOutputRef>(initOutputRef())
    const isOfferAcceptedRef = useRef<IOutputRef>(initOutputRef())
    const contractDateOutputRef = useRef<IOutputRef>(initOutputRef())
    const rejectionRef = useRef<HTMLSelectElement>(null)
    const otherRejectionRef = useRef<IOutputRef>(initOutputRef())

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)
    const [isOtherRejection, setIsOtherRejection] = useState<boolean>(false)

    const [areOfferChanges, setAreOfferChanges] = useState<boolean>(
        typeof prevStep?.contractStepAreOfferChanges === 'boolean'
            ? prevStep?.contractStepAreOfferChanges
            : false
    )

    const [isOfferAccepted, setIsOfferAccepted] = useState<boolean>(
        typeof prevStep?.contractStepIsOfferAccepted === 'boolean'
            ? prevStep?.contractStepIsOfferAccepted
            : false
    )

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!offerDateOutputRef.current?.check()) {
            showMessage ? offerDateOutputRef.current?.showError() : null
            return setIsFormChecked(false)
        }

        if (!areOfferChangesRef.current?.check()) {
            showMessage ? areOfferChangesRef.current?.showError() : null
            return setIsFormChecked(false)
        }

        if (!contractDateOutputRef.current?.check()) {
            showMessage ? contractDateOutputRef.current?.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (!offerChangesRef.current?.check()) {
            showMessage ? offerChangesRef.current?.showError() : null
            return setIsPrevFormChecked(false)
        }

        console.log('prev form checked')

        return setIsPrevFormChecked(true)
    }

    const formChanged = (e: SyntheticEvent<HTMLFormElement>) => {
        console.log('formChanged')
        setIsOfferAccepted(isOfferAcceptedRef.current.getValue())
        setAreOfferChanges(areOfferChangesRef.current.getValue())

        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        submitForm({
            target,
            isMainCondition: !areOfferChanges,
            curStepName: 'contractStep',
            prevStepName: 'offerStep',
            step: prevStep!,
            formCheck,
            prevFormCheck,
            isPrevFormChecked,
            isFormChecked,
            toPrevSendData: {
                order,
                contractStepAreOfferChanges: true,
                offerStepOfferDate: null,
                offerStepComment: null,
                offerStepBefComments: befCommentsRef.current.getValue(),
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                contractStepAreOfferChanges: false,
                contractStepOfferSendingDate:
                    offerDateOutputRef.current.check() === true
                        ? offerDateOutputRef.current.getValue()
                        : null,
                contractStepIsOfferAccepted: isOfferAcceptedRef.current.getValue(),
                offerStepComment: isOfferAcceptedRef.current.getValue(),
                offerStepBefComments: null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
        })
    }

    const standardRejValues = ['price', 'date']
    const defaultRejectionValue = prevStep?.contractStepOfferRejectionReason
        ? standardRejValues.includes(prevStep?.contractStepOfferRejectionReason)
            ? prevStep?.contractStepOfferRejectionReason
            : 'other'
        : 'select'

    const onChangeSelectRejection = () => {
        setIsOtherRejection(rejectionRef.current!.value === 'other')
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
                        <>
                            <p>Data wysłania oferty: </p>
                            <CalendarWithTime
                                defaultDate={
                                    order &&
                                    prevStep?.contractStepOfferSendingDate
                                }
                                dataRef={offerDateOutputRef}
                                isTimeEnabled={false}
                                formChanged={formChanged}
                            />
                        </>

                        <FormInput
                            type="checkbox"
                            dataRef={areOfferChangesRef}
                            defaultChecked={
                                typeof prevStep?.contractStepAreOfferChanges ===
                                'boolean'
                                    ? prevStep?.contractStepAreOfferChanges
                                    : false
                            }
                        >
                            <>Czy oferta potrzebuje zmian?</>
                        </FormInput>
                        {areOfferChanges && (
                            <>
                                <p>Zmiany w ofercie: </p>
                                <FormInput
                                    placeholder="Jakich zmian wymaga oferta?"
                                    defaultValue={
                                        prevStep?.contractStepOfferChangesComment
                                    }
                                    dataRef={offerChangesRef}
                                />
                            </>
                        )}
                        {!areOfferChanges && (
                            <>
                                <FormInput
                                    type="checkbox"
                                    dataRef={isOfferAcceptedRef}
                                    defaultChecked={
                                        typeof prevStep?.contractStepIsOfferAccepted ===
                                        'boolean'
                                            ? prevStep?.contractStepIsOfferAccepted
                                            : false
                                    }
                                >
                                    <>Czy klient przyjął ofertę?</>
                                </FormInput>

                                {isOfferAccepted && (
                                    <>
                                        <p>Data zawarcia umowy: </p>
                                        <CalendarWithTime
                                            defaultDate={
                                                order &&
                                                prevStep?.contractStepContractDate
                                            }
                                            dataRef={contractDateOutputRef}
                                            isTimeEnabled={false}
                                            formChanged={formChanged}
                                        />
                                    </>
                                )}

                                {!isOfferAccepted && (
                                    <>
                                        <p>Przyczyna odrzucenia oferty: </p>
                                        <select
                                            name="rejectionReasons"
                                            // onChange={changeTime}
                                            ref={rejectionRef}
                                            defaultValue={defaultRejectionValue}
                                            onChange={onChangeSelectRejection}
                                        >
                                            <option value="select">
                                                Wybierz powód odrzucenia oferty
                                            </option>
                                            <option value="price">
                                                Wysoka cena
                                            </option>
                                            <option value="data">Termin</option>
                                            <option value="other">Inny</option>
                                        </select>

                                        {rejectionRef.current?.value ===
                                            'other' && (
                                            <>
                                                <p>
                                                    Inna przyczyna odrzucenia
                                                    oferty:{' '}
                                                </p>
                                                <FormInput
                                                    placeholder="Inna przyczyna odrzucenia oferty"
                                                    defaultValue={
                                                        prevStep?.contractStepOfferRejectionReason
                                                    }
                                                    dataRef={otherRejectionRef}
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        <SendButtons
                            curStepName="offerStep"
                            prevStepName="beffaringStep"
                            dataRef={sendButtonsOutputRef}
                            isFormChecked={isFormChecked}
                            step={order?.steps[order.steps.length - 1]}
                            formCheck={formCheck}
                            isMainConditon={!areOfferChanges}
                            isPrevFormChecked={isPrevFormChecked}
                            prevFormCheck={prevFormCheck}
                        />
                        <input type="submit" value="Zapisz" />
                    </form>
                </FormStyled>
            </CreateFormStyled>
        </div>
    )
}

export default CreateContractStep
