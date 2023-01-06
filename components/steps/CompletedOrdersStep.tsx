import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled, SendButtonsWrapper } from '../../styles/styled-components'
import {
    WithValueNFocus,
    IWithOrder,
    ISendCheckboxes,
    roleTitles,
    roles,
    getStepnameByRole,
    StepName,
} from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, mainSubmitForm, NullableFieldsToSend } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import FormSelect from '../components/FormSelect'
import YesNoSelect from '../components/YesNoSelect'
import { useYesNoSelect } from '../../hooks/new/useYesNoSelect'
import NextPrevCheckbox from '../components/NextPrevCheckbox'
import { DateTime } from 'luxon'
import { workDayStartHours } from '../../accessories/constants'
import { useFormSelect } from '../../hooks/new/useFormSelect'
import ServiceStep from './ServiceStep'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CompletedOrdersStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const { prevStep, branchIdx, prevBranchOnProp } = getBranchValues({
        stepName: 'completedOrdersStep',
        order,
    })

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const errFn = useErrFn()

    const _roles = roles
        .filter((role) => !['LastDecisionUser', 'RejectedOrdersViewer', 'CompletedOrdersViewer'].includes(role))
        .map((role) => {
            return [getStepnameByRole(role), roleTitles[role]]
        })

    const nextToPassData = useFormSelect({
        options: [['select', 'Wybierz'], ..._roles],
        title: `Na jaki poziom należy przenieść sprawę?`,
    })

    const isMainCondition = false

    const prevCheck = (showMessage: boolean) => {
        console.log('prev check')
        if (!nextToPassData.check(showMessage)) {
            return false
        }
        return true
    }

    const onSubmit = async (e: SyntheticEvent) => {
        const _createOrder = createOrder as (data: NullableFieldsToSend) => void

        e.preventDefault()
        console.log('on submit')

        if (!isMainCondition && nextPrevCheckboxData.check(false)) {
            console.log('no mainCondition')
            if (!prevCheck(true)) {
                return
            }
        }

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'rejectedOrdersStep',
            passedTo: prevStep!.passedTo,
            deadline: prevStep?.nextDeadline,
            nextToPass: 'rejectedOrdersStep',
            prevToPass: nextToPassData.value as StepName,
            supposedNextDeadline: DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            sendData: {
                order,
                isCompleted: false,
            },
            createOrder: _createOrder,
            errFn,
        })

        console.log('submit end')

        setIsVisible!(false)
        setIsSpinning(false)
    }

    return (
        <div style={{ display: isVisible ? 'block' : 'none', paddingTop: '20px' }}>
            <h3>Serwisy:</h3>
            <p>Lista Serwisow</p>
            <button>Dodać Serwis</button>
            <ServiceStep order={order} isVisible={isVisible} setIsVisible={setIsVisible} />
        </div>
    )

    return (
        <Spin spinning={isSpinning}>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={onSubmit}>
                            <FormSelect connection={nextToPassData} />
                            <>
                                <SendButtonsWrapper visible={false}>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={isMainCondition}
                                        isCurrentStep={prevStep?.passedTo === 'completedOrdersStep'}
                                    />
                                </SendButtonsWrapper>
                                <input type="submit" value="Zapisz" />
                            </>
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CompletedOrdersStep
