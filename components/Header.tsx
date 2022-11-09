import React, { useState, useEffect } from 'react'
import { useGetUserQuery, dyktiApi } from '../state/apiSlice'
import { HeaderStyled } from '../styles/styled-components'
import axios from 'axios'
import { useAppDispatch } from '../state/hooks'
import { authActions } from '../state/authSlice'
import { Spin } from 'antd'

const Header = () => {
    const [logoutLoading, setLogoutLoading] = useState(false)
    const dispatch = useAppDispatch()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQueryState()

    const { isLoading, isError, data, isUninitialized } = getUserQueryData

    const [refetchUser] = getUser.useLazyQuery()

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
        dispatch(authActions.login({}))
    }

    useEffect(() => {
        onLogin()
    }, [isError])

    return (
        // <Spin spinning={logoutLoading}>
        <HeaderStyled>
            {!isError && data?.username}
            {data?.username && !isError && (
                <button onClick={onLogout} disabled={logoutLoading}>
                    Logout
                </button>
            )}
            {/* {(!data || isError) && !isLoading && !isUninitialized && <button onClick={onLogin}>Login</button>} */}
        </HeaderStyled>
        // </Spin>
    )
}

export default Header
