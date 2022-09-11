import { NextApiRequest } from 'next'
import { DateTime } from 'luxon'

export type Role =
    | 'FormCreator'
    | 'BefaringUser'
    | 'OfferCreator'
    | 'ContractPreparer'
    | 'ContractChecker'
    | 'ContractCreator'
    | 'WorkRespUser'
    | 'QuestionnaireUser'
    | 'ReferenceUser'

export interface NextApiRequestWithHeaders extends NextApiRequest {
    headers: any
}

export type EditableTypes<T> = Omit<T, 'id' | 'createdAt' | 'recordId' | 'record'>

type _WithValueNFocus<T> = T extends { [key: string]: infer U } ? Record<keyof T, { value: U; focus: Function }> : never

export type WithValueNFocus<T> = {
    [P in keyof T]: {
        focus: Function
        value: T[P]
        checked: boolean
    }
}

export type PropNames<T> = keyof T

// export type StepName =
//     | 'formStep'
//     | 'beffaringStep'
//     | 'offerStep'
//     | 'contractStep'
//     | 'contractCheckerStep'
//     | 'contractCreatorStep'
//     | 'workStep'

export const stepNames = [
    'formStep',
    'beffaringStep',
    'offerStep',
    'contractStep',
    'contractCheckerStep',
    'contractCreatorStep',
    'workStep',
    'completionstep',
] as const

export type StepName = typeof stepNames[number]

export type StepNames = typeof stepNames

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
    passedTo: StepName
    createdByStep?: StepName
    maxPromotion: StepName
    shouldConfirmView?: boolean
    createdBy?: number
    creator?: IUser
} & IFormStep &
    IBefaringStep &
    IOfferStep &
    IContractStep &
    IContractCheckerStep &
    IContractCreatorStep &
    IWorkStep &
    IQuestionnaireStep &
    IReferenceStep

export interface IFormStep {
    formStepClientName?: string
    formStepPhone?: string
    formStepEmail?: string
    formStepCity?: string
    formStepAddress?: string
    formStepMeetingDate?: DateTime | string
    formStepWhereClientFound?: string
    formStepComment?: string
}

export interface IBefaringStep {
    beffaringStepWasThereMeeting?: boolean
    beffaringStepOfferDate?: DateTime | string
    beffaringStepInfoSendingDate?: DateTime | string
    beffaringStepCreatorId?: number
    beffaringStepCreator?: IUser
    beffaringStepComment?: string
    beffaringStepDocsSendDate?: DateTime | string
}

export interface IOfferStep {
    offerStepAreBefDocsGood?: boolean
    offerStepBefComments?: string
    offerStepOfferDate?: DateTime | string
    offerStepComment?: string
}

export interface IContractStep {
    contractStepOfferSendingDate?: DateTime | string
    contractStepAreOfferChanges?: boolean
    contractStepOfferChangesComment?: string
    contractStepIsOfferAccepted?: boolean
    contractStepSentForVerificationDate?: DateTime | string
    contractStepOfferRejectionReason?: string
}

export interface IContractCheckerStep {
    contractCheckerStepIsContractChecked?: boolean
    contractCheckerStepWorkStartDate?: DateTime | string
    contractCheckerStepComments?: string
}

export interface IContractCreatorStep {
    contractCreatorStepContractSendingDate?: DateTime | string
    contractCreatorStepIsContractAccepted?: boolean
    contractCreatorStepContractRejectionReason?: string
}

export interface IWorkStep {
    workStepTeam?: string
    workStepWorkStartDate?: DateTime | string
    workStepContractEdits?: string
    workStepWorkEndDay?: DateTime | string
}

export interface IQuestionnaireStep {
    questionnaireStepSatisfaction?: string
    questionnaireStepDissatisfaction?: string
    questionnaireStepOtherOpinion?: string
}

export interface IReferenceStep {
    referenceStepRequest?: boolean
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
    role?: Role
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
    role: Array<Role>
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
    // passedTo: StepName
    // maxPromotion: StepName
    // nextToPass?: StepName
}

export interface ISendButtonsOutputRef {
    getResults: Function
}
