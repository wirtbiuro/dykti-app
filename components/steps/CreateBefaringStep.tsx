import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import {
    IOrder,
    WithValueNFocus,
    IWithOrder,
    StepType,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
} from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, getMaxPromotion, showErrorMessages } from '../../utilities'
import { DateTime } from 'luxon'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import { useCalendarData } from '../../hooks/useCalendarData'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'

type FieldsToSend = StepType & {
    order?: IOrder
}
type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateForm: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const prevStep = order?.steps[order.steps.length - 1]

    const meetingDateData = useCalendarData()
    const docsSendDateData = useCalendarData()
    const offerDateData = useCalendarData()

    const wasThereMeeting = useFormInput()
    const commentData = useFormInput()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        const meetingDate = meetingDateData.value as DateTime
        offerDateData.setValue && offerDateData.setValue(meetingDate?.endOf('day').plus({ days: 7 }))
    }, [meetingDateData.value])

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [meetingDateData.isChecked, wasThereMeeting.isChecked, docsSendDateData.isChecked, offerDateData.isChecked])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!meetingDateData.isChecked) {
            console.log('meeting date error')
            showMessage ? meetingDateData?.showError!() : null
            return setIsFormChecked(false)
        }
        if (!wasThereMeeting.isChecked) {
            console.log('was there meeting error')
            showMessage ? wasThereMeeting?.showError!() : null
            return setIsFormChecked(false)
        }
        if (!docsSendDateData.isChecked) {
            console.log('docs send date error')
            showMessage ? docsSendDateData?.showError!() : null
            return setIsFormChecked(false)
        }
        if (!offerDateData.isChecked) {
            console.log('offer date error')
            showMessage ? offerDateData?.showError!() : null
            return setIsFormChecked(false)
        }

        console.log('form checked')

        return setIsFormChecked(true)
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log(target)

        // const isUncompletedChecked =
        //     (target.uncompleteCheckbox !== undefined && target.uncompleteCheckbox.checked) ||
        //     (target.nextCheckbox !== undefined && !target.nextCheckbox.checked) ||
        //     flushSync(() => {
        //         formCheck({ showMessage: !isUncompletedChecked })
        //     })

        // if (!isFormChecked && !isUncompletedChecked) {
        //     return
        // }

        const isMainCondition = true

        const areErrors = showErrorMessages({
            flushSync,
            formCheck,
            isFormChecked,
            isMainCondition,
            target,
        })

        console.log('submit')

        if (areErrors) return

        setIsSpinning(true)

        await submitForm({
            userId: userData.id,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'beffaringStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            toNextSendData: {
                order,
                formStepMeetingDate: meetingDateData.isChecked ? meetingDateData.value : null,
                beffaringStepWasThereMeeting: wasThereMeeting.value,
                beffaringStepDocsSendDate: docsSendDateData.isChecked ? docsSendDateData.value : null,
                beffaringStepOfferDate: offerDateData.isChecked ? offerDateData.value : null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsSpinning(false)
        setIsVisible!(false)
    }

    return (
        <Spin spinning={isSpinning}>
            {' '}
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            <p>Termin spotkania: </p>

                            <CalendarWithTime
                                defaultDate={order && prevStep?.formStepMeetingDate}
                                connection={meetingDateData}
                            />
                            {meetingDateData?.check !== undefined && meetingDateData?.isChecked && (
                                <FormInput
                                    type="checkbox"
                                    connection={wasThereMeeting}
                                    defaultChecked={
                                        typeof prevStep?.beffaringStepWasThereMeeting === 'boolean'
                                            ? prevStep?.beffaringStepWasThereMeeting
                                            : false
                                    }
                                    checkFn={(value) => value as boolean}
                                >
                                    <>Spotkanie sie odbyło</>
                                </FormInput>
                            )}

                            {wasThereMeeting.value && meetingDateData.isChecked && (
                                <>
                                    <br />
                                    <br />
                                    <p>Data wysłania dokumentów, zdjęć: </p>

                                    <CalendarWithTime
                                        defaultDate={order && prevStep?.beffaringStepDocsSendDate}
                                        connection={docsSendDateData}
                                        isTimeEnabled={false}
                                    />

                                    <br />
                                    <br />
                                    <p>Kiedy należy przygotować ofertę?</p>

                                    <CalendarWithTime
                                        defaultDate={
                                            (order && prevStep?.beffaringStepOfferDate) ||
                                            meetingDateData.value?.endOf('day').plus({ days: 7 })
                                        }
                                        connection={offerDateData}
                                        isTimeEnabled={false}
                                    />
                                </>
                            )}

                            <p>Komentarz: </p>
                            <FormInput
                                placeholder="komentarz"
                                defaultValue={prevStep?.beffaringStepComment}
                                connection={commentData}
                            />

                            <SendButtons
                                curStepName="beffaringStep"
                                passedTo={prevStep!.passedTo}
                                maxPromotion={prevStep!.maxPromotion}
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
        </Spin>
    )
}

export default CreateForm
