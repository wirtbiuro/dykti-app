import React from 'react'
import { useGetUserQuery } from '../state/apiSlice'
import { HeaderStyled } from '../styles/styled-components'

const Header = () => {
    const getUserData = useGetUserQuery()

    console.log({ getUserData })

    return <HeaderStyled>{getUserData.data?.username}</HeaderStyled>
}

export default Header
