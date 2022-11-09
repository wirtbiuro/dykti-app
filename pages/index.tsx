import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Auth from '../components/Auth'
import Header from '../components/Header'
import Main from '../components/Main'
import { IQuery, IUser } from '../types'
import { useGetUserQuery, dyktiApi } from '../state/apiSlice'
import { useEffect } from 'react'
import { Spin } from 'antd'
import { AllStyled } from '../styles/styled-components'

const Home: NextPage = () => {
    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQueryState()

    const { isLoading, isError, data, isFetching } = getUserQueryData

    return (
        <Spin spinning={isFetching || isLoading}>
            <AllStyled>
                <div className="centered">
                    <Header />
                    <Main />
                    <Auth />
                </div>
            </AllStyled>
        </Spin>
    )
}

export default Home
