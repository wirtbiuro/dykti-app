import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
    FieldsToSend,
} from '../../types'
import { useCreateOrderMutation } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages } from '../../utilities'
import { useFormInput } from '../../hooks/useFormInput'
import { useCalendarData } from '../../hooks/useCalendarData'
import { flushSync } from 'react-dom'
import FormSelect from '../UI/FormSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const QuestionnaireStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const prevStep = order?.steps[order.steps.length - 1]

    const errFn = useErrFn()

    const isClientSatisfiedData = useFormInput()
    const opinionData = useFormSelect()
    const otherOpinionData = useFormInput()

    const defaultOpinionValue =
        prevStep?.questionnaireStepDissatisfaction ?? prevStep?.questionnaireStepSatisfaction ?? 'select'

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
    }, [isClientSatisfiedData.isChecked, opinionData.isChecked, otherOpinionData.isChecked])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!opinionData.isChecked) {
            console.log('opinionData error')
            showMessage ? opinionData?.showError() : null
            return setIsFormChecked(false)
        }

        if (opinionData.value === 'other' && otherOpinionData.value === '') {
            console.log('otherOpinionData error')
            showMessage ? otherOpinionData?.showError() : null
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
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'completionStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            nextToPass: isClientSatisfiedData.value ? 'referenceStep' : 'completionStep',
            toNextSendData: {
                order,
                questionnaireStepSatisfaction: isClientSatisfiedData.value ? opinionData.value : null,
                questionnaireStepDissatisfaction: !isClientSatisfiedData.value ? opinionData.value : null,
                questionnaireStepOtherOpinion: opinionData.value === 'other' ? otherOpinionData.value : null,
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
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            <>
                                <FormInput
                                    type="checkbox"
                                    connection={isClientSatisfiedData}
                                    defaultChecked={prevStep?.questionnaireStepDissatisfaction ? false : true}
                                >
                                    <>Klient jest zadowolony</>
                                </FormInput>
                            </>

                            <FormSelect
                                options={[
                                    [
                                        'select',
                                        `Wybierz powód ${
                                            isClientSatisfiedData.value ? 'zadowolenia' : 'niezadowolenia'
                                        } klienta`,
                                    ],
                                    ['timeFrame', 'Ramy czasowe'],
                                    ['endDate', 'Data zakonczenia'],
                                    ['other', 'Inne'],
                                ]}
                                name="rejectionReasons"
                                title={`Przyczyna ${
                                    isClientSatisfiedData.value ? 'zadowolenia' : 'niezadowolenia'
                                } klienta: `}
                                connection={opinionData}
                                defaultValue={defaultOpinionValue}
                            />

                            {opinionData.value === 'other' && (
                                <>
                                    <p>
                                        Inna przyczyna {isClientSatisfiedData.value ? 'zadowolenia' : 'niezadowolenia'}{' '}
                                        klienta:{' '}
                                    </p>
                                    <FormInput
                                        placeholder="Inna przyczyna zadowolenia klienta"
                                        defaultValue={prevStep?.questionnaireStepOtherOpinion}
                                        connection={otherOpinionData}
                                    />
                                </>
                            )}

                            <SendButtons
                                curStepName="completionStep"
                                maxPromotion={prevStep!.maxPromotion}
                                passedTo={prevStep!.passedTo}
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                step={order?.steps[order.steps.length - 1]}
                                formCheck={formCheck}
                                isMainCondition={true}
                            />
                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default QuestionnaireStep
