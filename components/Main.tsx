import React, { useState, useEffect } from 'react'
import { useGetUserQuery } from '../state/apiSlice'
import CreateForm from './CreateForm'
import { IQuery, IUser, Role } from '../types'
import BefaringPanel from './BefaringPanel'
import CreatorFormPanel from './CreatorFormPanel'
import OfferCreatorPanel from './OfferCreatorPanel'
import ContractCreatorPanel from './ContractCreatorPanel'
import ContractCheckerPanel from './ContractCheckerPanel'

type RoleStrategyType = Record<Role, JSX.Element>
type RoleTitleType = Record<Role, string>

const roleStrategy: RoleStrategyType = {
    FormCreator: <CreatorFormPanel />,
    BefaringUser: <BefaringPanel />,
    OfferCreator: <OfferCreatorPanel />,
    ContractPreparer: <ContractCreatorPanel />,
    ContractChecker: <ContractCheckerPanel />,
    ContractCreator: <></>,
    WorkRespUser: <></>,
}

const roleTitles: RoleTitleType = {
    FormCreator: 'Tworzenie formularza',
    BefaringUser: 'Befaring',
    OfferCreator: 'Tworzenie oferty',
    ContractPreparer: 'Przygotowanie kontraktu',
    ContractChecker: 'Sprawdzenie kontraktu',
    ContractCreator: 'Tworzenie kontraktu',
    WorkRespUser: 'Praca',
}

const Main = () => {
    const {
        isError,
        isLoading,
        isSuccess,
        data,
    }: IQuery<IUser> = useGetUserQuery()

    const [visibleRole, setVisibleRole] = useState<Role>()

    useEffect(() => {
        if (data) {
            setVisibleRole(data.role[0])
        }
    }, [data])

    const roleClicked = (role: Role) => {
        setVisibleRole(role)
    }

    if (data && data.role) {
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
                                        fontWeight:
                                            visibleRole === role
                                                ? 'bold'
                                                : 'normal',
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
