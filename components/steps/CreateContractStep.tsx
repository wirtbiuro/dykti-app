import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled, SendButtonsWrapper } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, NullableFieldsToSend, mainSubmitForm } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { selectData, workDayStartHours } from '../../accessories/constants'
import { DateTime } from 'luxon'
import PrevBranchProp from '../PrevBranchProp'
import CheckboxFormInput from '../components/CheckboxFormInput'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import YesNoSelect from '../components/YesNoSelect'
import { useYesNoSelect } from '../../hooks/new/useYesNoSelect'
import TextFormInput from '../components/TextFormInput'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import FormSelectWithOther from '../components/FormSelectWithOther'
import { useFormSelectWithOther } from '../../hooks/new/useFormSelectWithOther'
import NextPrevCheckbox from '../components/NextPrevCheckbox'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [isSpinning, setIsSpinning] = useState(false)
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'contractStep',
        order,
    })

    console.log({
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
    })

    const isOfferSentDefault = lastStepWhereSomethingWasChanged?.contractStepOfferSendingDate ? true : false

    const isOfferSentData = useCheckboxFormInput({
        title: 'Oferta wysłana',
        initialValue: isOfferSentDefault,
    })

    const areOfferChangesData = useYesNoSelect({
        title: 'Oferta potrzebuje zmian:',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? null
            : prevStep?.contractStepAreOfferChanges,
    })
    const offerChangesData = useTextFormInput({
        title: 'Zmiany w ofercie: ',
        placeholder: 'Jakich zmian wymaga oferta?',
        initialTextValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? ''
            : prevStep?.contractStepOfferChangesComment,
    })
    const isOfferAcceptedData = useYesNoSelect({
        title: 'Klient przyjął ofertę:',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? null
            : prevStep?.contractStepIsOfferAccepted,
    })
    const sentForVerificationData = useCheckboxFormInput({
        title: 'Kontrakt jest przygotowany i wysłany do weryfikacji',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? false
            : lastStepWhereSomethingWasChanged?.contractStepSentForVerificationDate
            ? true
            : false,
    })
    const rejectionReasonsData = useFormSelectWithOther({
        options: selectData.contractStepOfferRejectionReason,
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? 'select'
            : prevStep?.contractStepOfferRejectionReason,
        selectTitle: 'Przyczyna odrzucenia oferty:',
        otherTitle: 'Inna przyczyna odrzucenia oferty:',
        otherPlaceholder: 'Inna przyczyna odrzucenia oferty',
    })

    const nextCheck = (showMessage: boolean) => {
        if (!isOfferSentDefault) {
            return true
        }

        if (!isOfferSentData.check(showMessage)) {
            return false
        }
        if (!areOfferChangesData.check(showMessage)) {
            return false
        }
        if (!isOfferAcceptedData.check(showMessage)) {
            return false
        }
        if (isOfferAcceptedData.value === true && !sentForVerificationData.check(showMessage)) {
            return false
        }
        if (isOfferAcceptedData.value === false && !rejectionReasonsData.check(showMessage)) {
            return false
        }
        return true
    }

    const prevCheck = (showMessage: boolean) => {
        if (!offerChangesData.check(showMessage)) {
            return false
        }
        return true
    }

    const getIsMainCondition = () => {
        if (!isOfferSentDefault) {
            return true
        }
        return !isOfferSentData.checkboxValue || areOfferChangesData.value === true
    }

    const isMainCondition = getIsMainCondition()

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

        const contractStepOfferSendingDate = !isOfferSentData.checkboxValue
            ? null
            : isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? DateTime.now()
            : prevStep?.contractStepOfferSendingDate || DateTime.now()

        const contractStepSentForVerificationDate = !sentForVerificationData.checkboxValue
            ? null
            : isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? DateTime.now()
            : prevStep?.contractStepSentForVerificationDate || DateTime.now()

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'contractStep',
            passedTo: prevStep!.passedTo,
            deadline: prevStep?.nextDeadline,
            supposedNextDeadline: DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            nextToPass: !isOfferSentDefault
                ? 'contractStep'
                : isOfferAcceptedData.value === false && rejectionReasonsData.check(false)
                ? 'lastDecisionStep'
                : 'contractCheckerStep',
            sendData: {
                order,
                contractStepAreOfferChanges: areOfferChangesData.value,
                contractStepOfferChangesComment: offerChangesData.textValue,
                contractStepIsOfferAccepted: isOfferAcceptedData.value,
                contractStepOfferSendingDate,
                contractStepOfferRejectionReason: rejectionReasonsData.value,
                contractStepSentForVerificationDate,
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
                            <CheckboxFormInput connection={isOfferSentData} disabled={isOfferSentDefault} />

                            {isOfferSentDefault && isOfferSentData.checkboxValue && (
                                <YesNoSelect
                                    connection={areOfferChangesData}
                                    disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                />
                            )}
                            {isOfferSentDefault && areOfferChangesData.value && (
                                <>
                                    {prevBranchOnProp && (
                                        <PrevBranchProp
                                            prevStepChangeStep={prevBranchOnProp}
                                            propName="contractStepOfferChangesComment"
                                        />
                                    )}
                                    <TextFormInput
                                        connection={offerChangesData}
                                        disabled={
                                            prevStep &&
                                            prevStep.passedTo !== 'contractStep' &&
                                            !(
                                                prevStep?.passedTo === 'offerStep' &&
                                                prevStep?.createdByStep === 'contractStep'
                                            )
                                        }
                                    />
                                </>
                            )}
                            {isOfferSentDefault && areOfferChangesData.value === false && (
                                <>
                                    <YesNoSelect
                                        connection={isOfferAcceptedData}
                                        disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                    />

                                    {isOfferAcceptedData.value && (
                                        <>
                                            <CheckboxFormInput
                                                connection={sentForVerificationData}
                                                disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                            />
                                        </>
                                    )}

                                    {isOfferAcceptedData.value === false && (
                                        <>
                                            <FormSelectWithOther
                                                connection={rejectionReasonsData}
                                                disabled={prevStep && prevStep.passedTo !== 'contractStep'}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            <SendButtonsWrapper visible={isOfferSentDefault}>
                                <NextPrevCheckbox
                                    connection={nextPrevCheckboxData}
                                    isMainCondition={isMainCondition}
                                    isCurrentStep={prevStep?.passedTo === 'contractStep'}
                                />
                            </SendButtonsWrapper>
                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateContractStep

// 449
