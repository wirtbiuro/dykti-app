import React, { SyntheticEvent, useState, FC } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { IWithOrder, IServiceStep, IWorker, IOrder, IService } from '../../types'
import { useCreateServiceMutation, dyktiApi } from '../../state/apiSlice'
import FormMultiSelect from '../components/FormMultiSelect'
import useErrFn from '../../hooks/useErrFn'
import { useMultiSelect } from '../../hooks/new/useMultiSelect'
import { Spin } from 'antd'
import { useCalendarData } from '../../hooks/new/useCalendarData'
import Calendar from '../components/calendar'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import TextFormInput from '../components/TextFormInput'
import { withRtkQueryTokensCheck } from '../../utilities'
import { DateTime } from 'luxon'

type ServiceStepProps = IWithOrder & {
    service?: IService
    order?: IOrder
    currentServiceStep?: IServiceStep
}

const ServiceStep: FC<ServiceStepProps> = ({ order, service, isVisible, setIsVisible, currentServiceStep }) => {
    const [createService] = useCreateServiceMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQuery()
    const { data: userData } = getUserQueryData

    const getWorkers = dyktiApi.endpoints.getWorkers as any
    const getWorkersQueryData = getWorkers.useQuery()
    const { data: workersData } = getWorkersQueryData

    console.log({ workersData })

    const workersOptions =
        workersData?.workers?.map((worker: { username: string; name: string }) => [worker.username, worker.name]) || []

    const [isSpinning, setIsSpinning] = useState(false)

    const errFn = useErrFn()

    const damageData = useTextFormInput({
        initialTextValue: currentServiceStep?.damage,
        title: 'Co jest uszkodzone',
        placeholder: 'Co jest uszkodzone...',
    })

    const team = currentServiceStep?.team as IWorker[]

    const teamData = useMultiSelect({
        options: workersOptions,
        initialSelectedIdxs: team?.map((worker) => worker.username),
        title: 'Kto będzie naprawiać',
    })

    const calendarData = useCalendarData({
        selectedDate: currentServiceStep?.fixingDate
            ? DateTime.fromISO(currentServiceStep.fixingDate as string)
            : undefined,
    })

    const commentData = useTextFormInput({
        initialTextValue: currentServiceStep?.comment,
        title: 'Komentarz',
        placeholder: 'Komentarz',
    })

    const nextCheck = (showMessage: boolean) => {
        if (!damageData.check(showMessage)) {
            return false
        }
        if (!teamData.check(showMessage)) {
            return false
        }
        if (!calendarData.check(showMessage)) {
            return false
        }
        return true
    }

    const onSubmit = async (e: SyntheticEvent) => {
        e.preventDefault()
        console.log('on submit')

        if (!nextCheck(true)) {
            return
        }

        console.log({ service }, 'service id', service?.orderId)

        const data = {
            damage: damageData.textValue,
            team: teamData.selectedIdxs,
            fixingDate: calendarData.date,
            comment: commentData.textValue,
            orderId: order?.id,
            serviceId: service?.id,
        }

        await withRtkQueryTokensCheck({
            cb: submit,
            err: errFn,
        })

        async function submit() {
            return await createService({ ...data })
        }

        setIsSpinning(true)

        console.log('submit end', { data })

        setIsVisible!(false)
        setIsSpinning(false)
    }

    return (
        <Spin spinning={isSpinning}>
            {isVisible && (
                <CreateFormStyled>
                    <FormStyled>
                        <form onSubmit={onSubmit}>
                            <TextFormInput connection={damageData} />

                            <FormMultiSelect connection={teamData} />

                            <p>Kiedy będzie naprawione</p>
                            <Calendar connection={calendarData} />

                            <TextFormInput connection={commentData} />

                            <input type="submit" value="Zapisz" />
                        </form>
                    </FormStyled>
                </CreateFormStyled>
            )}
        </Spin>
    )
}

export default ServiceStep
