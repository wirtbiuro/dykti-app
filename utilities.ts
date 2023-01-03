import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import {
    IWorker,
    IServerControllerError,
    PropNames,
    StepType,
    Role,
    StepName,
    WithValueNFocus,
    ISendCheckboxes,
    FormCheckType,
    FieldsToSend,
    stepNames,
    StepNames,
    IOrder,
    stepNamesRelations,
    roleTitles,
    getStepNames,
    CheckStepPropErrorsType,
} from './types'
import { ServerController } from './server-controller'
import { SyntheticEvent } from 'react'
import { dyktiApi } from './state/apiSlice'
import { Modal } from 'antd'
import { DateTime } from 'luxon'
import { selectData, fieldNames } from './accessories/constants'
import { User } from '@prisma/client'
var cookie = require('cookie')
var jwt = require('jsonwebtoken')

interface NextApiRequestWithHeaders extends NextApiRequest {
    headers: any
}

export const withJwt = (fn: Function) => (req: NextApiRequestWithHeaders, res: NextApiResponse) => {
    const cookies = cookie.parse(req.headers.cookie || '')
    // const cookies = cookie.parse(req.cookies || '')
    console.log({ cookies })
    const token = cookies.token || ''

    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log({ decoded })
        req.body = { ...req.body, userId: decoded.userId }
        return fn(req, res)
    } catch (err) {
        // err
        console.log({ err })
        return res.status(401).json({ message: 'No access' })
    }
}

export const withTokensCheck = async ({ cb, err }: { cb: Function; err: (error: IServerControllerError) => void }) => {
    try {
        console.log('withTokensCheck')
        await cb()
    } catch (error) {
        try {
            console.log('withTokensCheck first error handling')
            await ServerController.getTokens()
            await cb()
        } catch (error) {
            err(error as IServerControllerError)
        }
    }
}

export const withRtkQueryTokensCheck = async ({
    cb,
    err,
}: {
    cb: Function
    err: (error: IServerControllerError) => void
}) => {
    console.log('withTokensCheck', cb)
    const res = await cb()
    console.log({ res })
    if (res?.error) {
        try {
            console.log('withTokensCheck first error handling')
            await ServerController.getTokens()
            const _res = await cb()
            if (_res.error) {
                err(_res.error)
            }
        } catch (error) {
            err(error as IServerControllerError)
        }
    }
}

export const showErrorFormModal = ({
    element,
    errElement,
    modal,
    onOk,
    content = 'Aby przekazać sprawę dalej, musisz wypełnić wymagane pola.',
    errDescription = 'Pole wymagane',
}: {
    element: HTMLInputElement | HTMLSelectElement
    errElement: HTMLDivElement
    modal: any
    onOk?: Function
    content?: string
    errDescription?: string
}) =>
    modal.error({
        content,
        onOk: () => {
            if (onOk) {
                return onOk()
            }
            element.focus()
            errElement.innerHTML = errDescription
        },
    })

// interface IgetOrderStatusTypeProps {
//     curStepName?: StepName
//     prevStepName?: StepName
//     step?: StepType
// }

// type getOrderStatusType = ({}: IgetOrderStatusTypeProps) => {
//     isCurrent: boolean
//     isEdit: boolean
//     isProceedToNext: boolean
//     isProceedToEdit: boolean
// }

// export const getOrderStatus: getOrderStatusType = ({
//     curStepName,
//     prevStepName,
//     step,
// }) => {
//     const curStepIsProceedToNextName = `${curStepName}IsProceedToNext` as PropNames<
//         StepType
//     >

//     const prevStepIsProceedToNextName = `${prevStepName}IsProceedToNext` as PropNames<
//         StepType
//     >

//     const curStepIsCompletedName = `${curStepName}IsCompleted` as PropNames<
//         StepType
//     >

//     const prevStepIsCompletedName = `${prevStepName}IsCompleted` as PropNames<
//         StepType
//     >

//     const curStepIsProceedToNext = step?.[curStepIsProceedToNextName] as boolean
//     const prevStepIsProceedToNext = step?.[
//         prevStepIsProceedToNextName
//     ] as boolean
//     const curStepIsCompleted = step?.[curStepIsCompletedName] as boolean
//     const prevStepIsCompleted = step?.[prevStepIsCompletedName] as boolean

//     const isCurrent =
//         prevStepIsProceedToNext &&
//         prevStepIsCompleted &&
//         !curStepIsProceedToNext &&
//         !curStepIsCompleted
//     const isEdit =
//         prevStepIsProceedToNext &&
//         prevStepIsCompleted &&
//         curStepIsProceedToNext &&
//         !curStepIsCompleted
//     const isProceedToNext =
//         prevStepIsProceedToNext &&
//         prevStepIsCompleted &&
//         curStepIsProceedToNext &&
//         curStepIsCompleted
//     const isProceedToEdit =
//         prevStepIsProceedToNext &&
//         !prevStepIsCompleted &&
//         !curStepIsProceedToNext &&
//         !curStepIsCompleted
//     return { isCurrent, isEdit, isProceedToNext, isProceedToEdit }
// }

interface IgetOrderStatusTypeProps {
    curStepName: StepName
    passedTo: StepName
    maxPromotion: StepName
}

type getOrderStatusType = ({}: IgetOrderStatusTypeProps) => {
    isCurrent: boolean
    isEdit: boolean
    isProceedToNext: boolean
    isProceedToEdit: boolean
}

export const getOrderStatus: getOrderStatusType = ({ curStepName, passedTo, maxPromotion }) => {
    let isCurrent = false
    let isEdit = false
    let isProceedToNext = false
    let isProceedToEdit = false

    if (curStepName === passedTo && curStepName === maxPromotion) {
        isCurrent = true
    } else if (curStepName === passedTo && curStepName !== maxPromotion) {
        isEdit = true
    } else if (getArrIdx(curStepName, stepNames) < getArrIdx(passedTo, stepNames)) {
        isProceedToNext = true
    } else {
        isProceedToEdit = true
    }
    console.log({ isCurrent, isEdit, isProceedToEdit, isProceedToNext })
    return { isCurrent, isEdit, isProceedToEdit, isProceedToNext }
}

export function getArrIdx(value: StepName, arr: StepNames): number {
    for (let index = 0; index < arr.length; index++) {
        if (value === arr[index]) return index
    }
    return -1
}

export function getNextStepName(value: StepName): StepName {
    const idx = getArrIdx(value, stepNames)
    console.log('getNextStepName idx', idx)
    return stepNames[idx + 1] ?? stepNames[idx]
}

export function getPrevStepName(value: StepName): StepName {
    const idx = getArrIdx(value, stepNames)
    console.log('getPrevStepName idx', idx)
    return stepNames[idx - 1] ?? stepNames[idx]
}

export function getMaxPromotion(value: StepName, maxPromotion: StepName): StepName {
    const idx = getArrIdx(value, stepNames)
    const maxIdx = getArrIdx(maxPromotion, stepNames)
    return maxIdx > idx ? maxPromotion : value
}

type GetPassedToType = ({}: IGetPassedToTypeProps) => StepName

interface IGetPassedToTypeProps {
    isMainCondition: boolean
    isCurrentOrEdit: boolean
    target: EventTarget & WithValueNFocus<ISendCheckboxes>
    nextToPass?: StepName
    curStepName: StepName
    passedTo: StepName
    prevToPass?: StepName
}

export const getPassedTo: GetPassedToType = ({
    isMainCondition,
    isCurrentOrEdit,
    target,
    nextToPass,
    curStepName,
    passedTo,
    prevToPass,
}) => {
    console.log({
        isMainCondition,
        isCurrentOrEdit,
        target,
        nextToPass,
        curStepName,
        passedTo,
        prevToPass,
        'target.prevCheckbox?.checked': target.prevCheckbox?.checked,
    })
    if (curStepName === 'lastDecisionStep') {
        return nextToPass || 'lastDecisionStep'
    }
    const _passedTo = isMainCondition
        ? isCurrentOrEdit
            ? target.nextCheckbox?.checked
                ? nextToPass || getNextStepName(curStepName)
                : curStepName
            : passedTo
        : isCurrentOrEdit
        ? target.prevCheckbox?.checked
            ? prevToPass || getPrevStepName(curStepName)
            : curStepName
        : passedTo

    console.log({ _passedTo })
    return _passedTo
}

interface _IGetPassedToTypeProps {
    isMainCondition: boolean
    isCurrentOrEdit: boolean
    isNextPrevChecked: boolean
    nextToPass?: StepName
    curStepName: StepName
    passedTo: StepName
    prevToPass?: StepName
}

type _GetPassedToType = ({}: _IGetPassedToTypeProps) => StepName

export const _getPassedTo: _GetPassedToType = ({
    isMainCondition,
    isCurrentOrEdit,
    isNextPrevChecked,
    nextToPass,
    curStepName,
    passedTo,
    prevToPass,
}) => {
    if (curStepName === 'lastDecisionStep') {
        return nextToPass || 'lastDecisionStep'
    }
    const _passedTo = isMainCondition
        ? isCurrentOrEdit
            ? isNextPrevChecked
                ? nextToPass || getNextStepName(curStepName)
                : curStepName
            : passedTo
        : isCurrentOrEdit
        ? isNextPrevChecked
            ? prevToPass || getPrevStepName(curStepName)
            : curStepName
        : passedTo

    return _passedTo
}

type GetNextDeadlineType = ({}: IGetNextDeadlineProps) => string | DateTime | null | undefined

interface IGetNextDeadlineProps {
    deadline: string | DateTime | null | undefined
    supposedNextDeadline: string | DateTime | null | undefined
    isCurrentOrEdit: boolean
    target: EventTarget & WithValueNFocus<ISendCheckboxes>
}

export const getNextDeadline: GetNextDeadlineType = ({ deadline, supposedNextDeadline, isCurrentOrEdit, target }) => {
    console.log({ deadline, supposedNextDeadline, isCurrentOrEdit, target })
    const nextDeadline: string | DateTime | null | undefined = isCurrentOrEdit
        ? target.nextCheckbox?.checked
            ? supposedNextDeadline
            : deadline
        : deadline

    return nextDeadline
}

type _GetNextDeadlineType = ({}: _IGetNextDeadlineProps) => string | DateTime | null | undefined

interface _IGetNextDeadlineProps {
    deadline: string | DateTime | null | undefined
    supposedNextDeadline: string | DateTime | null | undefined
    isCurrentOrEdit: boolean
    isNextPrevChecked: boolean
}

export const _getNextDeadline: _GetNextDeadlineType = ({
    deadline,
    supposedNextDeadline,
    isCurrentOrEdit,
    isNextPrevChecked,
}) => {
    const nextDeadline: string | DateTime | null | undefined = isCurrentOrEdit
        ? isNextPrevChecked
            ? supposedNextDeadline
            : deadline
        : deadline

    return nextDeadline
}

type GetFirstStepOrderStatusType = ({}: {
    curStepName?: StepName
    step?: StepType
}) => {
    isCurrent: boolean
    isEdit: boolean
    isProceedToNext: boolean
    isProceedToEdit: false
}

export const getFirstStepOrderStatus: GetFirstStepOrderStatusType = ({ curStepName, step }) => {
    const curStepIsProceedToNextName = `${curStepName}IsProceedToNext` as PropNames<StepType>

    const curStepIsCompletedName = `${curStepName}IsCompleted` as PropNames<StepType>

    const curStepIsProceedToNext = step?.[curStepIsProceedToNextName] as boolean
    const curStepIsCompleted = step?.[curStepIsCompletedName] as boolean

    const isCurrent = !curStepIsProceedToNext && !curStepIsCompleted
    const isEdit = curStepIsProceedToNext && !curStepIsCompleted
    const isProceedToNext = curStepIsProceedToNext && curStepIsCompleted

    return { isCurrent, isEdit, isProceedToNext, isProceedToEdit: false }
}

interface IGetUnactiveStepnamesTypes {
    passedTo: StepName
    returnStep: StepName | null
}

export const getUnactiveStepnames = ({ passedTo, returnStep }: IGetUnactiveStepnamesTypes): StepName[] => {
    const stepNames = getStepNames(stepNamesRelations)

    // console.log('getUnactiveStepnames')
    // console.log({ passedTo, returnStep })

    const passedToIdx = stepNames.findIndex((stepName) => stepName === passedTo)
    const returnStepIdx = stepNames.findIndex((stepName) => stepName === returnStep)

    return stepNames.filter((stepName, idx) => {
        return (returnStep === stepName && returnStep === passedTo) || (passedToIdx <= idx && idx < returnStepIdx)
    })
}

export const getPrevStepnames = (stepName: StepName): StepName[] => {
    const stepNames = getStepNames(stepNamesRelations)
    const stepNameIdx = stepNames.findIndex((_stepName) => stepName === _stepName)
    return stepNames.filter((_stepName, idx) => {
        return idx < stepNameIdx
    })
}

interface IResetPrevProps {
    curStepName: StepName
    prevToPass?: StepName
    step: StepType
}

export const resetPrevProps = ({ curStepName, prevToPass, step }: IResetPrevProps): StepType => {
    let key: keyof typeof step
    const resetValues: any = {}
    const stepNames = getStepNames(stepNamesRelations)
    const curStepNameIdx = stepNames.findIndex((stepName) => stepName === curStepName)
    const _prevToPass = prevToPass || getPrevStepName(curStepName)
    const prevToPassIdx = stepNames.findIndex((stepName) => stepName === _prevToPass)
    const resetStepnames = stepNames.filter((stepName, idx) => {
        return idx >= prevToPassIdx || idx < curStepNameIdx
    })
    for (key in step) {
        if (step.hasOwnProperty(key)) {
            resetStepnames.forEach((stepName) => {
                if (stepName.includes(key)) {
                    resetValues[key] = null
                }
            })
        }
    }
    return resetValues
}

interface IGetReturnStepProps {
    isMainCondition: boolean
    createdByStep: StepName
    passedTo: StepName
    prevReturnStep: StepName | null
}

export const getReturnStep = ({
    isMainCondition,
    createdByStep,
    passedTo,
    prevReturnStep,
}: IGetReturnStepProps): StepName | null => {
    console.log('getReturnStep')
    console.log({ isMainCondition, createdByStep, passedTo, prevReturnStep })
    if (!isMainCondition && createdByStep !== passedTo) {
        console.log('returnStep', createdByStep)
        return createdByStep
    }
    if (isMainCondition && createdByStep === prevReturnStep && createdByStep !== passedTo) {
        console.log('returnStep', 'null')
        return null
    }
    return prevReturnStep
}

interface ISubmitFormProps {
    prevStep: StepType
    target: EventTarget & WithValueNFocus<ISendCheckboxes>
    isMainCondition: boolean
    curStepName: StepName
    maxPromotion: StepName
    passedTo: StepName
    user: Partial<User>
    nextToPass?: StepName
    prevToPass?: StepName
    formCheck?: FormCheckType
    prevFormCheck?: FormCheckType
    isFormChecked?: boolean
    isPrevFormChecked?: boolean
    toPrevSendData?: FieldsToSend
    toNextSendData: FieldsToSend
    createOrder: (data: FieldsToSend) => void
    errFn: (error: IServerControllerError) => void
    branchIdx?: number
    deadline?: DateTime | string | null
    supposedNextDeadline?: DateTime | string | null
}

type SubmitFormType = ({}: ISubmitFormProps) => Promise<void>

export const submitForm: SubmitFormType = async ({
    prevStep,
    target,
    isMainCondition,
    curStepName,
    maxPromotion,
    passedTo,
    user,
    nextToPass,
    prevToPass,
    toNextSendData,
    toPrevSendData = {},
    createOrder,
    isPrevFormChecked,
    prevFormCheck = () => {},
    errFn,
    branchIdx = 0,
    deadline = null,
    supposedNextDeadline = null,
}) => {
    const { isCurrent, isEdit, isProceedToNext, isProceedToEdit } = getOrderStatus({
        curStepName,
        maxPromotion,
        passedTo,
    })
    const isCurrentOrEdit = isCurrent || isEdit

    console.log('submitForm', isMainCondition)
    console.log({ toPrevSendData })

    const nextDeadline = getNextDeadline({ deadline, supposedNextDeadline, isCurrentOrEdit, target })

    const _passedTo = getPassedTo({
        nextToPass,
        target,
        isMainCondition,
        curStepName,
        isCurrentOrEdit,
        passedTo,
        prevToPass,
    })

    const returnStep = getReturnStep({
        isMainCondition,
        createdByStep: curStepName,
        passedTo: _passedTo,
        prevReturnStep: prevStep?.returnStep,
    })

    console.log({ returnStep })
    const _maxPromotion = getMaxPromotion(_passedTo, maxPromotion)
    const shouldConfirmView = _passedTo !== curStepName
    console.log({ shouldConfirmView, _passedTo, curStepName })

    // let branchIdx = prevStep?.branchIdx || 0
    // if (!isMainCondition && curStepName !== _passedTo) {
    //     branchIdx = branchIdx + 1
    // }

    // console.log({ branchIdx })

    const _options = {
        passedTo: _passedTo,
        maxPromotion: _maxPromotion,
        shouldConfirmView,
        createdByStep: curStepName,
        stepCreatorId: user.id,
        userRoles: user.role as Role[],
        returnStep,
        branchIdx,
        deadline,
        nextDeadline,
    }

    console.log({ _options })

    const submit = isMainCondition ? submitToNext : submitToPrev

    await withRtkQueryTokensCheck({
        cb: submit,
        err: errFn,
    })

    async function submitToNext() {
        return await createOrder({ ...toNextSendData, ..._options })
    }

    async function submitToPrev() {
        return await createOrder({ ...toPrevSendData, ..._options })
    }
}

type Nullable<T> = {
    [P in keyof T]?: T[P] | null
}

export type NullableFieldsToSend = Nullable<FieldsToSend>

interface _ISubmitFormProps {
    prevStep: StepType
    isMainCondition: boolean
    curStepName: StepName
    maxPromotion: StepName
    passedTo: StepName
    user: Partial<User>
    nextToPass?: StepName
    prevToPass?: StepName
    formCheck?: FormCheckType
    isNextPrevChecked: boolean
    isFormChecked?: boolean
    isPrevFormChecked?: boolean
    sendData: NullableFieldsToSend
    createOrder: (data: NullableFieldsToSend) => void
    errFn: (error: IServerControllerError) => void
    branchIdx?: number
    deadline?: DateTime | string | null
    supposedNextDeadline?: DateTime | string | null
}

type _SubmitFormType = ({}: _ISubmitFormProps) => Promise<void>

export const mainSubmitForm: _SubmitFormType = async ({
    prevStep,
    isMainCondition,
    curStepName,
    maxPromotion,
    passedTo,
    user,
    nextToPass,
    prevToPass,
    sendData,
    createOrder,
    isNextPrevChecked,
    errFn,
    branchIdx = 0,
    deadline = null,
    supposedNextDeadline = null,
}) => {
    const { isCurrent, isEdit } = getOrderStatus({
        curStepName,
        maxPromotion,
        passedTo,
    })
    const isCurrentOrEdit = isCurrent || isEdit

    const nextDeadline = _getNextDeadline({ deadline, supposedNextDeadline, isCurrentOrEdit, isNextPrevChecked })

    const _passedTo = _getPassedTo({
        nextToPass,
        isNextPrevChecked,
        isMainCondition,
        curStepName,
        isCurrentOrEdit,
        passedTo,
        prevToPass,
    })

    const returnStep = getReturnStep({
        isMainCondition,
        createdByStep: curStepName,
        passedTo: _passedTo,
        prevReturnStep: prevStep?.returnStep,
    })

    const _maxPromotion = getMaxPromotion(_passedTo, maxPromotion)
    const shouldConfirmView = _passedTo !== curStepName

    const _options = {
        passedTo: _passedTo,
        maxPromotion: _maxPromotion,
        shouldConfirmView,
        createdByStep: curStepName,
        stepCreatorId: user.id,
        userRoles: user.role as Role[],
        returnStep,
        branchIdx,
        deadline,
        nextDeadline,
    }

    console.log({ _options })

    await withRtkQueryTokensCheck({
        cb: submit,
        err: errFn,
    })

    async function submit() {
        return await createOrder({ ...sendData, ..._options })
    }
}

type SubmitFirstFormPropsType = Omit<
    ISubmitFormProps,
    'isMainCondition' | 'prevStepName' | 'toPrevSendData' | 'isPrevFormChecked' | 'prevFormCheck'
>

type SubmitFirstFormType = ({}: SubmitFirstFormPropsType) => Promise<void>

// export const submitFirstForm: SubmitFirstFormType = async ({
//     target,
//     curStepName,
//     formCheck,
//     isFormChecked,
//     step,
//     toNextSendData,
//     createOrder,
// }) => {
//     const { isCurrent, isProceedToNext, isEdit } = getFirstStepOrderStatus({
//         step,
//         curStepName,
//     })

//     submitToNext()

//     async function submitToNext() {
//         console.log('submit')
//         if (
//             (isCurrent || isEdit) &&
//             target.nextCheckbox?.checked &&
//             !isFormChecked
//         ) {
//             return formCheck({ showMessage: true })
//         }

//         if (
//             isProceedToNext &&
//             !target.uncompleteCheckbox?.checked &&
//             !isFormChecked
//         ) {
//             return formCheck({ showMessage: true })
//         }
//         console.log({ toNextSendData })
//         createOrder(toNextSendData)
//     }
// }

export const initOutputRef = () => ({
    check: () => {},
    getValue: () => {},
    setValue: () => {},
    showError: () => {},
    getErrTitleElement: () => {},
})

type getWhereStrategyByStepsType = (prevStepName: StepName, curStepName: StepName, isCompleted: boolean) => {}

export const getWhereStrategyBySteps: getWhereStrategyByStepsType = (prevStepName, curStepName, isCompleted) => {
    return isCompleted
        ? {
              some: {
                  [`${curStepName}IsProceedToNext`]: true,
              },
          }
        : {
              some: {
                  [`${prevStepName}IsProceedToNext`]: true,
              },
              none: {
                  [`${prevStepName}IsProceedToNext`]: true,
                  [`${curStepName}IsProceedToNext`]: true,
              },
          }
}

interface IshowErrorMessagesProps {
    target: EventTarget & WithValueNFocus<ISendCheckboxes>
    flushSync: Function
    formCheck: ({ showMessage }: { showMessage: boolean }) => boolean
    prevFormCheck?: ({ showMessage }: { showMessage: boolean }) => boolean
    isMainCondition: boolean
    isFormChecked: boolean
    isPrevFormChecked?: boolean
}

type ShowErrorMessagesTypes = ({}: IshowErrorMessagesProps) => boolean

export const showErrorMessages: ShowErrorMessagesTypes = ({
    target,
    flushSync,
    formCheck,
    prevFormCheck = () => true,
    isMainCondition,
    isPrevFormChecked = false,
    isFormChecked,
}) => {
    const isUncompletedNOTChecked = target.uncompleteCheckbox !== undefined && !target.uncompleteCheckbox.checked

    const isNextChecked = target.nextCheckbox !== undefined && target.nextCheckbox.checked

    const isPrevChecked = target.prevCheckbox !== undefined && target.prevCheckbox.checked

    console.log({ isUncompletedNOTChecked, isNextChecked, isPrevChecked })

    if (isNextChecked) {
        const isFormChecked = formCheck({ showMessage: true })
        console.log({ isFormChecked })
        return !isFormChecked
    }
    if (isPrevChecked) return !prevFormCheck({ showMessage: true })
    if (isUncompletedNOTChecked) {
        return isMainCondition ? !formCheck({ showMessage: true }) : !prevFormCheck({ showMessage: true })
    }

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
    //     (isUncompletedNOTChecked && (isMainCondition ? !isFormChecked : !isPrevFormChecked))
    // ) {
    //     console.log({
    //         isFormChecked,
    //         isPrevFormChecked,
    //         isUncompletedNOTChecked,
    //         isNextChecked,
    //         isPrevChecked,
    //         isMainCondition,
    //     })
    //     return true
    // }
    console.log('submit')
    return false
}

type GetDatasType = ({}: IgetDatasProps) => {
    completedOrdersData: IOrder[]
    passedForEditData: IOrder[]
    currentData: IOrder[]
    editedOrdersData: IOrder[]
    currentOrEditedOrdersData: IOrder[]
}

interface IgetDatasProps {
    data: IOrder[]
    currentStep: StepName
}

export const getDatas: GetDatasType = ({ data, currentStep }) => {
    // console.log({ data, currentStep })
    const completedOrdersData = data?.filter((order) => {
        const lastStep = order.steps[order.steps.length - 1]
        return getArrIdx(lastStep.passedTo!, stepNames) - getArrIdx(currentStep, stepNames) > 0
    })
    const passedForEditData = data?.filter((order) => {
        const lastStep = order.steps[order.steps.length - 1]
        return getArrIdx(lastStep.passedTo!, stepNames) - getArrIdx(currentStep, stepNames) < 0
    })
    const currentData = data?.filter((order) => {
        const lastStep = order.steps[order.steps.length - 1]
        return lastStep.passedTo === currentStep && lastStep.maxPromotion === currentStep
    })
    const editedOrdersData = data?.filter((order) => {
        const lastStep = order.steps[order.steps.length - 1]
        return lastStep.passedTo === currentStep && lastStep.maxPromotion !== currentStep
    })
    const currentOrEditedOrdersData = data?.filter((order) => {
        const lastStep = order.steps[order.steps.length - 1]
        return lastStep.passedTo === currentStep
    })

    return { completedOrdersData, passedForEditData, currentData, editedOrdersData, currentOrEditedOrdersData }
}

export const getStepPropValue: (step: StepType, prop: keyof StepType) => any = (step, prop) => {
    const key = prop
    let value = step[key]
    if (value === null) value = '-'
    if (value === '') value = '-'
    if (value === true) value = 'tak'
    if (value === false) value = 'nie'

    if (typeof value === 'string') {
        if (DateTime.fromISO(value).toString() !== 'Invalid DateTime') {
            // const dateFormat = ['formStepMeetingDate', 'createdAt', 'beffaringStepDocsSendDate'].includes(key)
            //     ? 'dd.MM.yyyy HH:mm'
            //     : 'dd.MM.yyyy'
            const dateFormat = 'dd.MM.yyyy HH:mm'
            value = DateTime.fromISO(value).toFormat(dateFormat)
        }
    }

    if (key === 'workStepTeam') {
        const _value = (value as IWorker[]) || []
        value = _value.map((worker: IWorker) => worker.name).join('; ')
    }

    if (['passedTo', 'maxPromotion', 'createdByStep', 'returnStep'].includes(key)) {
        const relation = stepNamesRelations.find((relation) => relation[1] === value)
        if (relation) {
            const role = relation[0]
            value = roleTitles[role]
        }
    }

    if (
        [
            // 'workStepTeam',
            'questionnaireStepDissatisfaction',
            'questionnaireStepSatisfaction',
            'referenceStepReferenceLocation',
            'contractStepOfferRejectionReason',
        ].includes(key)
    ) {
        type keyType = keyof typeof selectData
        const _value = value as string
        const values = _value.split('; ')
        let _values: string[] = []

        values.map((value) => {
            const row = selectData[key as keyType].find((row) => row[0] === value)
            if (row) _values.push(row[1])
        })
        value = _values.join('; ')
    }
    return value
}

export const getStepProps = (step: StepType) => {
    const stepProps: {
        key: keyof typeof step
        fieldName: string
        view: string
        value: any
    }[] = []

    let key: keyof typeof step

    for (key in step) {
        if (step.hasOwnProperty(key)) {
            if (['stepCreatorId', 'currentOrder'].includes(key)) {
                continue
            }

            const value = getStepPropValue(step, key)

            stepProps.push({
                key,
                fieldName: fieldNames[key],
                view: value as string,
                value: step[key],
            })
        }
    }
    return stepProps
}

export const getEdgeDayMillis = (isoString: string): number => {
    return DateTime.fromISO(isoString)
        .setZone('Europe/Warsaw')
        .endOf('day')
        .plus({ day: 1 })
        .plus({ hour: 8 })
        .toMillis()
}

const isStepnameInPrevStepnames = (step: StepType, stepname: StepName): boolean =>
    getPrevStepnames(step.passedTo).includes(stepname)

export const isStepPropErrors: CheckStepPropErrorsType = {
    formStepMeetingDate: (step) => {
        return isStepnameInPrevStepnames(step, 'formStep') && step.formStepMeetingDate === null
    },

    beffaringStepWasThereMeeting: (step) => {
        return isStepnameInPrevStepnames(step, 'beffaringStep') && !step.beffaringStepWasThereMeeting
    },

    beffaringStepDocsSendDate: (step) => {
        const docsSendMillis =
            step.beffaringStepDocsSendDate !== null
                ? DateTime.fromISO(step.beffaringStepDocsSendDate as string).toMillis()
                : DateTime.now()

        let docsSendMillisEdge: number =
            step.offerStepBefaringReturnDate !== null
                ? getEdgeDayMillis(step.offerStepBefaringReturnDate as string)
                : step.formStepMeetingDate !== null
                ? getEdgeDayMillis(step.formStepMeetingDate as string)
                : 0

        return docsSendMillis > docsSendMillisEdge
    },

    beffaringStepOfferDate: (step) => {
        return isStepnameInPrevStepnames(step, 'beffaringStep') && !step.beffaringStepOfferDate
    },
}

export const getZeroArrElements = (arr: string[][]): string[] => {
    return arr.map((item) => item[0])
}

export const getPrevBranchStep = (order: IOrder): StepType | null => {
    if (!order.steps) return null
    console.log({ order })
    const orderSteps = Array.from(order.steps)
    const steps = orderSteps.sort((a, b) => {
        return DateTime.fromISO(b.createdAt!).toMillis() - DateTime.fromISO(a.createdAt!).toMillis()
    })
    const curBrunchIdx = steps[0].branchIdx
    if (!curBrunchIdx || curBrunchIdx === 0) {
        return null
    } else {
        return steps.find((step) => step.branchIdx === curBrunchIdx - 1) || null
    }
}

interface IGetBranchIdxProps {
    globalStepWhereLastTransitionWas?: StepType | null
    stepName: StepName
}
export const getBranchIdx: (props: IGetBranchIdxProps) => number = ({ globalStepWhereLastTransitionWas, stepName }) => {
    if (!globalStepWhereLastTransitionWas) return 0
    const branchIdx =
        globalStepWhereLastTransitionWas.returnStep === globalStepWhereLastTransitionWas.createdByStep &&
        globalStepWhereLastTransitionWas.returnStep !== globalStepWhereLastTransitionWas.passedTo &&
        globalStepWhereLastTransitionWas.createdByStep !== stepName
            ? globalStepWhereLastTransitionWas.branchIdx! + 1
            : globalStepWhereLastTransitionWas.branchIdx
    console.log({ branchIdx })
    return branchIdx || 0
}

interface IGetPrevStepChangeStep {
    stepName: StepName
    order?: IOrder
}

export const getGlobalStepWhereLastTransitionWas: ({ order }: { order?: IOrder }) => StepType | null = ({ order }) => {
    if (!order) return null
    const orderSteps = Array.from(order.steps)
    const steps = orderSteps.sort((a, b) => {
        return DateTime.fromISO(b.createdAt!).toMillis() - DateTime.fromISO(a.createdAt!).toMillis()
    })
    const step = steps.find((step) => step.createdByStep !== step.passedTo)
    return step || null
}

// At this step, the data has changed.
export const getLastStepWhereSomethingWasChanged: (props: IGetPrevStepChangeStep) => StepType | null = ({
    stepName,
    order,
}) => {
    if (!order) return null
    const orderSteps = Array.from(order.steps)
    const steps = orderSteps.sort((a, b) => {
        return DateTime.fromISO(b.createdAt!).toMillis() - DateTime.fromISO(a.createdAt!).toMillis()
    })
    const step = steps.find(
        (step) => step.createdByStep === stepName
        // && step.createdByStep !== step.passedTo
    )
    return step || null
}

// At this step, the data was transferred to the next step.
export const getLastStepWherePassedToWasChanged: (props: IGetPrevStepChangeStep) => StepType | null = ({
    stepName,
    order,
}) => {
    if (!order) return null
    const orderSteps = Array.from(order.steps)
    const steps = orderSteps.sort((a, b) => {
        return DateTime.fromISO(b.createdAt!).toMillis() - DateTime.fromISO(a.createdAt!).toMillis()
    })
    const step = steps.find((step) => step.passedTo === stepName && step.createdByStep !== step.passedTo)
    return step || null
}

interface IGetBranchValuesProps {
    stepName: StepName
    order?: IOrder
}
export const getBranchValues = ({ stepName, order }: IGetBranchValuesProps) => {
    const prevStep = order?.steps[order.steps.length - 1]

    const lastStepWhereSomethingWasChanged = getLastStepWhereSomethingWasChanged({ order, stepName })

    const lastStepWherePassedToWasChanged = getLastStepWherePassedToWasChanged({ order, stepName })

    const globalStepWhereLastTransitionWas = getGlobalStepWhereLastTransitionWas({ order })

    const branchIdx = getBranchIdx({ globalStepWhereLastTransitionWas, stepName })

    const isNewBranchComparedByLastStepWhereSomethingWasChanged =
        branchIdx !== 0 && branchIdx !== lastStepWhereSomethingWasChanged?.branchIdx!

    const isNewBranchComparedByPrevStep = branchIdx !== 0 && branchIdx !== prevStep?.branchIdx!

    const orderSteps = order ? Array.from(order.steps) : []
    const steps = orderSteps.sort((a, b) => {
        return DateTime.fromISO(b.createdAt!).toMillis() - DateTime.fromISO(a.createdAt!).toMillis()
    })
    const prevBranchOnProp =
        steps.find((step) => step.createdByStep === stepName && step.branchIdx !== branchIdx) || null

    return {
        prevStep,
        branchIdx,
        lastStepWhereSomethingWasChanged,
        lastStepWherePassedToWasChanged,
        isNewBranchComparedByLastStepWhereSomethingWasChanged,
        isNewBranchComparedByPrevStep,
        prevBranchOnProp,
        globalStepWhereLastTransitionWas,
    }
}
