import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import {
    IAxiosError,
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
} from './types'
import { ServerController } from './server-controller'
import { SyntheticEvent } from 'react'
import { dyktiApi } from './state/apiSlice'
import { Modal } from 'antd'
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
            err(error)
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
            err(error)
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

interface ISubmitFormProps {
    target: EventTarget & WithValueNFocus<ISendCheckboxes>
    isMainCondition: boolean
    curStepName: StepName
    maxPromotion: StepName
    passedTo: StepName
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
}

type SubmitFormType = ({}: ISubmitFormProps) => Promise<void>

export const submitForm: SubmitFormType = async ({
    target,
    isMainCondition,
    curStepName,
    formCheck,
    isFormChecked,
    maxPromotion,
    passedTo,
    nextToPass,
    prevToPass,
    toNextSendData,
    toPrevSendData = {},
    createOrder,
    isPrevFormChecked,
    prevFormCheck = () => {},
    errFn,
}) => {
    const { isCurrent, isEdit, isProceedToNext, isProceedToEdit } = getOrderStatus({
        curStepName,
        maxPromotion,
        passedTo,
    })
    const isCurrentOrEdit = isCurrent || isEdit

    console.log('submitForm', isMainCondition)
    console.log({ prevToPass })

    const _passedTo = getPassedTo({
        nextToPass,
        target,
        isMainCondition,
        curStepName,
        isCurrentOrEdit,
        passedTo,
        prevToPass,
    })

    console.log({ _passedTo })
    const _maxPromotion = getMaxPromotion(_passedTo, maxPromotion)
    const shouldConfirmView = _passedTo !== curStepName
    console.log({ shouldConfirmView, _passedTo, curStepName })

    const _options = {
        passedTo: _passedTo,
        maxPromotion: _maxPromotion,
        shouldConfirmView,
        createdByStep: curStepName,
    }

    console.log({ _options })

    const submit = isMainCondition ? submitToNext : submitToPrev

    withRtkQueryTokensCheck({
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
    formCheck: ({ showMessage }: { showMessage: boolean }) => void
    prevFormCheck?: ({ showMessage }: { showMessage: boolean }) => void
    isMainCondition: boolean
    isFormChecked: boolean
    isPrevFormChecked?: boolean
}

type ShowErrorMessagesTypes = ({}: IshowErrorMessagesProps) => boolean

export const showErrorMessages: ShowErrorMessagesTypes = ({
    target,
    flushSync,
    formCheck,
    prevFormCheck = () => {},
    isMainCondition,
    isPrevFormChecked = false,
    isFormChecked,
}) => {
    const isUncompletedNOTChecked = target.uncompleteCheckbox !== undefined && !target.uncompleteCheckbox.checked

    const isNextChecked = target.nextCheckbox !== undefined && target.nextCheckbox.checked

    const isPrevChecked = target.prevCheckbox !== undefined && target.prevCheckbox.checked

    flushSync(() => {
        if (isNextChecked) formCheck({ showMessage: true })
        if (isPrevChecked) prevFormCheck({ showMessage: true })
        if (isUncompletedNOTChecked) {
            isMainCondition ? formCheck({ showMessage: true }) : prevFormCheck({ showMessage: true })
        }
    })

    if (
        (!isFormChecked && isNextChecked) ||
        (!isPrevFormChecked && isPrevChecked) ||
        (isUncompletedNOTChecked && (!isPrevFormChecked || !isFormChecked))
    ) {
        console.log({ isFormChecked, isPrevFormChecked, isUncompletedNOTChecked, isNextChecked, isPrevChecked })
        return true
    }
    console.log('submit')
    return false
}

type GetDatasType = ({}: IgetDatasProps) => {
    completedOrdersData: IOrder[]
    passedForEditData: IOrder[]
    currentData: IOrder[]
    editedOrdersData: IOrder[]
}

interface IgetDatasProps {
    data: IOrder[]
    currentStep: StepName
}

export const getDatas: GetDatasType = ({ data, currentStep }) => {
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
    return { completedOrdersData, passedForEditData, currentData, editedOrdersData }
}
