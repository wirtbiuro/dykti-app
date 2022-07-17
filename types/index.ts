import { NextApiRequest } from 'next'
import { DateTime } from 'luxon'

export type Role = 'FormCreator' | 'BefaringUser'

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

export interface IAuxApi {
    comment?: string
    userId: number
    isCompleted: boolean
    shouldPerfomerConfirmViewing: boolean
    order?: IOrder
}

export type ApiBodyType<T> = EditableTypes<T> & IAuxApi
export type ToSendToApi<T> = Omit<ApiBodyType<T>, 'userId'>

export type PropNames<T> = keyof T

export interface IQuery<T> {
    isError: boolean
    isLoading: boolean
    isSuccess: boolean
    data: T extends IUser ? IUser : Array<IOrder>
}

export interface IOrder {
    id: number
    createdAt: string
    steps: Array<IStep>
    isFormStepCompleted: boolean
    isBefaringStepCompleted: boolean
    isOfferStepCompleted: boolean
}

export interface IStep {
    id: number
    createdAt: string
    formStep: IFormStep
    befaringStep: IBefaringStep
    offerStep: IOfferStep
}

export interface IFormStep {
    id: number
    createdAt: string
    clientName?: string
    phone?: string
    email?: string
    city?: string
    address?: string
    meetingDate?: DateTime | string
    whereClientFound?: string
    recordId: number
    record: IRecord
}

export interface IBefaringStep {
    id: number
    createdAt: string
    recordId: number
    record: IRecord
    offerDate?: string
    infoSendingDate?: string
}

export interface IOfferStep {
    id: number
    createdAt: string
    recordId: number
    record: IRecord
    wasOfferSent: boolean
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
    formStepId: number
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
}
