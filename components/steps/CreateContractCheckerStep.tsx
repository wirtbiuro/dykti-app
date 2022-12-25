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
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages, resetPrevProps, getBranchValues } from '../../utilities'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import FormSelect from '../UI/FormSelect'
import { selectData, workDayStartHours } from '../../accessories/constants'
import { useFormSelect } from '../../hooks/useFormSelect'
import Calendar from '../calendar/Calendar'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import { DateTime } from 'luxon'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractCheckerStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [isSpinning, setIsSpinning] = useState(false)

    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const {
        prevStep,
        branchIdx,
        prevStepChangeStep,
        isNewBranchComparedByLastStepnameChange,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'contractCheckerStep',
        order,
    })

    const isContractCheckedData = useFormSelect()
    const commentsData = useFormInput()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    const [startCalendar] = useState<CalendarModule>(
        new CalendarModule({
            withTime: false,
            selectedDate: prevStep?.contractCheckerStepWorkStartDate
                ? DateTime.fromISO(prevStep?.contractCheckerStepWorkStartDate as string)
                : undefined,
        })
    )

    const [endCalendar] = useState<CalendarModule>(
        new CalendarModule({
            withTime: false,
            selectedDate: prevStep?.contractCheckerStepWorkEndDate
                ? DateTime.fromISO(prevStep?.contractCheckerStepWorkEndDate as string)
                : undefined,
        })
    )

    const startCalendarData = useCalendarData(startCalendar)
    const endCalendarData = useCalendarData(endCalendar)

    useEffect(() => {
        // isMainCondition
        //     ? formCheck({ showMessage: false })
        //     : prevFormCheck({ showMessage: false })
        console.log('useeffect formcheck')
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [
        isContractCheckedData.isChecked,
        startCalendarData.dayMonthYear,
        commentsData.isChecked,
        endCalendarData.dayMonthYear,
    ])

    useEffect(() => {
        try {
            if (
                (isContractCheckedData.value === 'yes' && prevStep?.contractCheckerStepIsContractChecked === false) ||
                (isContractCheckedData.value === 'no' && prevStep?.contractCheckerStepIsContractChecked === true)
            ) {
                commentsData.setValue!('')
            } else if (isContractCheckedData.value === 'select') {
            } else {
                commentsData.setValue && commentsData.setValue!(prevStep?.contractCheckerStepComments)
            }
        } catch (error) {}
    }, [isContractCheckedData.value])

    const isMainCondition = isContractCheckedData.value !== 'no'

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')
        if (isContractCheckedData.value !== 'yes') {
            console.log('isContractCheckedData error')
            showMessage ? isContractCheckedData.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!startCalendar.getSelectedDate(showMessage)) {
            setIsFormChecked(false)
            return false
        }

        if (!endCalendar.getSelectedDate(showMessage)) {
            setIsFormChecked(false)
            return false
        }
        // if (!workEndDateData.isChecked) {
        //     console.log('workEndDateData error')
        //     showMessage ? workEndDateData.showError!() : null
        //     return setIsFormChecked(false)
        // }

        console.log('form checked')

        setIsFormChecked(true)
        return true
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        // if (!offerChangesData.isChecked) {
        //     console.log({ offerChangesData })
        //     showMessage && offerChangesData.showError
        //         ? offerChangesData?.showError()
        //         : null
        //     return setIsPrevFormChecked(false)
        // }

        if (!commentsData.isChecked) {
            console.log('commentsData error')
            showMessage ? commentsData.showError!() : null
            setIsPrevFormChecked(false)
            return false
        }

        console.log('prev form checked')

        setIsPrevFormChecked(true)
        return true
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        const areErrors = showErrorMessages({
            flushSync,
            formCheck,
            isFormChecked,
            isMainCondition,
            isPrevFormChecked,
            prevFormCheck,
            target,
        })

        console.log('submit')

        if (areErrors) return

        setIsSpinning(true)

        await submitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'contractCheckerStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            deadline: prevStep?.nextDeadline,
            supposedNextDeadline: DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            toPrevSendData: {
                order,
                // ...resetPrevProps({ curStepName: 'contractCheckerStep', step: prevStep! }),
                contractCheckerStepIsContractChecked:
                    isContractCheckedData.value === 'yes' ? true : isContractCheckedData.value === 'no' ? false : null,
                contractCheckerStepWorkStartDate: null,
                contractCheckerStepWorkEndDate: null,
                contractCheckerStepComments: commentsData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                contractCheckerStepIsContractChecked:
                    isContractCheckedData.value === 'yes' ? true : isContractCheckedData.value === 'no' ? false : null,
                contractCheckerStepWorkStartDate: startCalendar.getSelectedDate(false),
                contractCheckerStepWorkEndDate: endCalendar.getSelectedDate(false),
                contractCheckerStepComments: commentsData.value,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        console.log('submit end')

        setIsVisible!(false)
        setIsSpinning(false)
    }

    return (
        <Spin spinning={isSpinning}>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            <>
                                {/* <FormInput
                                    type="checkbox"
                                    connection={isContractCheckedData}
                                    defaultChecked={
                                        typeof prevStep?.contractCheckerStepIsContractChecked === 'boolean'
                                            ? prevStep?.contractCheckerStepIsContractChecked
                                            : false
                                    }
                                    checkFn={(value) => value as boolean}
                                >
                                    <>Kontrakt jest weryfikowan</>
                                </FormInput> */}

                                <FormSelect
                                    options={selectData.standardSelect}
                                    name="isContractCheckedData"
                                    title="Kontrakt jest prawidłowy"
                                    connection={isContractCheckedData}
                                    disabled={prevStep && prevStep?.passedTo !== 'contractCheckerStep'}
                                    defaultValue={
                                        isNewBranchComparedByLastStepnameChange
                                            ? 'select'
                                            : typeof prevStep?.contractCheckerStepIsContractChecked !== 'boolean'
                                            ? 'select'
                                            : prevStep?.contractCheckerStepIsContractChecked
                                            ? 'yes'
                                            : 'no'
                                    }
                                />

                                {isContractCheckedData.value === 'yes' && (
                                    <>
                                        {/* <>
                                            <p>Przybliżona data rozpoczęcia pracy.</p>
                                            <CalendarWithTime
                                                defaultDate={order && prevStep?.contractCheckerStepWorkStartDate}
                                                connection={workStartDateData}
                                                isTimeEnabled={false}
                                            />
                                        </>
                                        <>
                                            <p>Przybliżona data zakończenia pracy.</p>
                                            <CalendarWithTime
                                                defaultDate={order && prevStep?.contractCheckerStepWorkEndDate}
                                                connection={workEndDateData}
                                                isTimeEnabled={false}
                                            />
                                        </> */}
                                        <p>Przybliżona data rozpoczęcia pracy.</p>
                                        <Calendar
                                            calendar={startCalendar}
                                            disabled={prevStep && prevStep?.passedTo !== 'contractCheckerStep'}
                                        />
                                        <p>Przybliżona data zakończenia pracy.</p>
                                        <Calendar
                                            calendar={endCalendar}
                                            disabled={prevStep && prevStep?.passedTo !== 'contractCheckerStep'}
                                        />
                                    </>
                                )}

                                {isContractCheckedData.value !== 'select' && (
                                    <>
                                        <p>Komentarz: </p>
                                        <FormInput
                                            placeholder={
                                                isMainCondition ? 'Komentarz' : 'Jakich zmian wymaga kontrakt?'
                                            }
                                            defaultValue={
                                                isNewBranchComparedByLastStepnameChange
                                                    ? ''
                                                    : prevStep?.contractCheckerStepComments
                                            }
                                            connection={commentsData}
                                            // disabled={prevStep && prevStep?.passedTo !== 'contractCheckerStep'}
                                        />
                                    </>
                                )}
                            </>

                            <SendButtons
                                curStepName="contractCheckerStep"
                                maxPromotion={prevStep!.maxPromotion}
                                passedTo={prevStep!.passedTo}
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                step={prevStep}
                                formCheck={formCheck}
                                isMainCondition={isMainCondition}
                                isPrevFormChecked={isPrevFormChecked}
                                prevFormCheck={prevFormCheck}
                            />
                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateContractCheckerStep
