import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, mainSubmitForm, NullableFieldsToSend } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import FormMultiSelect from '../components/FormMultiSelect'
import { useMultiSelect } from '../../hooks/new/useMultiSelect'
import { selectData, workDayStartHours } from '../../accessories/constants'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import CheckboxFormInput from '../components/CheckboxFormInput'
import YesNoSelect from '../components/YesNoSelect'
import { useYesNoSelect } from '../../hooks/new/useYesNoSelect'
import NextPrevCheckbox from '../components/NextPrevCheckbox'
import { DateTime } from 'luxon'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const ReferenceStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
        globalStepWhereLastTransitionWas,
    } = getBranchValues({
        stepName: 'referenceStep',
        order,
    })

    const errFn = useErrFn()

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const wasReferenceRequestSentData = useCheckboxFormInput({
        title: 'Prośba o referencję do klienta jest wysłana',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? false
            : prevStep?.referenceStepWasSentRequest,
    })
    const isClientReferenceData = useYesNoSelect({
        title: 'Klient wystawil referencje',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? null
            : prevStep?.referenceStepIsClientReference,
    })
    const referenceLocationData = useMultiSelect({
        options: selectData.referenceStepReferenceLocation,
        title: `Gdzie wysłano referencję:`,
        initialSelectedIdxs: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? []
            : prevStep?.referenceStepReferenceLocation,
    })

    useEffect(() => {
        if (wasReferenceRequestSentData.checkboxValue === false) {
            isClientReferenceData.setValue(null)
            isClientReferenceData.setErrorValue('')
        }
    }, [wasReferenceRequestSentData.checkboxValue])

    useEffect(() => {
        if (!isClientReferenceData.value) {
            referenceLocationData.setSelectedIdxs([])
            referenceLocationData.setErrorValue('')
        }
    }, [isClientReferenceData.value])

    const enabled = {
        wasReferenceRequestSent:
            !prevStep?.referenceStepWasSentRequest && globalStepWhereLastTransitionWas?.passedTo === 'referenceStep',
        isClientReference:
            wasReferenceRequestSentData.checkboxValue && globalStepWhereLastTransitionWas?.passedTo === 'referenceStep',
        referenceLocation:
            isClientReferenceData.value && globalStepWhereLastTransitionWas?.passedTo === 'referenceStep',
    }

    const isSendEnabled = enabled.wasReferenceRequestSent || enabled.isClientReference || enabled.referenceLocation

    const nextCheck = (showMessage: boolean) => {
        if (!wasReferenceRequestSentData.check(showMessage)) {
            return false
        }
        if (!isClientReferenceData.check(showMessage)) {
            return false
        }
        if (isClientReferenceData.value && !referenceLocationData.check(showMessage)) {
            return false
        }
        return true
    }

    // const isMainCondition = wasReferenceRequestSentData.isChecked && isClientReferenceData.value === 'yes'
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

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'referenceStep',
            passedTo: prevStep!.passedTo,
            deadline: prevStep?.nextDeadline,
            nextToPass: 'completedOrdersStep',
            supposedNextDeadline:
                wasReferenceRequestSentData.checkboxValue === true
                    ? DateTime.now().endOf('day').plus({ days: 14, hours: workDayStartHours, minutes: 1 })
                    : DateTime.now().endOf('day').plus({ days: 2, hours: workDayStartHours, minutes: 1 }),
            sendData: {
                order,
                isCompleted: wasReferenceRequestSentData.checkboxValue && isClientReferenceData.value,
                referenceStepWasSentRequest: wasReferenceRequestSentData.checkboxValue,
                referenceStepIsClientReference: isClientReferenceData.value,
                referenceStepReferenceLocation: referenceLocationData.selectedIdxs,
            },
            createOrder: _createOrder,
            errFn,
        })

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
                                connection={wasReferenceRequestSentData}
                                disabled={!enabled.wasReferenceRequestSent}
                            />

                            {wasReferenceRequestSentData.checkboxValue && (
                                <>
                                    <YesNoSelect
                                        connection={isClientReferenceData}
                                        disabled={!enabled.isClientReference}
                                    />

                                    {isClientReferenceData.value && (
                                        <>
                                            <FormMultiSelect
                                                connection={referenceLocationData}
                                                disabled={!enabled.isClientReference}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {isSendEnabled && (
                                <>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={isMainCondition}
                                        isCurrentStep={prevStep?.passedTo === 'referenceStep'}
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

export default ReferenceStep

// 236
