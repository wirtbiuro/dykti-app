import React, { useState, useEffect } from 'react'
import { useGetUserQuery, dyktiApi } from '../state/apiSlice'
import CreateForm from './steps/CreateForm'
import { IQuery, IUser, Role, roleTitles } from '../types'
import BefaringPanel from './panels/BefaringPanel'
import CreatorFormPanel from './panels/CreatorFormPanel'
import OfferCreatorPanel from './panels/OfferCreatorPanel'
import ContractCreatorPanel from './panels/ContractCreatorPanel'
import ContractCheckerPanel from './panels/ContractCheckerPanel'
import ContractPreparerPanel from './panels/ContractPreparerPanel'
import WorkStepPanel from './panels/WorkStepPanel'
import QuestionnairePanel from './panels/QuestionnairePanel'
import ReferencePanel from './panels/ReferencePanel'
import { withRtkQueryTokensCheck } from '../utilities'
import useErrFn from '../hooks/useErrFn'
import LastDecisionPanel from './panels/LastDecisionPanel'
import { observer } from 'mobx-react-lite'
import { MainStyled } from '../styles/styled-components'

type RoleStrategyType = Record<Role, JSX.Element>

const roleStrategy: RoleStrategyType = {
    FormCreator: <CreatorFormPanel />,
    BefaringUser: <BefaringPanel />,
    OfferCreator: <OfferCreatorPanel />,
    ContractPreparer: <ContractPreparerPanel />,
    ContractChecker: <ContractCheckerPanel />,
    ContractCreator: <ContractCreatorPanel />,
    WorkRespUser: <WorkStepPanel />,
    QuestionnaireUser: <QuestionnairePanel />,
    ReferenceUser: <ReferencePanel />,
    LastDecisionUser: <LastDecisionPanel />,
}

const Main = observer(() => {
    const getUser = dyktiApi.endpoints.getUser as any
    const [refetchUser, { data, isLoading, isError, isSuccess }] = getUser.useLazyQuery()

    // const { isError, data }: IQuery<IUser> = useGetUserQuery()

    const [visibleRole, setVisibleRole] = useState<Role>()

    console.log({ data })

    const errFn = useErrFn()

    useEffect(() => {
        withRtkQueryTokensCheck({
            cb: refetchUser,
            err: () => {},
        })
    }, [])

    useEffect(() => {
        if (data && !isError) {
            setVisibleRole(data.role[0])
        }
    }, [data, isError])

    const roleClicked = (role: Role) => {
        setVisibleRole(role)
    }

    if (data && data.role && !isError) {
        return (
            <MainStyled>
                <ul className="roles">
                    {data.role.map((role: Role) => {
                        return (
                            <li
                                key={role}
                                onClick={() => roleClicked(role)}
                                style={{
                                    fontWeight: visibleRole === role ? 'bold' : 'normal',
                                }}
                                className="role"
                            >
                                {roleTitles[role]}
                            </li>
                        )
                    })}
                </ul>

                <>{visibleRole && roleStrategy[visibleRole]}</>
            </MainStyled>
        )
    }

    return <div>Dykti app</div>
})

export default Main
