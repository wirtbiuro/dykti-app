import React, { useState, useEffect } from 'react'
import { useGetUserQuery, dyktiApi } from '../state/apiSlice'
import { HeaderStyled } from '../styles/styled-components'
import axios from 'axios'
import { useAppDispatch } from '../state/hooks'
import { authActions } from '../state/authSlice'
import { Spin } from 'antd'
import { useSimpleStore } from '../simple-store/store'

const Header = () => {
    const [logoutLoading, setLogoutLoading] = useState(false)
    const dispatch = useAppDispatch()

    const getUser = dyktiApi.endpoints.getUser as any

    const [refetchUser] = getUser.useLazyQuery()

    const getUserQueryData = getUser.useQueryState()
    const { data, isLoading, isError, isSuccess } = getUserQueryData

    const [simpleStore, setSimpleStore] = useSimpleStore()

    const onLogin = () => {
        dispatch(authActions.login({}))
    }

    useEffect(() => {
        onLogin()
    }, [isError])

    const onLogout = async () => {
        setLogoutLoading(true)
        await axios({
            url: '/api/logout',
            withCredentials: true,
        })
        refetchUser()
        setLogoutLoading(false)
    }

    return (
        <HeaderStyled>
            {/* <div className="header"></div> */}
            {!isError && data?.username}
            {data?.username && !isError && (
                <Spin spinning={logoutLoading}>
                    <button onClick={onLogout} disabled={logoutLoading}>
                        Logout
                    </button>
                </Spin>
            )}
            {/* {(!data || isError) && !isLoading && !isUninitialized && <button onClick={onLogin}>Login</button>} */}
        </HeaderStyled>
    )
}

export default Header
