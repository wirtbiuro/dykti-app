import React, { FC, useState } from 'react'
import { IServiceStep, IWorker, IOrder, IService } from '../types'
import { StepPropsStyled, ServicePropsStyled } from '../styles/styled-components'
import { DateTime } from 'luxon'
import ServiceStep from './steps/ServiceStep'

interface IStepPropsProps {
    service: IService
    order: IOrder
}

const ServiceProps: FC<IStepPropsProps> = ({ service, order }) => {
    const currentServiceStep = service.current

    const team = currentServiceStep.team as IWorker[] | undefined

    const [isVisible, setIsVisible] = useState(false)

    const onEdit = () => {
        setIsVisible((isVisible) => !isVisible)
    }

    return (
        <ServicePropsStyled>
            <StepPropsStyled>
                <div>
                    <p className="description">Kiedy będzie naprawione</p>
                    <strong>
                        <p className="value">
                            {DateTime.fromISO(currentServiceStep.fixingDate as string).toFormat('dd.MM.yyyy')}
                        </p>
                    </strong>
                </div>
                <div className="prop">
                    <p className="description">Co jest uszkodzone:</p>
                    <p className="value">{currentServiceStep.damage}</p>
                </div>
                <div className="prop">
                    <p className="description">Kto będzie naprawiać:</p>
                    <p className="value">{team?.map((worker) => worker.name).join('; ')}</p>
                </div>
                {currentServiceStep.comment && (
                    <div className="prop">
                        <p className="description">Komentarz:</p>
                        <p className="value">{currentServiceStep.comment}</p>
                    </div>
                )}
                <button onClick={onEdit}>{isVisible ? 'Anulować' : 'Naprawić'}</button>
            </StepPropsStyled>
            <div className="edit-service">
                <ServiceStep
                    currentServiceStep={currentServiceStep}
                    service={service}
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    order={order}
                />
            </div>
        </ServicePropsStyled>
    )
}

export default ServiceProps
