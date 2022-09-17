import React, { FC, useState } from 'react'
import { IOrder, StepName, StepType } from '../types'
import { StepStyled } from '../styles/styled-components'
import Step from './Step'
import { withRtkQueryTokensCheck } from '../utilities'
import { useCreateOrderMutation } from '../state/apiSlice'
import useErrFn from '../hooks/useErrFn'
import FormInput from './UI/FormInput'
import { useFormInput } from '../hooks/useFormInput'
import { Modal } from 'antd'

interface IOrderProps {
    order: IOrder
    stepName: StepName
    children?: JSX.Element
}

const Order: FC<IOrderProps> = ({ order, stepName, children }) => {
    const step = order.steps[order.steps.length - 1]
    console.log({ step, stepName })
    const shouldConfirmView = step.shouldConfirmView && step.passedTo === stepName

    const [createOrder] = useCreateOrderMutation()
    const errFn = useErrFn()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalOrder, setModalOrder] = useState<IOrder>()
    const modalInputData = useFormInput()

    const [isHistory, setIsHistory] = useState<boolean>(false)
    const [isViewing, setIsViewing] = useState<boolean>(false)

    const minimumSigns = 10

    const getPrevStep: (order: IOrder, idx: number) => StepType | undefined = (order, idx) => {
        return idx > 0 ? order.steps[idx - 1] : undefined
    }

    const onConfirm: (order: IOrder) => void = (order) => {
        withRtkQueryTokensCheck({
            cb: async () => {
                return await createOrder({
                    order,
                    shouldConfirmView: false,
                })
            },
            err: errFn,
        })
    }

    const handleOk = () => {
        console.log('handle ok', modalInputData)
        if (!modalInputData.isChecked) {
            console.log('modalInputData.showError', modalInputData.showError)
            return modalInputData.showError(`Minimum ${minimumSigns} znaków`)
            return modalInputData.showError()
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
    }

    return (
        <StepStyled key={order.id}>
            <Step step={step} />
            {!isViewing && <button onClick={() => setIsViewing(true)}>Kontynuować</button>}
            {isViewing && <button onClick={() => setIsViewing(false)}>Zamknij</button>}
            {shouldConfirmView && <button onClick={() => onConfirm(order)}>Potwierdź akceptację</button>}
            {stepName !== 'lastDecisionStep' && <button onClick={() => onClose(order)}>Zamknąć sprawę</button>}
            <div style={{ display: isModalOpen ? 'block' : 'none' }}>
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
            </div>

            {!isHistory && <button onClick={() => setIsHistory(true)}>Pokaż historię zmian</button>}
            {isHistory && <button onClick={() => setIsHistory(false)}>Zamknij histoię zmian</button>}

            {React.cloneElement(children as JSX.Element, {
                isVisible: isViewing,
                order,
            })}

            {isHistory && (
                <div>
                    Zmiany:
                    {order.steps.map((step, idx) => (
                        <Step key={step.id} step={step} prevStep={getPrevStep(order, idx)} />
                    ))}
                </div>
            )}
            <Modal open={isModalOpen}>
                <div>
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
                </div>
            </Modal>
        </StepStyled>
    )
}

export default Order
