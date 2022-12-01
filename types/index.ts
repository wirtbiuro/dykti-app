import { NextApiRequest } from 'next'
import { DateTime } from 'luxon'

// export type Role =
//     | 'FormCreator'
//     | 'BefaringUser'
//     | 'OfferCreator'
//     | 'ContractPreparer'
//     | 'ContractChecker'
//     | 'ContractCreator'
//     | 'WorkRespUser'
//     | 'QuestionnaireUser'
//     | 'ReferenceUser'

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

export const stepNamesRelations = [
    ['FormCreator', 'formStep'] as const,
    ['BefaringUser', 'beffaringStep'] as const,
    ['OfferCreator', 'offerStep'] as const,
    ['ContractPreparer', 'contractStep'] as const,
    ['ContractChecker', 'contractCheckerStep'] as const,
    ['ContractCreator', 'contractCreatorStep'] as const,
    ['WorkRespUser', 'workStep'] as const,
    ['QuestionnaireUser', 'questionnaireStep'] as const,
    ['ReferenceUser', 'referenceStep'] as const,
    ['LastDecisionUser', 'lastDecisionStep'] as const,
]

export type StepNamesRelationsArrType = typeof stepNamesRelations

export type StepNamesRelationsType = typeof stepNamesRelations[number]

export type Role = StepNamesRelationsType[0]

export type StepName = StepNamesRelationsType[1]

export const getStepNames: (stepNamesRelations: StepNamesRelationsArrType) => StepName[] = (stepNamesRelations) => {
    const stepNames: StepName[] = []
    for (const iterator of stepNamesRelations) {
        stepNames.push(iterator[1])
    }
    return stepNames
}

export const stepNames = getStepNames(stepNamesRelations)

const getRoles: (stepNamesRelations: StepNamesRelationsArrType) => Role[] = (stepNamesRelations) => {
    const roles: Role[] = []
    for (const iterator of stepNamesRelations) {
        roles.push(iterator[0])
    }
    return roles
}

export const roles = getRoles(stepNamesRelations)

export const getStepnameByRole: (role: Role) => StepName = (role) => {
    const item = stepNamesRelations.find((item) => item[0] === role)
    return item![1]
}

type RoleTitleType = Record<Role, string>

export const roleTitles: RoleTitleType = {
    FormCreator: 'Tworzenie formularza',
    BefaringUser: 'Befaring',
    OfferCreator: 'Tworzenie oferty',
    ContractPreparer: 'Ofertowanie',
    ContractChecker: 'Sprawdzenie kontraktu',
    ContractCreator: 'Tworzenie kontraktu',
    WorkRespUser: 'Praca',
    QuestionnaireUser: 'Zakończenie',
    ReferenceUser: 'Prośba o referencje',
    LastDecisionUser: 'Potwierdzenie zakończenia',
}

// export const stepNames = [
//     'formStep',
//     'beffaringStep',
//     'offerStep',
//     'contractStep',
//     'contractCheckerStep',
//     'contractCreatorStep',
//     'workStep',
//     'completionstep',
//     'referenceStep',
//     'completed',
// ] as const

// export type StepName = typeof stepNames[number]

export type StepNames = typeof stepNames

export interface IQuery<T> {
    error?: any
    isError: boolean
    isLoading: boolean
    isSuccess: boolean
    data: T extends IUser ? IUser : Array<IOrder>
    refetch: Function
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

export type StepType = IFormStep & {
    id?: number
    orderId?: number
    createdAt?: string
    passedTo: StepName
    createdByStep?: StepName
    maxPromotion: StepName
    returnStep: StepName | null
    // lastUpdateStep?: StepName
    shouldConfirmView?: boolean
    isCompleted?: boolean
    createdBy?: number
    stepCreator?: IUser
    stepCreatorId?: number
    branchIdx?: number
} & IBefaringStep &
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
    beffaringStepComment?: string
    beffaringStepDocsSendDate?: DateTime | string
}

export interface IOfferStep {
    offerStepAreBefDocsGood?: boolean
    offerStepBefComments?: string
    offerStepOfferDate?: DateTime | string
    offerStepComment?: string
    offerStepBefaringReturnDate?: DateTime | string
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
    contractCheckerStepWorkEndDate?: DateTime | string
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
    workStepWorkEndDate?: DateTime | string
}

export interface IQuestionnaireStep {
    questionnaireStepIsAcceptanceReport?: boolean
    questionnaireStepHaveClientReceviedDocs?: boolean
    questionnaireStepArePaymentsReceived?: boolean
    questionnaireStepIsClientSatisfied?: boolean
    questionnaireStepOtherSatisfaction?: string
    questionnaireStepSatisfaction?: string
    questionnaireStepOtherDissatisfaction?: string
    questionnaireStepDissatisfaction?: string
}

export interface IReferenceStep {
    referenceStepWasSentRequest?: boolean
    referenceStepIsClientReference?: boolean
    referenceStepReferenceLocation?: string
}

export type StepFields = [keyof StepType, string][]

export const stepFields: StepFields = [
    ['beffaringStepWasThereMeeting', 'Spotkanie z klientem sie odbyło'],
    ['beffaringStepDocsSendDate', 'Data wysłania dokumentów, przez Befaringowca'],
    ['beffaringStepOfferDate', 'Kiedy należy przygotować ofertę'],
    ['beffaringStepComment', 'Komentarz Befaringowca'],
]

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
    userRoles?: Role[]
}

export type FormCheckType = ({ showMessage }: { showMessage: boolean }) => boolean

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
    name: string
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
    setIsVisible?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ISendButtonsOutputRef {
    getResults: Function
}

export type StepPropType = keyof StepType

export type CheckStepPropErrorsType = Partial<
    {
        [P in StepPropType]: (step: StepType) => boolean
    }
>
