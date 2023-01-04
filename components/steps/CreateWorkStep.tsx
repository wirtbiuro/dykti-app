import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes, IWorker } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, mainSubmitForm, NullableFieldsToSend } from '../../utilities'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import FormMultiSelect from '../components/FormMultiSelect'
import { DateTime } from 'luxon'
import useErrFn from '../../hooks/useErrFn'
import { useMultiSelect } from '../../hooks/new/useMultiSelect'
import { Spin } from 'antd'
import { workDayStartHours } from '../../accessories/constants'
import { useCalendarData } from '../../hooks/new/useCalendarData'
import Calendar from '../components/calendar'
import CheckboxFormInput from '../components/CheckboxFormInput'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import TextFormInput from '../components/TextFormInput'
import NextPrevCheckbox from '../components/NextPrevCheckbox'

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
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
        globalStepWhereLastTransitionWas,
    } = getBranchValues({
        stepName: 'workStep',
        order,
    })

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const workTeam = (prevStep?.workStepTeam as IWorker[]) || []
    const workTeamString = workTeam.map((worker) => worker.username).join('; ')

    const shouldChangeContractData = useCheckboxFormInput({
        checkFn: (value: boolean) => value === false,
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? false
            : prevStep?.workStepContractEdits
            ? true
            : false,
        title: 'Kontrakt wymaga zmiany',
    })
    const teamData = useMultiSelect({
        options: workersOptions,
        initialSelectedIdxsString: workTeamString,
        title: 'Ekipa',
    })

    const contractEditsData = useTextFormInput({
        initialTextValue: isNewBranchComparedByLastStepWhereSomethingWasChanged ? '' : prevStep?.workStepContractEdits,
        title: 'Zmiany w kontrakcie:',
        placeholder: 'Jakich zmian wymaga kontrakt?',
    })

    const startCalendarData = useCalendarData({
        selectedDate: prevStep?.workStepWorkStartDate
            ? DateTime.fromISO(prevStep?.workStepWorkStartDate as string)
            : prevStep?.contractCheckerStepWorkStartDate
            ? DateTime.fromISO(prevStep?.contractCheckerStepWorkStartDate as string)
            : undefined,
        withTime: false,
    })

    const endCalendarData = useCalendarData({
        selectedDate: prevStep?.workStepWorkEndDate
            ? DateTime.fromISO(prevStep?.workStepWorkEndDate as string)
            : prevStep?.contractCheckerStepWorkEndDate
            ? DateTime.fromISO(prevStep?.contractCheckerStepWorkEndDate as string)
            : undefined,
        withTime: false,
    })

    useEffect(() => {
        if (
            startCalendarData.date &&
            endCalendarData.date &&
            startCalendarData.date.toMillis() - endCalendarData.date.toMillis() < 0
        ) {
            endCalendarData.setDay(startCalendarData.date)
        }
    }, [startCalendarData.date, endCalendarData.date])

    useEffect(() => {
        if (shouldChangeContractData.checkboxValue === true) {
            startCalendarData.reset()
            startCalendarData.setErrorValue('')
            endCalendarData.reset()
            endCalendarData.setErrorValue('')
            teamData.setSelectedIdxsString('')
            teamData.setErrorValue('')
        }
        if (shouldChangeContractData.checkboxValue === false) {
            contractEditsData.setTextValue('')
            contractEditsData.setErrorValue('')
        }
    }, [shouldChangeContractData.checkboxValue])

    const isMainCondition = shouldChangeContractData.checkboxValue === false

    const enabled = {
        shouldChangeContract: globalStepWhereLastTransitionWas?.passedTo === 'workStep',
        contractEdits:
            shouldChangeContractData.checkboxValue === true &&
            globalStepWhereLastTransitionWas?.passedTo === 'workStep',
        startCalendar:
            shouldChangeContractData.checkboxValue === false &&
            globalStepWhereLastTransitionWas?.passedTo === 'workStep',
        endCalendar:
            shouldChangeContractData.checkboxValue === false &&
            globalStepWhereLastTransitionWas?.passedTo === 'workStep',
        team:
            shouldChangeContractData.checkboxValue === false &&
            globalStepWhereLastTransitionWas?.passedTo === 'workStep',
    }

    const isSendEnabled =
        enabled.shouldChangeContract ||
        enabled.contractEdits ||
        enabled.startCalendar ||
        enabled.endCalendar ||
        enabled.team

    const nextCheck = (showMessage: boolean) => {
        if (!startCalendarData.check(showMessage)) {
            return false
        }
        if (!endCalendarData.check(showMessage)) {
            return false
        }
        if (!teamData.check(showMessage)) {
            return false
        }
        return true
    }

    const prevCheck = (showMessage: boolean) => {
        if (!contractEditsData.check(showMessage)) {
            return false
        }
        return true
    }

    const onSubmit = async (e: SyntheticEvent) => {
        const _createOrder = createOrder as (data: NullableFieldsToSend) => void

        e.preventDefault()
        console.log('on submit')
        if (isMainCondition && nextPrevCheckboxData.check(false)) {
            if (!nextCheck(true)) {
                return
            }
        }
        if (!isMainCondition && nextPrevCheckboxData.check(false)) {
            if (!prevCheck(true)) {
                return
            }
        }
        const data = {
            workStepTeam: teamData.selectedIdxsString,
            workStepWorkStartDate: startCalendarData.date,
            workStepContractEdits: contractEditsData.textValue,
            workStepWorkEndDate: endCalendarData.date,
        }

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'workStep',
            passedTo: prevStep!.passedTo,
            deadline: prevStep?.nextDeadline,
            supposedNextDeadline: isMainCondition
                ? endCalendarData.date!.endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 })
                : DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            sendData: {
                order,
                ...data,
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
                        <form ref={formRef} onSubmit={onSubmit}>
                            <>
                                <CheckboxFormInput
                                    connection={shouldChangeContractData}
                                    disabled={!enabled.shouldChangeContract}
                                />

                                {shouldChangeContractData.checkboxValue === true && (
                                    <>
                                        <TextFormInput
                                            connection={contractEditsData}
                                            disabled={!enabled.contractEdits}
                                        />
                                    </>
                                )}

                                {shouldChangeContractData.checkboxValue === false && (
                                    <>
                                        <p>Data rozpoczęcia pracy.</p>
                                        <Calendar connection={startCalendarData} disabled={!enabled.startCalendar} />

                                        <p>Data zakończenia pracy.</p>
                                        <Calendar connection={endCalendarData} disabled={!enabled.endCalendar} />

                                        <>
                                            <FormMultiSelect connection={teamData} disabled={!enabled.team} />
                                        </>
                                    </>
                                )}
                            </>

                            {isSendEnabled && (
                                <>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={isMainCondition}
                                        isCurrentStep={prevStep?.passedTo === 'workStep'}
                                    />

                                    <input type="submit" value="Zapisz" />
                                </>
                            )}
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateWorkStep

//324
