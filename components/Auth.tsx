import React, { SyntheticEvent, useRef, FormEvent, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Spin } from 'antd'
import axios from 'axios'
import { AuthStyled } from '../styles/styled-components'
import { IAuth, IUser } from '../types'
import { useAppDispatch, useAppSelector } from '../state/hooks'
import { authReducer, authActions } from '../state/authSlice'
import { RootState } from '../state/store'
import { useCreateUserMutation, useGetUserQuery, useLoginMutation, dyktiApi } from '../state/apiSlice'

type FormType = {
    username: { value: String; focus: Function }
    password: { value: String; focus: Function }
    repeat: { value: String; focus: Function }
}

interface FormElement extends HTMLFormElement {}
interface FormElement extends FormType {}

const Auth = () => {
    const dispatch = useAppDispatch()

    const [createUser, createUserResult] = useCreateUserMutation()
    const [login] = useLoginMutation()

    const getUser = dyktiApi.endpoints.getUser as any
    const getUserQueryData = getUser.useQueryState()

    const { isLoading, isError, isSuccess } = getUserQueryData
    const [isSpinning, setIsSpinning] = useState<boolean>(false)

    const status = useAppSelector((state: RootState) => state.auth.status)
    // const loading = useAppSelector((state: RootState) => state.user.loading)

    const usernameErrRef = useRef<HTMLDivElement>(null)
    const passwordErrRef = useRef<HTMLDivElement>(null)
    const formRef = useRef<FormElement>(null)

    const changeStatus = () => {
        // toggleAuth({ status, dispatch })
        dispatch(authActions.toggle({}))
    }

    useEffect(() => {
        if (isSuccess) {
            dispatch(authActions.hide({}))
        }
    }, [isSuccess])

    useEffect(() => {
        if (
            status !== 'HIDDEN' &&
            formRef.current &&
            (formRef.current.username.value !== '' || formRef.current.password.value !== '')
        ) {
            formCheck(formRef.current)
        }
    }, [status])

    const close = (e: SyntheticEvent<HTMLDivElement>) => {
        return
        const target = e.target as HTMLDivElement
        if (target.classList.contains('close-auth')) dispatch(authActions.hide({}))
    }

    function formCheck(target: (EventTarget & FormType) | HTMLFormElement): boolean {
        usernameErrRef.current!.innerHTML = ''
        passwordErrRef.current!.innerHTML = ''
        if (target.username.value.trim() === '') {
            target.username.focus()
            usernameErrRef.current!.innerHTML = '<span>&nbsp;Required Field&nbsp;</span>'
            return false
        }
        if (target.password.value.length < 6) {
            target.password.focus()
            passwordErrRef.current!.innerHTML = '<span>&nbsp;Password should not be less 6 signs.&nbsp;</span>'
            return false
        }
        if (status === 'SIGN_UP' && target.password.value !== target.repeat.value) {
            target.repeat.focus()
            passwordErrRef.current!.innerHTML =
                '<span>&nbsp;Password and Repeat password fields should be equal.&nbsp;</span>'
            return false
        }
        return true
    }

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        const target = e.target as typeof e.target & FormType
        if (!formCheck(target)) return

        const doFn = status === 'SIGN_UP' ? createUser : login

        setIsSpinning(true)

        await doFn({
            username: target.username.value.trim(),
            password: target.password.value,
        })

        setIsSpinning(false)
    }

    const formChanged = (e: SyntheticEvent<HTMLFormElement>) => {
        const target = e.target as HTMLFormElement
        switch (target.name) {
            case 'username':
                usernameErrRef.current!.innerHTML = ''
            case 'password':
                passwordErrRef.current!.innerHTML = ''
        }
    }

    if (status === 'HIDDEN') return null

    return (
        <AuthStyled>
            <Spin spinning={isSpinning}>
                <div className="close-auth" onClick={close}>
                    {isError && (
                        <div className="auth">
                            <form onSubmit={submit} onChange={formChanged} ref={formRef}>
                                <div className="withErr">
                                    <div className="formError" ref={usernameErrRef}></div>
                                    <input type="text" name="username" placeholder="username" />
                                </div>
                                <div className="withErr">
                                    <div className="formError" ref={passwordErrRef}></div>
                                    <input type="password" name="password" placeholder="password" />
                                </div>
                                {status === 'SIGN_UP' && (
                                    <>
                                        <div className="formError"></div>
                                        <input type="password" name="repeat" placeholder="repeat password" />
                                    </>
                                )}
                                <input type="submit" value="send" />
                            </form>
                            <a onClick={changeStatus}>
                                {status === 'SIGN_IN' ? 'Nie masz konta? Sign Up' : 'Masz konto? Sign In'}
                            </a>
                        </div>
                    )}
                </div>
            </Spin>
        </AuthStyled>
    )
}

export default Auth
