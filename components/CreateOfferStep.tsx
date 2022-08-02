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

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible }) => {
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

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    const [areDocsGood, setAreDocsGood] = useState<boolean>(
        typeof prevStep?.offerStepAreBefDocsGood === 'boolean'
            ? prevStep?.offerStepAreBefDocsGood
            : true
    )

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
        console.log('formChanged')
        setAreDocsGood(areDocsGoodDataRef.current.getValue()) //Check the main condition
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        submitForm({
            target,
            isMainCondition: areDocsGood,
            curStepName: 'offerStep',
            prevStepName: 'beffaringStep',
            step: prevStep!,
            formCheck,
            prevFormCheck,
            isPrevFormChecked,
            isFormChecked,
            toPrevSendData: {
                order,
                offerStepAreBefDocsGood: false,
                offerStepOfferDate: null,
                offerStepComment: null,
                offerStepBefComments: befCommentsRef.current.getValue(),
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                offerStepAreBefDocsGood: true,
                offerStepOfferDate:
                    offerDateOutputRef.current.check() === true
                        ? offerDateOutputRef.current.getValue()
                        : null,
                offerStepComment: commentDataRef.current.getValue(),
                offerStepBefComments: null,
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
                                    isTimeEnabled={true}
                                    formChanged={formChanged}
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
