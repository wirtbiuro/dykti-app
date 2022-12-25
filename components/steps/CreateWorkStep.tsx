import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    ISendButtonsOutputRef,
    FormCheckType,
    ISendCheckboxes,
    FieldsToSend,
    IWorker,
} from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import FormInput from '../UI/FormInput'
import CalendarWithTime from '../CalendarWithTime'
import SendButtons from '../UI/SendButtons'
import { submitForm, showErrorMessages, getBranchValues } from '../../utilities'
import { flushSync } from 'react-dom'
import { useFormInput } from '../../hooks/useFormInput'
import FormMultiSelect from '../UI/FormMultiSelect'
import { useFormSelect } from '../../hooks/useFormSelect'
import { DateTime } from 'luxon'
import useErrFn from '../../hooks/useErrFn'
import { useFormMultiSelect } from '../../hooks/useFormMultiSelect'
import { Spin } from 'antd'
import { selectData, workDayStartHours } from '../../accessories/constants'
import { CalendarModule, useCalendarData } from '../../store/calendar'
import Calendar from '../calendar/Calendar'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateWorkStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const getWorkers = dyktiApi.endpoints.getWorkers as any
    const getWorkersQueryData = getWorkers.useQuery()
    const { data: workersData } = getWorkersQueryData

    console.log({ workersData })

    const workersOptions =
        workersData?.workers?.map((worker: { username: string; name: string }) => [worker.username, worker.name]) || []

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const {
        prevStep,
        branchIdx,
        prevStepChangeStep,
        isNewBranchComparedByLastStepnameChange,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'workStep',
        order,
    })

    const workTeam = (prevStep?.workStepTeam as IWorker[]) || []
    const workTeamString = workTeam.map((worker) => worker.username).join('; ')

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [startCalendar] = useState<CalendarModule>(
        new CalendarModule({
            withTime: false,
            selectedDate: prevStep?.workStepWorkStartDate
                ? DateTime.fromISO(prevStep?.workStepWorkStartDate as string)
                : prevStep?.contractCheckerStepWorkStartDate
                ? DateTime.fromISO(prevStep?.contractCheckerStepWorkStartDate as string)
                : undefined,
        })
    )

    const [endCalendar] = useState<CalendarModule>(
        new CalendarModule({
            withTime: false,
            selectedDate: prevStep?.workStepWorkEndDate
                ? DateTime.fromISO(prevStep?.workStepWorkEndDate as string)
                : prevStep?.contractCheckerStepWorkEndDate
                ? DateTime.fromISO(prevStep?.contractCheckerStepWorkEndDate as string)
                : undefined,
        })
    )

    const workStartDateData = useCalendarData(startCalendar)
    const workEndDateData = useCalendarData(endCalendar)

    useEffect(() => {
        if (
            startCalendar.data.dayMonthYear &&
            endCalendar.data.dayMonthYear &&
            endCalendar.data.dayMonthYear?.toMillis() - startCalendar.data.dayMonthYear?.toMillis() < 0
        ) {
            endCalendar.setSelectedDate(startCalendar.getSelectedDate() || null)
        }
    }, [startCalendar.data.dayMonthYear, endCalendar.data.dayMonthYear])

    const shouldChangeContractData = useFormInput()
    const teamData = useFormMultiSelect()
    const contractEditsData = useFormInput()
    // const rejectionReasonData = useFormSelect()

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    const isMainCondition =
        // workStartDateDataValue?.toUTC().toISO() === prevStep?.contractCheckerStepWorkStartDate &&
        shouldChangeContractData.isChecked

    // console.log('workStartDateDataValue', workStartDateDataValue?.toUTC().toISO())
    // console.log('prevStep?.contractCheckerStepWorkStartDate', prevStep?.contractCheckerStepWorkStartDate)

    // console.log(
    //     'workStartDateDataValue?.toUTC().toISO()',
    //     workStartDateDataValue?.toUTC().toISO(),
    //     ' === prevStep?.contractCheckerStepWorkStartDate',
    //     prevStep?.contractCheckerStepWorkStartDate
    // )
    // console.log({ isMainCondition })

    useEffect(() => {
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [
        workStartDateData.dayMonthYear,
        workEndDateData.dayMonthYear,
        shouldChangeContractData.isChecked,
        teamData.isChecked,
        contractEditsData.isChecked,
    ])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!startCalendar.getSelectedDate(showMessage)) {
            setIsFormChecked(false)
            return false
        }

        if (!endCalendar.getSelectedDate(showMessage)) {
            setIsFormChecked(false)
            return false
        }

        if (!teamData.isChecked) {
            console.log('teamData error')
            showMessage ? teamData.showError!() : null
            setIsFormChecked(false)
            return false
        }

        console.log('form checked')

        setIsFormChecked(true)
        return true
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (shouldChangeContractData.isChecked) {
            console.log('shouldChangeContractData error')
            showMessage ? shouldChangeContractData.showError!() : null
            setIsPrevFormChecked(false)
            return false
        }

        if (!contractEditsData.isChecked) {
            console.log('contractEditsData error')
            showMessage ? contractEditsData.showError!() : null
            setIsPrevFormChecked(false)
            return false
        }

        setIsPrevFormChecked(true)
        return true
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log({ teamData })

        const areErrors = showErrorMessages({
            flushSync,
            formCheck,
            prevFormCheck,
            isFormChecked,
            isPrevFormChecked,
            isMainCondition,
            target,
        })

        console.log('submit')

        console.log({ areErrors })

        if (areErrors) return

        setIsSpinning(true)

        await submitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'workStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            isPrevFormChecked,
            deadline: prevStep?.nextDeadline,
            supposedNextDeadline: isMainCondition
                ? endCalendar.getSelectedDate()!.endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 })
                : DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            toNextSendData: {
                order,
                workStepTeam: teamData.value,
                workStepWorkStartDate: startCalendar.getSelectedDate(false),
                workStepContractEdits: null,
                workStepWorkEndDate: endCalendar.getSelectedDate(false),
                ...sendButtonsOutputRef.current.getResults(),
            },
            toPrevSendData: {
                order,
                workStepTeam: teamData.value,
                workStepWorkStartDate: null,
                workStepContractEdits: contractEditsData.value,
                workStepWorkEndDate: null,
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
                                <>
                                    <FormInput
                                        type="checkbox"
                                        connection={shouldChangeContractData}
                                        defaultChecked={
                                            isNewBranchComparedByLastStepnameChange
                                                ? false
                                                : prevStep?.workStepContractEdits
                                                ? true
                                                : false
                                        }
                                        disabled={prevStep && prevStep?.passedTo !== 'workStep'}
                                    >
                                        <>Kontrakt wymaga zmiany</>
                                    </FormInput>
                                </>

                                {!shouldChangeContractData.isChecked && (
                                    <>
                                        <p>Zmiany w kontrakcie: </p>
                                        <FormInput
                                            placeholder="Jakich zmian wymaga kontrakt?"
                                            defaultValue={
                                                isNewBranchComparedByLastStepnameChange
                                                    ? ''
                                                    : prevStep?.workStepContractEdits
                                            }
                                            connection={contractEditsData}
                                        />
                                    </>
                                )}

                                {shouldChangeContractData.isChecked && (
                                    <>
                                        <p>Data rozpoczęcia pracy.</p>
                                        <Calendar
                                            calendar={startCalendar}
                                            disabled={prevStep && prevStep?.passedTo !== 'workStep'}
                                        />

                                        <p>Data zakończenia pracy.</p>
                                        <Calendar
                                            calendar={endCalendar}
                                            disabled={prevStep && prevStep?.passedTo !== 'workStep'}
                                        />

                                        <>
                                            <p>Ekipa: </p>
                                            <FormMultiSelect
                                                placeholder="Ekipa"
                                                defaultValue={workTeamString}
                                                connection={teamData}
                                                options={workersOptions}
                                                disabled={prevStep && prevStep?.passedTo !== 'workStep'}
                                            />
                                        </>
                                    </>
                                )}
                            </>

                            <SendButtons
                                isMainCondition={isMainCondition}
                                curStepName="workStep"
                                maxPromotion={prevStep!.maxPromotion}
                                passedTo={prevStep!.passedTo}
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                isPrevFormChecked={isPrevFormChecked}
                                step={prevStep}
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

export default CreateWorkStep
