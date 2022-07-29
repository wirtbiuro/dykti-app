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
} from './types'
import { ServerController } from './server-controller'
import { SyntheticEvent } from 'react'
var cookie = require('cookie')
var jwt = require('jsonwebtoken')

interface NextApiRequestWithHeaders extends NextApiRequest {
    headers: any
}

export const withJwt = (fn: Function) => (
    req: NextApiRequestWithHeaders,
    res: NextApiResponse
) => {
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

export const withTokensCheck = async ({
    cb,
    err,
}: {
    cb: Function
    err: (error: IServerControllerError) => void
}) => {
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

interface IgetOrderStatusTypeProps {
    curStepName?: StepName
    prevStepName?: StepName
    step?: StepType
}

type getOrderStatusType = ({
    curStepName,
    prevStepName,
    step,
}: IgetOrderStatusTypeProps) => {
    isCurrent: boolean
    isEdit: boolean
    isProceedToNext: boolean
    isProceedToEdit: boolean
}

export const getOrderStatus: getOrderStatusType = ({
    curStepName,
    prevStepName,
    step,
}) => {
    const curStepIsProceedToNextName = `${curStepName}IsProceedToNext` as PropNames<
        StepType
    >

    const prevStepIsProceedToNextName = `${prevStepName}IsProceedToNext` as PropNames<
        StepType
    >

    const curStepIsCompletedName = `${curStepName}IsCompleted` as PropNames<
        StepType
    >

    const prevStepIsCompletedName = `${prevStepName}IsCompleted` as PropNames<
        StepType
    >

    const curStepIsProceedToNext = step?.[curStepIsProceedToNextName] as boolean
    const prevStepIsProceedToNext = step?.[
        prevStepIsProceedToNextName
    ] as boolean
    const curStepIsCompleted = step?.[curStepIsCompletedName] as boolean
    const prevStepIsCompleted = step?.[prevStepIsCompletedName] as boolean

    const isCurrent =
        prevStepIsProceedToNext &&
        prevStepIsCompleted &&
        !curStepIsProceedToNext &&
        !curStepIsCompleted
    const isEdit =
        prevStepIsProceedToNext &&
        prevStepIsCompleted &&
        curStepIsProceedToNext &&
        !curStepIsCompleted
    const isProceedToNext =
        prevStepIsProceedToNext &&
        prevStepIsCompleted &&
        curStepIsProceedToNext &&
        curStepIsCompleted
    const isProceedToEdit =
        prevStepIsProceedToNext &&
        !prevStepIsCompleted &&
        !curStepIsProceedToNext &&
        !curStepIsCompleted
    return { isCurrent, isEdit, isProceedToNext, isProceedToEdit }
}

interface ISubmitFormProps {
    target: EventTarget & WithValueNFocus<ISendCheckboxes>
    isMainCondition: boolean
    curStepName: StepName
    prevStepName: StepName
    step: StepType
    formCheck: FormCheckType
    prevFormCheck: FormCheckType
    isFormChecked: boolean
    isPrevFormChecked: boolean
    toPrevSendData: FieldsToSend
    toNextSendData: FieldsToSend
    createOrder: (data: FieldsToSend) => void
}

type SubmitFormType = ({}: ISubmitFormProps) => Promise<void>

export const submitForm: SubmitFormType = async ({
    target,
    isMainCondition,
    curStepName,
    formCheck,
    isFormChecked,
    prevStepName,
    step,
    toNextSendData,
    toPrevSendData,
    createOrder,
    isPrevFormChecked,
    prevFormCheck,
}) => {
    const {
        isCurrent,
        isEdit,
        isProceedToNext,
        isProceedToEdit,
    } = getOrderStatus({
        curStepName,
        prevStepName,
        step,
    })

    isMainCondition ? submitToNext() : submitToPrev()

    async function submitToNext() {
        if (
            (isCurrent || isEdit) &&
            target.nextCheckbox.checked &&
            !isFormChecked
        ) {
            return formCheck({ showMessage: true })
        }

        if (
            (isProceedToNext || isProceedToEdit) &&
            !target.uncompleteCheckbox?.checked &&
            !isFormChecked
        ) {
            return formCheck({ showMessage: true })
        }
        createOrder(toNextSendData)
    }

    async function submitToPrev() {
        if (
            (isCurrent || isEdit) &&
            target.prevCheckbox.checked &&
            !isPrevFormChecked
        ) {
            return prevFormCheck({ showMessage: true })
        }

        if (
            (isProceedToNext || isProceedToEdit) &&
            !target.uncompleteCheckbox?.checked &&
            !isPrevFormChecked
        ) {
            return prevFormCheck({ showMessage: true })
        }
        createOrder(toPrevSendData)
    }
}

export const initOutputRef = () => ({
    check: () => {},
    getValue: () => {},
    showError: () => {},
    getErrTitleElement: () => {},
})
