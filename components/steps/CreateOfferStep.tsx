import React, { SyntheticEvent, useRef, useState, FC, useEffect } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { WithValueNFocus, IWithOrder, ISendCheckboxes } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import { getBranchValues, NullableFieldsToSend, mainSubmitForm } from '../../utilities'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { DateTime } from 'luxon'
import PrevBranchProp from '../PrevBranchProp'
import { workDayStartHours } from '../../accessories/constants'
import { useCheckboxFormInput } from '../../hooks/new/useCheckboxFormInput'
import CheckboxFormInput from '../components/CheckboxFormInput'
import { useYesNoSelect } from '../../hooks/new/useYesNoSelect'
import YesNoSelect from '../components/YesNoSelect'
import TextFormInput from '../components/TextFormInput'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import NextPrevCheckbox from '../components/NextPrevCheckbox'

type FormType = WithValueNFocus<ISendCheckboxes>
type FormElement = HTMLFormElement & FormType

const CreateOfferStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()
    const [isSpinning, setIsSpinning] = useState(false)

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const formRef = useRef<FormElement>(null)

    const {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        isNewBranchComparedByPrevStep,
        prevBranchOnProp,
        globalStepWhereLastTransitionWas,
    } = getBranchValues({
        stepName: 'offerStep',
        order,
    })

    console.log({
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        isNewBranchComparedByPrevStep,
        prevBranchOnProp,
        globalStepWhereLastTransitionWas,
    })

    const errFn = useErrFn()

    const areDocsGoodData = useYesNoSelect({
        title: 'Dokumenty od Befaringowca są w porządku:',
        initialValue:
            // isNewBranchComparedByLastStepWhereSomethingWasChanged
            //     ? null
            //     :
            prevStep?.offerStepAreBefDocsGood || null,
    })

    const befCommentsData = useTextFormInput({
        title: 'Co jest nie tak z dokumentami:',
        placeholder: 'co jest nie tak z dokumentami',
        initialTextValue: isNewBranchComparedByLastStepWhereSomethingWasChanged ? '' : prevStep?.offerStepBefComments,
    })

    const isOfferReadyData = useCheckboxFormInput({
        title: 'Oferta przygotowana',
        initialValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? false
            : prevStep?.beffaringStepOfferDate
            ? true
            : false,
    })

    const commentData = useTextFormInput({
        title: 'Komentarz:',
        placeholder: 'komentarz',
        initialTextValue: isNewBranchComparedByLastStepWhereSomethingWasChanged
            ? ''
            : lastStepWhereSomethingWasChanged?.offerStepComment,
    })

    const nextPrevCheckboxData = useCheckboxFormInput({
        initialValue: true,
    })

    const isMainCondition = areDocsGoodData.value !== false

    useEffect(() => {
        if (areDocsGoodData.value || areDocsGoodData.value === null) {
            befCommentsData.setTextValue('')
            befCommentsData.setErrorValue('')
        }
        if (!areDocsGoodData.value) {
            isOfferReadyData.setCheckboxValue(false)
            isOfferReadyData.setErrorValue('')
            commentData.setTextValue('')
            commentData.setErrorValue('')
        }
    }, [areDocsGoodData.value])

    const nextCheck = (showMessage: boolean) => {
        if (!areDocsGoodData.check(showMessage)) {
            return false
        }
        if (!isOfferReadyData.check(showMessage)) {
            return false
        }
        return true
    }

    const prevCheck = (showMessage: boolean) => {
        if (!befCommentsData.check(showMessage)) {
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

        setIsSpinning(true)

        await mainSubmitForm({
            branchIdx,
            prevStep: prevStep!,
            user: userData,
            maxPromotion: prevStep!.maxPromotion,
            isNextPrevChecked: nextPrevCheckboxData.check(false),
            isMainCondition,
            curStepName: 'offerStep',
            passedTo: prevStep!.passedTo,
            deadline: prevStep?.nextDeadline,
            supposedNextDeadline: DateTime.now().endOf('day').plus({ days: 1, hours: workDayStartHours, minutes: 1 }),
            sendData: {
                order,
                offerStepAreBefDocsGood: areDocsGoodData.value,
                offerStepOfferDate: !isOfferReadyData.checkboxValue
                    ? null
                    : isNewBranchComparedByLastStepWhereSomethingWasChanged
                    ? DateTime.now()
                    : prevStep?.offerStepOfferDate,
                offerStepComment: commentData.textValue,
                offerStepBefComments: befCommentsData.textValue,
                offerStepBefaringReturnDate: isMainCondition ? null : DateTime.now(),
            },
            createOrder: _createOrder,
            errFn,
        })

        console.log('submit end')

        setIsVisible!(false)
        setIsSpinning(false)
    }

    const enabled = {
        areDocsGood:
            globalStepWhereLastTransitionWas?.createdByStep === 'beffaringStep' &&
            globalStepWhereLastTransitionWas.passedTo === 'offerStep',
        befComments:
            areDocsGoodData.value === false &&
            (globalStepWhereLastTransitionWas?.passedTo === 'offerStep' ||
                (prevStep?.passedTo === 'beffaringStep' && prevStep.createdByStep === 'offerStep')),
        isOfferReady: areDocsGoodData.value === true && globalStepWhereLastTransitionWas?.passedTo === 'offerStep',
        comment:
            areDocsGoodData.value &&
            (globalStepWhereLastTransitionWas?.passedTo === 'offerStep' ||
                (prevStep?.passedTo === 'contractStep' && prevStep.createdByStep === 'offerStep')),
    }

    const isSendEnabled = enabled.areDocsGood || enabled.befComments || enabled.isOfferReady || enabled.comment

    return (
        <Spin spinning={isSpinning}>
            {' '}
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={onSubmit}>
                            <YesNoSelect connection={areDocsGoodData} disabled={!enabled.areDocsGood} />

                            {areDocsGoodData.value === false && (
                                <>
                                    {prevBranchOnProp && (
                                        <PrevBranchProp
                                            prevStepChangeStep={prevBranchOnProp}
                                            propName="offerStepBefComments"
                                        />
                                    )}

                                    <TextFormInput connection={befCommentsData} disabled={enabled.befComments} />
                                </>
                            )}
                            {areDocsGoodData.value === true && (
                                <>
                                    <CheckboxFormInput connection={isOfferReadyData} disabled={!enabled.isOfferReady} />

                                    {prevBranchOnProp && (
                                        <PrevBranchProp
                                            prevStepChangeStep={prevBranchOnProp}
                                            propName="offerStepComment"
                                        />
                                    )}

                                    <TextFormInput connection={commentData} disabled={!enabled.comment} />
                                </>
                            )}

                            {isSendEnabled && (
                                <>
                                    <NextPrevCheckbox
                                        connection={nextPrevCheckboxData}
                                        isMainCondition={isMainCondition}
                                        isCurrentStep={prevStep?.passedTo === 'offerStep'}
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

export default CreateOfferStep

//330
