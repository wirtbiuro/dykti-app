import React from 'react'
import { useGetUserQuery } from '../state/apiSlice'
import CreateForm from './CreateForm'
import { IQuery, IUser } from '../types'
import BefaringPanel from './BefaringPanel'
import CreatorFormPanel from './CreatorFormPanel'
import OfferCreatorPanel from './OfferCreatorPanel'

const roleStrategy = {
    FormCreator: <CreatorFormPanel />,
    BefaringUser: <BefaringPanel />,
    OfferCreator: <OfferCreatorPanel />,
}

const Main = () => {
    const {
        isError,
        isLoading,
        isSuccess,
        data,
    }: IQuery<IUser> = useGetUserQuery()

    if (data && data.role) {
        return <>{roleStrategy[data.role]}</>
    }

    return <div>Dykti app</div>
}

export default Main
