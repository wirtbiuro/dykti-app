import { NextApiRequest } from 'next'
import { DateTime } from 'luxon'

export type Role =
    | 'FormCreator'
    | 'BefaringUser'
    | 'OfferCreator'
    | 'ContractCreator'

export interface NextApiRequestWithHeaders extends NextApiRequest {
    headers: any
}

export type EditableTypes<T> = Omit<
    T,
    'id' | 'createdAt' | 'recordId' | 'record'
>

type _WithValueNFocus<T> = T extends { [key: string]: infer U }
    ? Record<keyof T, { value: U; focus: Function }>
    : never

export type WithValueNFocus<T> = {
    [P in keyof T]: {
        focus: Function
        value: T[P]
        checked: boolean
    }
}

export type PropNames<T> = keyof T

export type StepName =
    | 'formStep'
    | 'beffaringStep'
    | 'offerStep'
    | 'contractStep'

export interface IQuery<T> {
    isError: boolean
    isLoading: boolean
    isSuccess: boolean
    data: T extends IUser ? IUser : Array<IOrder>
}

export interface IOrder {
    id: number
    createdAt: string
    steps: Array<StepType>
}

export interface IOutputRef {
    check: Function
    getValue: Function
    setValue: Function
    showError: Function
    getErrTitleElement: Function
}

export type FormChangedType = ({}: { isFirstLoad: boolean }) => void

export type StepType = {
    id?: number
    createdAt?: string
} & IFormStep &
    IBefaringStep &
    IOfferStep &
    IContractStep

export interface IFormStep {
    formStepCreatedAt?: string
    formStepClientName?: string
    formStepPhone?: string
    formStepEmail?: string
    formStepCity?: string
    formStepAddress?: string
    formStepMeetingDate?: DateTime | string
    formStepWhereClientFound?: string
    formStepCreatorId?: number
    formStepCreator?: IUser
    formStepIsCompleted?: boolean
    formStepIsProceedToNext?: boolean
    formStepComment?: string
    formStepShouldPerfomerConfirmView?: boolean
}

export interface IBefaringStep {
    beffaringStepPrevStepConfirmationDate?: DateTime | string
    beffaringStepCreatedAt?: DateTime | string
    beffaringStepWasThereMeeting?: boolean
    beffaringStepOfferDate?: DateTime | string
    beffaringStepInfoSendingDate?: DateTime | string
    beffaringStepCreatorId?: number
    beffaringStepCreator?: IUser
    beffaringStepIsCompleted?: boolean
    beffaringStepIsProceedToNext?: boolean
    beffaringStepComment?: string
    beffaringStepShouldPerfomerConfirmView?: boolean
    beffaringStepDocsSendDate?: DateTime | string
}

export interface IOfferStep {
    offerStepPrevStepConfirmationDate?: DateTime | string

    offerStepAreBefDocsGood?: boolean
    offerStepBefComments?: string
    offerStepOfferDate?: DateTime | string
    offerStepComment?: string

    offerStepIsCompleted?: boolean
    offerStepIsProceedToNext?: boolean
    offerStepShouldPerfomerConfirmView?: boolean

    offerStepCreatedAt?: DateTime | string
    offerStepCreatorId?: number
    offerStepCreator?: IUser
}

export interface IContractStep {
    contractStepPrevStepConfirmationDate?: DateTime | string
    contractStepOfferSendingDate?: DateTime | string
    contractStepAreOfferChanges?: boolean
    contractStepOfferChangesComment?: string
    contractStepIsOfferAccepted?: boolean
    contractStepContractDate?: DateTime | string
    contractStepOfferRejectionReason?: string
    contractStepIsCompleted?: boolean
    contractStepIsProceedToNext?: boolean
    contractStepShouldPerfomerConfirmView?: boolean
    contractStepCreatedAt?: DateTime | string
    contractStepCreatorId?: number
    contractStepCreator?: IUser
}

export interface IRecord {
    id: number
    createdAt: string
    creatorId: number
    creator: IUser
    isCompleted: boolean
    comment: string
    perfomerId: number
    perfomer: IUser
    shouldPerfomerConfirmViewing: boolean
    isViewingConfirmedByPerfomer: boolean
    perfomerViewingDate: string
}

export type FieldsToSend = StepType & {
    order?: IOrder
}

export type FormCheckType = ({ showMessage }: { showMessage: boolean }) => void

export interface ISendCheckboxes {
    nextCheckbox: boolean
    prevCheckbox: boolean
    uncompleteCheckbox: boolean
    confirmCheckbox: boolean
}

export interface ITodo {
    name: string
    priority: number
    id?: number
    userId?: number
    isEdit: boolean
}

export interface IUser {
    username: string
    id: string
    role: Role
}

export interface IAuth {
    status: 'SIGN_IN' | 'SIGN_UP' | 'HIDDEN'
}

export interface IAxiosError {
    response: {
        data: {
            message: string
        }
    }
}

export type CreateBefaringStepReqData = {
    meetingDate: DateTime
    wasOfferSent: boolean
    comment?: string
    userId?: number
    orderId: number
    // formStepId: number
}

export interface IgetUserRes {
    id: number
    username: string
    todos: ITodo[]
}

export interface IgetUserAxiosRes {
    user: IgetUserRes
}

export interface IServerControllerError {
    message: string
}

export interface IWithOrder {
    order?: IOrder
    isVisible?: boolean
}

export interface ISendButtonsOutputRef {
    getResults: Function
}
