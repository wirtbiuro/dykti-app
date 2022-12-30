import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes, FieldsToSend } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, NullableFieldsToSend, mainSubmitForm } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { DateTime } from 'luxon'
import { workDayStartHours } from '../../accessories/constants'
import NextPrevCheckbox from '../components/NextPrevCheckbox'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import CheckboxFormInput from '../components/CheckboxFormInput'
import { useFormSelectWithOther } from '../../hooks/new/useFormSelectWithOther'
import FormSelectWithOther from '../components/FormSelectWithOther'
import { useYesNoSelect } from '../../hooks/new/useYesNoSelect'
import YesNoSelect from '../components/YesNoSelect'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateContractCreatorStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const [isSpinning, setIsSpinning] = useState(false)

    const formRef = useRef<FormElement>(null)

    const errFn = useErrFn()

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'contractCreatorStep',
        order,
    })

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const isContractSentDataInitValue = isNewBranchComparedByLastStepWhereSomethingWasChanged
        ? false
        : lastStepWhereSomethingWasChanged?.contractCreatorStepContractSendingDate
        ? true
        : false

    const isContractSentData = useCheckboxFormInput({
        title: 'Kontrakt wysłany',
        initialValue: isContractSentDataInitValue,
    })

    const isContractAcceptedData = useYesNoSelect({
        title: 'Kontrakt jest podpisany przez klienta?',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? null
            : prevStep?.contractCreatorStepIsContractAccepted,
    })

    const rejectionReasonData = useFormSelectWithOther({
        options: [
            ['select', 'Wybierz powód odrzucenia kontraktu'],
            ['time', 'Klient potrzebuje więcej czasu'],
            ['offer', 'Wymagane zmiany oferty'],
            ['contract', 'Wymagane zmiany kontraktu'],
            ['other', 'Inne'],
        ],
        title: 'Przyczyna odrzucenia kontraktu:',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? 'select'
            : prevStep?.contractCreatorStepContractRejectionReason,
    })

    useEffect(() => {
        if (isContractSentData.checkboxValue === false) {
            isContractAcceptedData.setValue(null)
            isContractAcceptedData.setErrorValue('')
        }
    }, [isContractSentData.checkboxValue])

    useEffect(() => {
        if (isContractAcceptedData.value !== true) {
            rejectionReasonData.formSelectData.setErrorValue('')
            rejectionReasonData.formSelectData.setValue('select')
        }
    }, [isContractAcceptedData.value])

    const isMainCondition = isContractAcceptedData.value !== false
    console.log({ isMainCondition })

    const nextCheck = (showMessage: boolean) => {
        if (!isContractSentData.check(showMessage)) {
            return false
        }
        if (!isContractAcceptedData.check(showMessage)) {
            return false
        }
        return true
    }

    const prevCheck = (showMessage: boolean) => {
        if (!rejectionReasonData.check(showMessage)) {
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

        const contractCreatorStepContractSendingDate = !isContractSentData.checkboxValue
            ? null
            : isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? DateTime.now()
            : prevStep?.contractCreatorStepContractSendingDate || DateTime.now()

        const data = {
            contractCreatorStepContractSendingDate,
            contractCreatorStepIsContractAccepted: isContractAcceptedData.value,
            contractCreatorStepContractRejectionReason: rejectionReasonData.value,
        }

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'contractCreatorStep',
            passedTo: prevStep!.passedTo,
            prevToPass:
                rejectionReasonData.value === 'time'
                    ? 'contractStep'
                    : rejectionReasonData.value === 'offer'
                    ? 'offerStep'
                    : rejectionReasonData.value === 'contract'
                    ? 'contractCheckerStep'
                    : 'lastDecisionStep',
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
                            <>
                                <CheckboxFormInput connection={isContractSentData} />

                                {isContractSentData.checkboxValue && (
                                    <YesNoSelect connection={isContractAcceptedData} />
                                )}

                                {isContractAcceptedData.value === false && (
                                    <FormSelectWithOther connection={rejectionReasonData} />
                                )}
                            </>

                            <NextPrevCheckbox
                                connection={nextPrevCheckboxData}
                                isMainCondition={isMainCondition}
                                isCurrentStep={prevStep?.passedTo === 'contractCreatorStep'}
                            />

                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateContractCreatorStep

// 350
