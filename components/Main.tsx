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
import { withRtkQueryTokensCheck, getDatas } from '../utilities'
import useErrFn from '../hooks/useErrFn'
import LastDecisionPanel from './panels/LastDecisionPanel'
import { observer } from 'mobx-react-lite'
import { MainStyled } from '../styles/styled-components'
import { useSimpleStore } from '../simple-store/store'
import { useAppDispatch } from '../state/hooks'
import { authActions } from '../state/authSlice'

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
    const getUser = dyktiApi.endpoints.getUser as any
    const [refetchUser] = getUser.useLazyQuery()
    const getUserQueryData = getUser.useQueryState()
    console.log({ getUserQueryData })

    const { data, isLoading, isError, isSuccess } = getUserQueryData

    const getLastDecisionOrders = dyktiApi.endpoints.getLastDecisionOrders as any
    const [refetchLastDecisionOrdersData] = getLastDecisionOrders.useLazyQuery()
    const getLastDecisionOrdersData = getLastDecisionOrders.useQueryState()
    const {
        data: lastDecisionsOrderData,
        isLoading: lastDecisionsOrderDataIsLoading,
        isFetching: lastDecisionsOrderDataIsFetching,
    } = getLastDecisionOrdersData

    const [isLastDecisionDataLoading, setIsLastDecisionDataLoading] = useState<boolean>(true)

    useEffect(() => {
        withRtkQueryTokensCheck({
            cb: async () => {
                const res = await refetchLastDecisionOrdersData()
                console.log({ res })
                if (!res.isError) {
                    console.log('no error', res.isError)
                    setIsLastDecisionDataLoading(false)
                }
                return res
            },
            err: async () => {
                console.log('auth err')
                const res = await refetchLastDecisionOrdersData()
                setIsLastDecisionDataLoading(false)
            },
        })
    }, [])

    console.log({ getLastDecisionOrdersData })

    const dispatch = useAppDispatch()

    // const { isError, data }: IQuery<IUser> = useGetUserQuery()

    const [visibleRole, setVisibleRole] = useState<Role>()

    useEffect(() => {
        if (data && !isError) {
            setVisibleRole(data.role[0])
        }
    }, [data, isError])

    const roleClicked = (role: Role) => {
        setVisibleRole(role)
    }

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({
        data: lastDecisionsOrderData,
        currentStep: 'lastDecisionStep',
    })
    // : { completedOrdersData: null, currentData: null, editedOrdersData: null, passedForEditData: null }

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
                                {role === 'LastDecisionUser' && (
                                    <span className="last-decision-quantity">
                                        {!currentData ? '...' : currentData.length}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ul>

                <>{visibleRole && roleStrategy[visibleRole]}</>
            </MainStyled>
        )
    }

    return <div>Dykti app</div>
}

export default Main
