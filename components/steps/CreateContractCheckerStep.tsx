import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendButtonsOutputRef, ISendCheckboxes } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import TextFormInput from '../components/TextFormInput'
import { getBranchValues, mainSubmitForm, NullableFieldsToSend } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import FormSelect from '../components/FormSelect'
import YesNoSelect from '../components/YesNoSelect'
import { selectData, workDayStartHours } from '../../accessories/constants'
import { useFormSelect } from '../../hooks/new/useFormSelect'
import Calendar from '../components/calendar'
import { useCalendarData } from '../../hooks/new/useCalendarData'
import { DateTime } from 'luxon'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import NextPrevCheckbox from '../components/NextPrevCheckbox'
import { useYesNoSelect } from '../../hooks/new/useYesNoSelect'

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

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
        globalStepWhereLastTransitionWas,
    } = getBranchValues({
        stepName: 'contractCheckerStep',
        order,
    })

    const isContractCheckedData = useYesNoSelect({
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? null
            : prevStep?.contractCheckerStepIsContractChecked,
        title: 'Kontrakt jest prawidłowy',
    })

    const isMainCondition = isContractCheckedData.value !== false

    const startCalendarData = useCalendarData({
        selectedDate: prevStep?.contractCheckerStepWorkStartDate
            ? DateTime.fromISO(prevStep?.contractCheckerStepWorkStartDate as string)
            : undefined,
    })

    const endCalendarData = useCalendarData({
        selectedDate: prevStep?.contractCheckerStepWorkEndDate
            ? DateTime.fromISO(prevStep?.contractCheckerStepWorkEndDate as string)
            : undefined,
    })

    const commentsData = useTextFormInput({
        initialTextValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? ''
            : prevStep?.contractCheckerStepComments,
        placeholder: isMainCondition ? 'Komentarz' : 'Jakich zmian wymaga kontrakt?',
        title: 'Komentarz:',
    })

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    useEffect(() => {
        commentsData.setTextValue('')
        commentsData.setErrorValue('')
        if (isContractCheckedData.value === false) {
            startCalendarData.reset()
            startCalendarData.setErrorValue('')
            endCalendarData.reset()
            endCalendarData.setErrorValue('')
        }
    }, [isContractCheckedData.value])

    const enabled = {
        isContractChecked: globalStepWhereLastTransitionWas?.passedTo === 'contractCheckerStep',
        startCalendar:
            isContractCheckedData.value && globalStepWhereLastTransitionWas?.passedTo === 'contractCheckerStep',
        endCalendar:
            isContractCheckedData.value && globalStepWhereLastTransitionWas?.passedTo === 'contractCheckerStep',
        comments:
            isContractCheckedData.value !== null &&
            (globalStepWhereLastTransitionWas?.passedTo === 'contractCheckerStep' ||
                (prevStep?.createdByStep === 'contractCheckerStep' && prevStep.passedTo === 'workStep')),
    }

    const isSendEnabled = enabled.isContractChecked || enabled.startCalendar || enabled.endCalendar || enabled.comments

    const nextCheck = (showMessage: boolean) => {
        if (!isContractCheckedData.check(showMessage)) {
            return false
        }
        if (!startCalendarData.check(showMessage)) {
            return false
        }
        if (!endCalendarData.check(showMessage)) {
            return false
        }
        if (!isContractCheckedData.check(showMessage)) {
            return false
        }

        return true
    }

    const prevCheck = (showMessage: boolean) => {
        if (!commentsData.check(showMessage)) {
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
            contractCheckerStepIsContractChecked: isContractCheckedData.value,
            contractCheckerStepWorkStartDate: startCalendarData.date,
            contractCheckerStepWorkEndDate: endCalendarData.date,
            contractCheckerStepComments: commentsData.textValue,
        }

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'contractCheckerStep',
            passedTo: prevStep!.passedTo,
            deadline: prevStep?.nextDeadline,
            supposedNextDeadline: DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
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
                            <YesNoSelect connection={isContractCheckedData} disabled={!enabled.isContractChecked} />

                            {isContractCheckedData.value === true && (
                                <>
                                    <p>Przybliżona data rozpoczęcia pracy.</p>
                                    <Calendar connection={startCalendarData} disabled={!enabled.startCalendar} />
                                    <p>Przybliżona data zakończenia pracy.</p>
                                    <Calendar connection={endCalendarData} disabled={!enabled.endCalendar} />
                                </>
                            )}

                            {isContractCheckedData.value !== null && (
                                <TextFormInput connection={commentsData} disabled={!enabled.comments} />
                            )}

                            {isSendEnabled && (
                                <>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={isMainCondition}
                                        isCurrentStep={prevStep?.passedTo === 'contractCheckerStep'}
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

export default CreateContractCheckerStep

//295
