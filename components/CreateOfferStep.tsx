import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
    FieldsToSend,
} from '../types'
import { useCreateOrderMutation } from '../state/apiSlice'
import FormInput from './UI/FormInput'
import CalendarWithTime from './CalendarWithTime'
import SendButtons from './UI/SendButtons'
import { submitForm } from '../utilities'
import { useFormInput } from '../hooks/useFormInput'
import { useCalendarData } from '../hooks/useCalendarData'
import { flushSync } from 'react-dom'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const areDocsGoodData = useFormInput()
    const befCommentsData = useFormInput()
    const commentData = useFormInput()
    const offerDateData = useCalendarData()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [offerDateData.isChecked, befCommentsData.isChecked])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!offerDateData.isChecked) {
            console.log('offer date error')
            showMessage ? offerDateData?.showError() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (!befCommentsData.isChecked) {
            showMessage ? befCommentsData.showError() : null
            return setIsPrevFormChecked(false)
        }

        console.log('prev form checked')

        return setIsPrevFormChecked(true)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        flushSync(() => {
            formCheck({
                showMessage: !target.uncompleteCheckbox?.checked,
            })
        })

        if (!isFormChecked && !target.uncompleteCheckbox?.checked) {
            return
        }

        console.log('submit')

        submitForm({
            target,
            isMainCondition: areDocsGoodData.isChecked,
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
                offerStepBefComments: befCommentsData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                offerStepAreBefDocsGood: true,
                offerStepOfferDate: offerDateData.value,
                offerStepComment: commentData.value,
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
                    <form ref={formRef} onSubmit={submit}>
                        <FormInput
                            type="checkbox"
                            connection={areDocsGoodData}
                            defaultChecked={
                                typeof prevStep?.offerStepAreBefDocsGood ===
                                'boolean'
                                    ? prevStep?.offerStepAreBefDocsGood
                                    : true
                            }
                            checkFn={(value: boolean) => value === true}
                        >
                            <>Czy dokumenty od Befaring Mana są w porządku?</>
                        </FormInput>
                        {!areDocsGoodData.isChecked && (
                            <>
                                <p>Co jest nie tak z dokumentami?: </p>
                                <FormInput
                                    placeholder="Co jest nie tak z dokumentami."
                                    defaultValue={
                                        prevStep?.offerStepBefComments
                                    }
                                    connection={befCommentsData}
                                />
                            </>
                        )}
                        {areDocsGoodData.isChecked && (
                            <>
                                <p>Data oferty: </p>
                                <CalendarWithTime
                                    defaultDate={
                                        order && prevStep?.offerStepOfferDate
                                    }
                                    connection={offerDateData}
                                    isTimeEnabled={true}
                                />
                                <br />
                                <br />
                                <p>Komentarz: </p>
                                <FormInput
                                    placeholder="komentarz"
                                    defaultValue={prevStep?.offerStepComment}
                                    connection={commentData}
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
                            isMainCondition={areDocsGoodData.isChecked}
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
