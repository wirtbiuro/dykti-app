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
import { submitForm, showErrorMessages, getBranchIdx, getPrevStepChangeStep, getBranchValues } from '../../utilities'
import { useFormInput } from '../../hooks/useFormInput'
import { useCalendarData } from '../../hooks/useCalendarData'
import { flushSync } from 'react-dom'
import useErrFn from '../../hooks/useErrFn'
import { Spin } from 'antd'
import { DateTime } from 'luxon'
import PrevBranchProp from '../PrevBranchProp'
import FormSelect from '../UI/FormSelect'
import { selectData } from '../../accessories/constants'
import { useFormSelect } from '../../hooks/useFormSelect'

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
        prevStepChangeStep,
        isNewBranchComparedByLastStepnameChange,
        isNewBranchComparedByPrevStep,
        prevBranchOnProp,
    } = getBranchValues({
        stepName: 'offerStep',
        order,
    })

    console.log({
        prevStep,
        branchIdx,
        prevStepChangeStep,
        isNewBranchComparedByLastStepnameChange,
        isNewBranchComparedByPrevStep,
        prevBranchOnProp,
    })

    const errFn = useErrFn()

    const areDocsGoodData = useFormSelect()
    const befCommentsData = useFormInput()
    const commentData = useFormInput()
    const isOfferReadyData = useFormInput()
    const offerDateData = useCalendarData()

    const sendButtonsOutputRef = useRef<ISendButtonsOutputRef>({
        getResults: () => {},
    })

    const [isFormChecked, setIsFormChecked] = useState<boolean>(false)
    const [isPrevFormChecked, setIsPrevFormChecked] = useState<boolean>(false)

    useEffect(() => {
        formCheck({ showMessage: false })
        prevFormCheck({ showMessage: false })
    }, [isOfferReadyData.isChecked, befCommentsData.isChecked])

    const formCheck: FormCheckType = ({ showMessage }) => {
        console.log('form check')

        if (!areDocsGoodData.isChecked) {
            console.log('areDocsGoodData error')
            showMessage ? areDocsGoodData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        if (!isOfferReadyData.isChecked) {
            console.log('isOfferReadyData error')
            showMessage ? isOfferReadyData?.showError!() : null
            setIsFormChecked(false)
            return false
        }

        console.log('form checked')

        setIsFormChecked(true)
        return true
    }

    const prevFormCheck: FormCheckType = ({ showMessage }) => {
        console.log('prev form check')

        if (!befCommentsData.isChecked) {
            showMessage ? befCommentsData.showError!() : null
            setIsPrevFormChecked(false)
            return false
        }

        console.log('prev form checked')

        setIsPrevFormChecked(true)
        return true
    }

    const isMainCondition = areDocsGoodData.value !== 'no'

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        const _createOrder = createOrder as (data: FieldsToSend) => void

        console.log(target)

        const areErrors = showErrorMessages({
            flushSync,
            formCheck,
            isFormChecked,
            isMainCondition,
            isPrevFormChecked,
            prevFormCheck,
            target,
        })

        // const isUncompletedNOTChecked = target.uncompleteCheckbox !== undefined && !target.uncompleteCheckbox.checked

        // const isNextChecked = target.nextCheckbox !== undefined && target.nextCheckbox.checked

        // const isPrevChecked = target.prevCheckbox !== undefined && target.prevCheckbox.checked

        // flushSync(() => {
        //     if (isNextChecked) formCheck({ showMessage: true })
        //     if (isPrevChecked) prevFormCheck({ showMessage: true })
        //     if (isUncompletedNOTChecked) {
        //         isMainCondition ? formCheck({ showMessage: true }) : prevFormCheck({ showMessage: true })
        //     }
        // })

        // if (
        //     (!isFormChecked && isNextChecked) ||
        //     (!isPrevFormChecked && isPrevChecked) ||
        //     (isUncompletedNOTChecked && (!isPrevFormChecked || !isFormChecked))
        // ) {
        //     console.log({ isFormChecked, isPrevFormChecked, isUncompletedNOTChecked, isNextChecked, isPrevChecked })
        //     return
        // }
        console.log('submit')

        if (areErrors) return

        setIsSpinning(true)

        await submitForm({
            branchIdx,
            prevStep: prevStep!,
            maxPromotion: prevStep!.maxPromotion,
            target,
            isMainCondition,
            curStepName: 'offerStep',
            passedTo: prevStep!.passedTo,
            formCheck,
            isFormChecked,
            user: userData,
            toPrevSendData: {
                order,
                offerStepAreBefDocsGood: false,
                // offerStepOfferDate: null,
                // offerStepComment: null,
                offerStepBefComments: befCommentsData.value,
                offerStepBefaringReturnDate: DateTime.now(),
                // beffaringStepDocsSendDate: null,
                // beffaringStepComment: null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            toNextSendData: {
                order,
                offerStepAreBefDocsGood:
                    areDocsGoodData.value === 'select' ? null : areDocsGoodData.value === 'yes' ? true : false,
                offerStepOfferDate: isNewBranchComparedByLastStepnameChange
                    ? DateTime.now()
                    : prevStep?.offerStepOfferDate,
                offerStepComment: commentData.value,
                offerStepBefComments: null,
                // beffaringStepDocsSendDate: null,
                ...sendButtonsOutputRef.current.getResults(),
            },
            createOrder: _createOrder,
            errFn,
        })

        setIsSpinning(false)
        setIsVisible!(false)
    }

    const disabled =
        prevStep &&
        prevStep?.passedTo !== 'offerStep' &&
        !(prevStep?.passedTo === 'contractStep' && prevStep?.createdByStep === 'offerStep')

    return (
        <Spin spinning={isSpinning}>
            {' '}
            <div style={{ display: isVisible ? 'block' : 'none' }}>
                <CreateFormStyled>
                    <FormStyled>
                        <form ref={formRef} onSubmit={submit}>
                            {/* <FormInput
                                type="checkbox"
                                connection={areDocsGoodData}
                                defaultChecked={
                                    typeof prevStep?.offerStepAreBefDocsGood === 'boolean'
                                        ? prevStep?.offerStepAreBefDocsGood
                                        : true
                                }
                                checkFn={(value) => value === true}
                            >
                                <>Dokumenty od Befaringowca są w porządku</>
                            </FormInput> */}

                            <FormSelect
                                options={selectData.standardSelect}
                                name="areDocsGood"
                                title="Dokumenty od Befaringowca są w porządku: "
                                connection={areDocsGoodData}
                                defaultValue={
                                    isNewBranchComparedByLastStepnameChange
                                        ? 'select'
                                        : typeof prevStep?.offerStepAreBefDocsGood !== 'boolean'
                                        ? 'select'
                                        : prevStep?.offerStepAreBefDocsGood
                                        ? 'yes'
                                        : 'no'
                                }
                                disabled={prevStep && prevStep?.passedTo !== 'offerStep'}
                            />

                            {areDocsGoodData.value === 'no' && (
                                <>
                                    <p>Co jest nie tak z dokumentami?: </p>
                                    {prevBranchOnProp && (
                                        <PrevBranchProp
                                            prevStepChangeStep={prevBranchOnProp}
                                            propName="offerStepBefComments"
                                        />
                                    )}
                                    <FormInput
                                        placeholder="Co jest nie tak z dokumentami."
                                        defaultValue={
                                            isNewBranchComparedByLastStepnameChange
                                                ? ''
                                                : prevStep?.offerStepBefComments
                                        }
                                        connection={befCommentsData}
                                        disabled={
                                            prevStep &&
                                            prevStep?.passedTo !== 'offerStep' &&
                                            !(
                                                prevStep?.passedTo === 'beffaringStep' &&
                                                prevStep?.createdByStep === 'offerStep'
                                            )
                                        }
                                    />
                                </>
                            )}
                            {areDocsGoodData.value === 'yes' && (
                                <>
                                    {/* <p>Data utworzenia oferty: </p>
                                    <CalendarWithTime
                                        defaultDate={order && prevStep?.offerStepOfferDate}
                                        connection={offerDateData}
                                        isTimeEnabled={false}
                                    /> */}
                                    <FormInput
                                        type="checkbox"
                                        connection={isOfferReadyData}
                                        defaultChecked={
                                            isNewBranchComparedByLastStepnameChange
                                                ? false
                                                : prevStep?.beffaringStepOfferDate
                                                ? true
                                                : false
                                        }
                                        checkFn={(value) => value === true}
                                        disabled={prevStep && prevStep?.passedTo !== 'offerStep'}
                                    >
                                        <>Oferta przygotowana</>
                                    </FormInput>

                                    <p>Komentarz: </p>
                                    {prevBranchOnProp && (
                                        <PrevBranchProp
                                            prevStepChangeStep={prevBranchOnProp}
                                            propName="offerStepComment"
                                        />
                                    )}
                                    <FormInput
                                        placeholder="komentarz"
                                        defaultValue={
                                            isNewBranchComparedByLastStepnameChange
                                                ? ''
                                                : prevStepChangeStep?.offerStepComment
                                        }
                                        connection={commentData}
                                        disabled={disabled}
                                    />
                                </>
                            )}
                            {/* {prevStep?.passedTo === 'offerStep' ||
                                (prevStep?.createdByStep === 'offerStep' &&
                                    (prevStep.passedTo === 'beffaringStep' || prevStep.passedTo === 'contractStep') && ( */}
                            <SendButtons
                                curStepName="offerStep"
                                maxPromotion={prevStep!.maxPromotion}
                                passedTo={prevStep!.passedTo}
                                dataRef={sendButtonsOutputRef}
                                isFormChecked={isFormChecked}
                                step={order?.steps[order.steps.length - 1]}
                                formCheck={formCheck}
                                isMainCondition={isMainCondition}
                                isPrevFormChecked={isPrevFormChecked}
                                prevFormCheck={prevFormCheck}
                            />
                            {/* ))} */}
                            {/* {prevStep?.passedTo === 'offerStep' ||
                                (prevStep?.createdByStep === 'offerStep' &&
                                    (prevStep.passedTo === 'beffaringStep' || prevStep.passedTo === 'contractStep') && ( */}
                            <input type="submit" value="Zapisz" />
                            {/* ))} */}
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            </div>
        </Spin>
    )
}

export default CreateOfferStep
