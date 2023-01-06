import React, { SyntheticEvent, useState, FC } from 'react'
import { FormStyled, CreateFormStyled } from '../../styles/styled-components'
import { IWithOrder } from '../../types'
import { useCreateOrderMutation, dyktiApi } from '../../state/apiSlice'
import FormMultiSelect from '../components/FormMultiSelect'
import useErrFn from '../../hooks/useErrFn'
import { useMultiSelect } from '../../hooks/new/useMultiSelect'
import { Spin } from 'antd'
import { useCalendarData } from '../../hooks/new/useCalendarData'
import Calendar from '../components/calendar'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import TextFormInput from '../components/TextFormInput'

const ServiceStep: FC<IWithOrder> = ({ order, isVisible, setIsVisible }) => {
    const [createOrder] = useCreateOrderMutation()

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

    // const workTeam = (prevStep?.workStepTeam as IWorker[]) || []
    // const workTeamString = workTeam.map((worker) => worker.username).join('; ')

    const damageData = useTextFormInput({
        initialTextValue: '',
        title: 'Co jest uszkodzone',
        placeholder: 'Co jest uszkodzone...',
    })

    const teamData = useMultiSelect({
        options: workersOptions,
        initialSelectedIdxsString: '',
        title: 'Kto będzie naprawiać',
    })

    const calendarData = useCalendarData({})

    const commentData = useTextFormInput({
        initialTextValue: '',
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

        const data = {
            damage: damageData.textValue,
            team: teamData.selectedIdxsString,
            fixingDate: calendarData.date,
            comment: commentData.textValue,
        }

        setIsSpinning(true)

        console.log('submit end', { data })

        setIsVisible!(false)
        setIsSpinning(false)
    }

    return (
        <Spin spinning={isSpinning}>
            <div style={{ display: isVisible ? 'block' : 'none' }}>
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
            </div>
        </Spin>
    )
}

export default ServiceStep
