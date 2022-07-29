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
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import FormInput from './UI/FormInput'
import CalendarWithTime from './CalendarWithTime'
import SendButtons from './UI/SendButtons'
import { getOrderStatus } from '../utilities'

interface AuxFields {
    nextCheckbox: boolean
    prevCheckbox: boolean
    uncompleteCheckbox: boolean
    confirmCheckbox: boolean
}
type FieldsToSend = StepType & {
    order?: IOrder
}
type FormType = WithValueNFocus<AuxFields>
type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const areDocsGoodDataRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {},
        getErrTitleElement: () => {},
    })

    const befCommentsRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {},
        getErrTitleElement: () => {},
    })

    const commentDataRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {},
        getErrTitleElement: () => {},
    })

    const offerDateOutputRef = useRef<IOutputRef>({
        check: () => {},
        getValue: () => {},
        showError: () => {
            console.log('default offerDateOutputRef')
        },
        getErrTitleElement: () => {},
    })

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    const [areDocsGood, setAreDocsGood] = useState<boolean>(
        typeof prevStep?.offerStepAreBefDocsGood === 'boolean'
            ? prevStep?.offerStepAreBefDocsGood
            : true
    )

    const {
        isCurrent,
        isEdit,
        isProceedToNext,
        isProceedToEdit,
    } = getOrderStatus({
        curStepName: 'offerStep',
        prevStepName: 'beffaringStep',
        step: prevStep,
    })

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!offerDateOutputRef.current?.check()) {
            showMessage ? offerDateOutputRef.current?.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (!befCommentsRef.current?.check()) {
            showMessage ? befCommentsRef.current?.showError() : null
            return setIsPrevFormChecked(false)
        }

        console.log('prev form checked')

        return setIsPrevFormChecked(true)
    }

    const formChanged = (e: SyntheticEvent<HTMLFormElement>) => {
        setAreDocsGood(areDocsGoodDataRef.current.getValue()) //Check the main condition
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        areDocsGood ? submitToNext(target) : submitToPrev(target)
    }

    const submitToNext = async (
        target: EventTarget & WithValueNFocus<AuxFields>
    ) => {
        console.log('submit to next')
        if (
            (isCurrent || isEdit) &&
            target.nextCheckbox.checked &&
            !isFormChecked
        ) {
            return formCheck({ showMessage: true })
        }

        if (
            (isProceedToNext || isProceedToEdit) &&
            !target.uncompleteCheckbox?.checked &&
            !isFormChecked
        ) {
            return formCheck({ showMessage: true })
        }

        console.log('Submit Form')

        const _createOrder = createOrder as (data: FieldsToSend) => void

        const data: FieldsToSend = {
            order,
            offerStepAreBefDocsGood: true,
            offerStepOfferDate:
                offerDateOutputRef.current.check() === true
                    ? offerDateOutputRef.current.getValue()
                    : null,
            offerStepComment: commentDataRef.current.getValue(),
            offerStepBefComments: null,
            ...sendButtonsOutputRef.current.getResults(),
        }

        console.log({ data })
        _createOrder(data)
    }

    const submitToPrev = async (
        target: EventTarget & WithValueNFocus<AuxFields>
    ) => {
        console.log('submit to prev')
        if (
            (isCurrent || isEdit) &&
            target.prevCheckbox.checked &&
            !isPrevFormChecked
        ) {
            return prevFormCheck({ showMessage: true })
        }

        if (
            (isProceedToNext || isProceedToEdit) &&
            !target.uncompleteCheckbox?.checked &&
            !isPrevFormChecked
        ) {
            return prevFormCheck({ showMessage: true })
        }

        console.log('Submit Form to prev')

        const _createOrder = createOrder as (data: FieldsToSend) => void

        const data: FieldsToSend = {
            order,
            offerStepAreBefDocsGood: false,
            offerStepOfferDate: null,
            offerStepComment: null,
            offerStepBefComments: befCommentsRef.current.getValue(),
            ...sendButtonsOutputRef.current.getResults(),
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
                        <FormInput
                            type="checkbox"
                            dataRef={areDocsGoodDataRef}
                            defaultChecked={
                                typeof prevStep?.offerStepAreBefDocsGood ===
                                'boolean'
                                    ? prevStep?.offerStepAreBefDocsGood
                                    : true
                            }
                        >
                            <>Czy dokumenty od Befaring Mana są w porządku?</>
                        </FormInput>
                        {!areDocsGood && (
                            <>
                                <p>Co jest nie tak z dokumentami?: </p>
                                <FormInput
                                    placeholder="Co jest nie tak z dokumentami."
                                    defaultValue={
                                        prevStep?.offerStepBefComments
                                    }
                                    dataRef={befCommentsRef}
                                />
                            </>
                        )}
                        {areDocsGood && (
                            <>
                                <p>Data oferty: </p>
                                <CalendarWithTime
                                    defaultDate={
                                        order && prevStep?.offerStepOfferDate
                                    }
                                    dataRef={offerDateOutputRef}
                                />
                                <br />
                                <br />
                                <p>Komentarz: </p>
                                <FormInput
                                    placeholder="komentarz"
                                    defaultValue={prevStep?.offerStepComment}
                                    dataRef={commentDataRef}
                                />
                            </>
                        )}
                        <SendButtons
                            curStepName="offerStep"
                            prevStepName="beffaringStep"
                            dataRef={sendButtonsOutputRef}
                            isFormChecked={isFormChecked}
                            step={order?.steps[order.steps.length - 1]}
                            formCheck={formCheck}
                            isMainConditon={areDocsGood}
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

export default CreateForm
