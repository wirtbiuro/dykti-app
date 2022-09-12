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

const Home: NextPage = () => {
    return (
        <>
            <Header />
            <Main />
            <Auth />
        </>
    )
}

export default Home
