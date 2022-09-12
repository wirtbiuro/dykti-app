import { createSlice } from '@reduxjs/toolkit'
import { IAuth } from '../types'

const initialState: IAuth = { status: 'HIDDEN' }

export const authSlice = createSlice({
    name: 'toggleAuth',
    initialState,
    reducers: {
        login: (state: IAuth, action: any): IAuth => {
            return { status: 'SIGN_IN' }
        },
        signup: (state: IAuth, action: any): IAuth => {
            return { status: 'SIGN_UP' }
        },
        hide: (state: IAuth, action: any): IAuth => {
            return { status: 'HIDDEN' }
        },
        toggle: (state: IAuth, action: any): IAuth => {
            return {
                status: state.status === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN',
            }
        },
    },
})

export const authReducer = authSlice.reducer

export const authActions = authSlice.actions
