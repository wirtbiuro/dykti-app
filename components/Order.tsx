import React, { FC, useState, useEffect } from 'react'
import { IOrder, StepName, StepType } from '../types'
import { StepStyled, CloseOrderStyled } from '../styles/styled-components'
import Step from './Step'
import { withRtkQueryTokensCheck, getDatas } from '../utilities'
import { useCreateOrderMutation } from '../state/apiSlice'
import useErrFn from '../hooks/useErrFn'
import FormInput from './UI/FormInput'
import { useFormInput } from '../hooks/useFormInput'
import { Spin } from 'antd'
import { useOrderStore } from '../simple-store/order'
import HistoryStep from './HistoryStep'

interface IOrderProps {
    order: IOrder
    stepName: StepName
    children?: JSX.Element
}

const Order: FC<IOrderProps> = ({ order, stepName, children }) => {
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
    const [isViewing, setIsViewing] = useState<boolean>(false)
    const [isSpinning, setIsSpinning] = useState<boolean>(false)

    const [orderStore, setOrderStore] = useOrderStore()

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

    const onShowMore = (orderId?: number) => {
        setOrderStore({
            visibleOrderId: orderId || null,
        })
    }

    return (
        <Spin spinning={isSpinning}>
            <StepStyled key={order.id}>
                <Step step={step} stepName={stepName} />
                {orderStore.visibleOrderId === order.id ? (
                    <button onClick={() => onShowMore()}>Pokaż mniej</button>
                ) : (
                    <button onClick={() => onShowMore(order.id)}>Pokaż więcej</button>
                )}
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

                {React.cloneElement(children as JSX.Element, {
                    isVisible: isViewing,
                    setIsVisible: setIsViewing,
                    order,
                })}

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
