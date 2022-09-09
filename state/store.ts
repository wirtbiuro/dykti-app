import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice'
import { dyktiApi } from './apiSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [dyktiApi.reducerPath]: dyktiApi.reducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(dyktiApi.middleware),
})

const _store = store as any

export type RootState = ReturnType<typeof _store.getState>

export type AppDispatch = typeof store.dispatch
