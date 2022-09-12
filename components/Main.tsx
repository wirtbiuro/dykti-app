import React, { useState, useEffect } from 'react'
import { useGetUserQuery } from '../state/apiSlice'
import CreateForm from './steps/CreateForm'
import { IQuery, IUser, Role } from '../types'
import BefaringPanel from './panels/BefaringPanel'
import CreatorFormPanel from './panels/CreatorFormPanel'
import OfferCreatorPanel from './panels/OfferCreatorPanel'
import ContractCreatorPanel from './panels/ContractCreatorPanel'
import ContractCheckerPanel from './panels/ContractCheckerPanel'
import ContractPreparerPanel from './panels/ContractPreparerPanel'
import WorkStepPanel from './panels/WorkStepPanel'
import QuestionnairePanel from './panels/QuestionnairePanel'
import ReferencePanel from './panels/ReferencePanel'

type RoleStrategyType = Record<Role, JSX.Element>
type RoleTitleType = Record<Role, string>

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
}

const roleTitles: RoleTitleType = {
    FormCreator: 'Tworzenie formularza',
    BefaringUser: 'Befaring',
    OfferCreator: 'Tworzenie oferty',
    ContractPreparer: 'Przygotowanie kontraktu',
    ContractChecker: 'Sprawdzenie kontraktu',
    ContractCreator: 'Tworzenie kontraktu',
    WorkRespUser: 'Praca',
    QuestionnaireUser: 'Zakończenie',
    ReferenceUser: 'Prośba o referencje',
}

const Main = () => {
    const { isError, data }: IQuery<IUser> = useGetUserQuery()

    const [visibleRole, setVisibleRole] = useState<Role>()

    console.log({ data })

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
                    {data.role.map((role) => {
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
