import React, { FC, useState, useEffect } from 'react'
import { IOrder, StepType, StepName } from '../types'
import { StepStyled, CloseOrderStyled } from '../styles/styled-components'
import Step from './Step'
import { withRtkQueryTokensCheck, getDatas } from '../utilities'
import { useCreateOrderMutation } from '../state/apiSlice'
import useErrFn from '../hooks/useErrFn'
import FormInput from './UI/FormInput'
import { useFormInput } from '../hooks/useFormInput'
import { Spin } from 'antd'
import { useSimpleStore } from '../simple-store/store'
import HistoryStep from './HistoryStep'
import CreateBefaringStep from '../components/steps/CreateBefaringStep'
import CreateContractCheckerStep from './steps/CreateContractCheckerStep'
import CreateContractCreatorStep from './steps/CreateContractCreatorStep'
import CreateContractStep from './steps/CreateContractStep'
import CreateForm from './steps/CreateForm'
import LastDecisionStep from './steps/LastDecisionStep'
import CreateOfferStep from './steps/CreateOfferStep'
import QuestionnaireStep from './steps/QuestionnaireStep'
import ReferenceStep from './steps/ReferenceStep'
import CreateWorkStep from './steps/CreateWorkStep'

interface IOrderProps {
    order: IOrder
    stepName: StepName
}

const Order: FC<IOrderProps> = ({ order, stepName }) => {
    const [isViewing, setIsViewing] = useState<boolean>(false)

    const createStepRelations: { [P in StepName]: JSX.Element } = {
        formStep: <CreateForm isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,

        beffaringStep: <CreateBefaringStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,
        contractCheckerStep: (
            <CreateContractCheckerStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />
        ),
        contractCreatorStep: (
            <CreateContractCreatorStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />
        ),
        contractStep: <CreateContractStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,
        lastDecisionStep: <LastDecisionStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,
        offerStep: <CreateOfferStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,
        questionnaireStep: <QuestionnaireStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,
        referenceStep: <ReferenceStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,
        workStep: <CreateWorkStep isVisible={isViewing} setIsVisible={setIsViewing} order={order} />,
    }

    const step = order.steps[order.steps.length - 1]
    console.log({ step, stepName, order })
    const shouldConfirmView = step.shouldConfirmView && step.passedTo === stepName
    const isCurrent = step.passedTo === stepName

    const [createOrder] = useCreateOrderMutation()
    const errFn = useErrFn()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const [modalOrder, setModalOrder] = useState<IOrder>()
    const modalInputData = useFormInput()

    const [isHistory, setIsHistory] = useState<boolean>(false)
    const [isSpinning, setIsSpinning] = useState<boolean>(false)

    const minimumSigns = 10

    const getPrevStep: (order: IOrder, idx: number) => StepType | undefined = (order, idx) => {
        return idx > 0 ? order.steps[idx - 1] : undefined
    }

    const onConfirm: (order: IOrder) => void = (order) => {
        withRtkQueryTokensCheck({
            cb: async () => {
                setIsSpinning(true)
                const res = await createOrder({
                    order,
                    shouldConfirmView: false,
                })
                setIsSpinning(false)
                return res
            },
            err: errFn,
        })
    }

    const handleOk = () => {
        console.log('handle ok', modalInputData)
        if (!modalInputData.isChecked) {
            console.log('modalInputData.showError', modalInputData.showError)
            return modalInputData.showError!(`Minimum ${minimumSigns} znaków`)
        }
        setIsModalOpen(false)
        withRtkQueryTokensCheck({
            cb: async () => {
                return await createOrder({
                    order: modalOrder,
                    passedTo: 'lastDecisionStep',
                    maxPromotion: 'lastDecisionStep',
                })
            },
            err: errFn,
        })
    }

    const onClose: (order: IOrder) => void = (order) => {
        console.log('on close prev isModalOpen', isModalOpen)
        setModalOrder(order)
        setIsModalOpen(true)
        setIsHistory(false)
        setIsViewing(false)
    }

    const onContinueBtn = () => {
        setIsViewing(true)
        setIsHistory(false)
        setIsModalOpen(false)
    }

    const onCloseBtn = () => {
        setIsViewing(false)
    }

    const onShowHistory = () => {
        setIsHistory(true)
        setIsViewing(false)
        setIsModalOpen(false)
    }

    const onHideHistory = () => {
        setIsHistory(false)
    }

    const getSortSteps = () =>
        order.steps.map((step, idx) => {
            return <HistoryStep key={step.id} step={step} prevStep={getPrevStep(order, idx)} isHistory={isHistory} />
        })

    const sortSteps = getSortSteps().sort((a, b) => Number(b.key!) - Number(a.key!))

    console.log({ sortSteps })

    return (
        <Spin spinning={isSpinning}>
            <StepStyled key={order.id}>
                <Step step={step} stepName={stepName} orderId={order.id} />
                {!isViewing && <button onClick={onContinueBtn}>Kontynuować</button>}
                {isViewing && <button onClick={onCloseBtn}>Zamknij</button>}
                {shouldConfirmView && <button onClick={() => onConfirm(order)}>Przyjąłem</button>}

                {!isHistory && <button onClick={onShowHistory}>Pokaż historię zmian</button>}
                {isHistory && <button onClick={onHideHistory}>Zamknij histoię zmian</button>}

                {stepName !== 'lastDecisionStep' && isCurrent && !isModalOpen && (
                    <button onClick={() => onClose(order)}>Zamknąć sprawę</button>
                )}
                <CloseOrderStyled isModalOpen={isModalOpen}>
                    Podaj powód, dla którego zamierzasz zamknąć sprawę:
                    <FormInput
                        checkFn={(value) => {
                            const _value = value as string
                            return _value.length >= minimumSigns
                        }}
                        connection={modalInputData}
                        defaultValue=""
                        placeholder="Napisz tutaj"
                    />
                    <button onClick={handleOk}>Wysłać</button>
                    <button
                        onClick={() => {
                            setIsModalOpen(false)
                        }}
                    >
                        Anulowanie
                    </button>
                </CloseOrderStyled>

                {createStepRelations[stepName]}

                {isHistory && (
                    <div className="changes-wrapper">
                        <strong>Zmiany:</strong>
                        <div className="changes">{sortSteps}</div>
                    </div>
                )}
            </StepStyled>
        </Spin>
    )
}

export default Order
