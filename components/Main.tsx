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

const Main = () => {
    const [refetchUser, { data, isLoading, isError, isSuccess }] = dyktiApi.endpoints.getUser.useLazyQuery()

    // const { isError, data }: IQuery<IUser> = useGetUserQuery()

    const [visibleRole, setVisibleRole] = useState<Role>()

    console.log({ data })

    const errFn = useErrFn()

    useEffect(() => {
        withRtkQueryTokensCheck({
            cb: refetchUser,
            err: errFn,
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
            <>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {data.role.map((role: Role) => {
                        return (
                            <div
                                key={role}
                                style={{
                                    paddingRight: '20px',
                                }}
                            >
                                <a
                                    onClick={() => roleClicked(role)}
                                    style={{
                                        fontWeight: visibleRole === role ? 'bold' : 'normal',
                                    }}
                                >
                                    {roleTitles[role]}
                                </a>
                            </div>
                        )
                    })}
                </div>

                <>{visibleRole && roleStrategy[visibleRole]}</>
            </>
        )
    }

    return <div>Dykti app</div>
}

export default Main
