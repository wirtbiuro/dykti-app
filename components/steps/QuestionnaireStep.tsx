import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, mainSubmitForm, NullableFieldsToSend } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { selectData, workDayStartHours } from '../../accessories/constants'
import { DateTime } from 'luxon'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import CheckboxFormInput from '../components/CheckboxFormInput'
import FormMultiSelectWithOther from '../components/FormMultiSelectWithOther'
import { useFormMultiSelectWithOther } from '../../hooks/new/useFormMultiSelectWithOther'
import NextPrevCheckbox from '../components/NextPrevCheckbox'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const QuestionnaireStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
        globalStepWhereLastTransitionWas,
    } = getBranchValues({
        stepName: 'questionnaireStep',
        order,
    })

    const errFn = useErrFn()

    const isAcceptanceReportData = useCheckboxFormInput({
        title: 'Protokół odbioru',
        initialValue: prevStep?.questionnaireStepIsAcceptanceReport,
    })
    const haveClientReceviedDocsData = useCheckboxFormInput({
        title: 'Klient otrzymał dokumentację',
        initialValue: prevStep?.questionnaireStepHaveClientReceviedDocs,
    })
    const arePaymentsReceivedData = useCheckboxFormInput({
        title: 'Wpłyneły wszystkie płatności',
        initialValue: prevStep?.questionnaireStepArePaymentsReceived,
    })
    const isClientSatisfiedData = useCheckboxFormInput({
        title: 'Klient jest zadowolony',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? false
            : prevStep?.questionnaireStepSatisfaction && prevStep?.questionnaireStepSatisfaction.length > 0
            ? true
            : false,
    })
    const clientSatisfactionData = useFormMultiSelectWithOther({
        options: selectData.questionnaireStepSatisfaction,
        selectTitle: `Przyczyna zadowolenia klienta: `,
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? []
            : prevStep?.questionnaireStepSatisfaction || [],
        otherTitle: 'Inna przyczyna zadowolenia klienta:',
        otherPlaceholder: 'Inna przyczyna zadowolenia klienta:',
    })

    const isClientDissatisfiedData = useCheckboxFormInput({
        title: 'Klient jest niezadowolony',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? false
            : prevStep?.questionnaireStepDissatisfaction && prevStep?.questionnaireStepDissatisfaction.length > 0
            ? true
            : false,
    })
    const clientDissatisfactionData = useFormMultiSelectWithOther({
        options: selectData.questionnaireStepDissatisfaction,
        selectTitle: `Przyczyna niezadowolenia klienta: `,
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? []
            : prevStep?.questionnaireStepDissatisfaction || [],
        otherTitle: 'Inna przyczyna niezadowolenia klienta:',
        otherPlaceholder: 'Inna przyczyna niezadowolenia klienta:',
    })

    useEffect(() => {
        if (isClientSatisfiedData.checkboxValue === false) {
            clientSatisfactionData.setValue([])
        }
    }, [isClientSatisfiedData.checkboxValue])

    useEffect(() => {
        if (isClientDissatisfiedData.checkboxValue === false) {
            clientDissatisfactionData.setValue([])
        }
    }, [isClientDissatisfiedData.checkboxValue])

    const enabled = {
        isAcceptanceReport: globalStepWhereLastTransitionWas?.passedTo === 'questionnaireStep',
        haveClientReceviedDocs: globalStepWhereLastTransitionWas?.passedTo === 'questionnaireStep',
        arePaymentsReceived: globalStepWhereLastTransitionWas?.passedTo === 'questionnaireStep',
        isClientSatisfied: globalStepWhereLastTransitionWas?.passedTo === 'questionnaireStep',
        clientSatisfaction:
            isClientSatisfiedData.checkboxValue && globalStepWhereLastTransitionWas?.passedTo === 'questionnaireStep',
        isClientDissatisfied: globalStepWhereLastTransitionWas?.passedTo === 'questionnaireStep',
        clientDissatisfaction:
            isClientDissatisfiedData.checkboxValue &&
            globalStepWhereLastTransitionWas?.passedTo === 'questionnaireStep',
    }

    const isSendEnabled =
        enabled.isAcceptanceReport ||
        enabled.haveClientReceviedDocs ||
        enabled.arePaymentsReceived ||
        enabled.isClientSatisfied ||
        enabled.clientSatisfaction ||
        enabled.isClientDissatisfied ||
        enabled.clientDissatisfaction

    const nextCheck = (showMessage: boolean) => {
        if (!isAcceptanceReportData.check(showMessage)) {
            return false
        }
        if (!haveClientReceviedDocsData.check(showMessage)) {
            return false
        }
        if (!arePaymentsReceivedData.check(showMessage)) {
            return false
        }
        if (isClientSatisfiedData.checkboxValue === true && !clientSatisfactionData.check(showMessage)) {
            return false
        }
        if (isClientDissatisfiedData.checkboxValue === true && !clientDissatisfactionData.check(showMessage)) {
            return false
        }
        return true
    }

    const isMainCondition = true

    const onSubmit = async (e: SyntheticEvent) => {
        const _createOrder = createOrder as (data: NullableFieldsToSend) => void

        e.preventDefault()
        console.log('on submit')
        if (isMainCondition && nextPrevCheckboxData.check(false)) {
            if (!nextCheck(true)) {
                return
            }
        }
        // if (!isMainCondition && nextPrevCheckboxData.check(false)) {
        //     if (!prevCheck(true)) {
        //         return
        //     }
        // }

        const data = {
            isCompleted: nextCheck(false) && isClientSatisfiedData.checkboxValue,
            questionnaireStepIsAcceptanceReport: isAcceptanceReportData.checkboxValue,
            questionnaireStepHaveClientReceviedDocs: haveClientReceviedDocsData.checkboxValue,
            questionnaireStepArePaymentsReceived: arePaymentsReceivedData.checkboxValue,
            questionnaireStepSatisfaction: clientSatisfactionData.value,
            questionnaireStepDissatisfaction: clientDissatisfactionData.value,
        }
        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'questionnaireStep',
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
                            <CheckboxFormInput
                                connection={isAcceptanceReportData}
                                disabled={!enabled.isAcceptanceReport}
                            />
                            <CheckboxFormInput
                                connection={haveClientReceviedDocsData}
                                disabled={!enabled.haveClientReceviedDocs}
                            />
                            <CheckboxFormInput
                                connection={arePaymentsReceivedData}
                                disabled={!enabled.arePaymentsReceived}
                            />
                            <CheckboxFormInput
                                connection={isClientSatisfiedData}
                                disabled={!enabled.isClientSatisfied}
                            />

                            {isClientSatisfiedData.checkboxValue && (
                                <FormMultiSelectWithOther
                                    connection={clientSatisfactionData}
                                    disabled={!enabled.clientSatisfaction}
                                />
                            )}

                            <CheckboxFormInput
                                connection={isClientDissatisfiedData}
                                disabled={!enabled.isClientDissatisfied}
                            />

                            {isClientDissatisfiedData.checkboxValue && (
                                <FormMultiSelectWithOther
                                    connection={clientDissatisfactionData}
                                    disabled={!enabled.clientDissatisfaction}
                                />
                            )}

                            {isSendEnabled && (
                                <>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={isMainCondition}
                                        isCurrentStep={prevStep?.passedTo === 'questionnaireStep'}
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

export default QuestionnaireStep

// 370
