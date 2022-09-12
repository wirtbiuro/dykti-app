import React, { useState } from 'react'
import { useGetUserQuery, dyktiApi } from '../state/apiSlice'
import { HeaderStyled } from '../styles/styled-components'
import axios from 'axios'
import { useAppDispatch } from '../state/hooks'
import { authActions } from '../state/authSlice'
import { IUser } from '../types'

const Header = () => {
    const [logoutLoading, setLogoutLoading] = useState(false)
    const dispatch = useAppDispatch()

    const getUserQueryData = dyktiApi.endpoints.getUser.useQueryState()
    const { isLoading, isError, data } = getUserQueryData

    const [refetchUser] = dyktiApi.endpoints.getUser.useLazyQuery()

    console.log({ data })

    const onLogout = async () => {
        setLogoutLoading(true)
        await axios({
            url: '/api/logout',
            withCredentials: true,
        })
        refetchUser()
        setLogoutLoading(false)
    }

    const onLogin = () => {
        dispatch(authActions.login())
    }

    return (
        <HeaderStyled>
            {!isError && data?.username}
            {data?.username && !isError && (
                <button onClick={onLogout} disabled={logoutLoading}>
                    Logout
                </button>
            )}
            {(!data || isError) && !isLoading && <button onClick={onLogin}>Login</button>}
        </HeaderStyled>
    )
}

export default Header
