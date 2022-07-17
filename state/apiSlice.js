import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { DateTime } from 'luxon'

export const dyktiApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api/',
    }),
    tagTypes: ['User', 'Order'],
    endpoints: (build) => ({
        getUser: build.query({
            query: () => `getuser`,
            providesTags: (res, err, args) => {
                console.log({ res, err, args })
                return [{ type: 'User' }]
            },
            // providesTags: ['User'],
        }),
        getOrders: build.query({
            query: () => `getorders`,
            providesTags: [{ type: 'User' }, { type: 'Order' }],
        }),
        getCompletedOrders: build.query({
            query: () => `getorders?completed=true`,
            providesTags: [{ type: 'User' }, { type: 'Order' }],
            transformResponse: (response, meta, arg) => {
                return response.sort((a, b) => {
                    return (
                        DateTime.fromISO(b.createdAt).toMillis() -
                        DateTime.fromISO(a.createdAt).toMillis()
                    )
                })
            },
        }),
        createUser: build.mutation({
            query(user) {
                return {
                    url: 'createuser',
                    method: 'POST',
                    body: user,
                }
            },
            invalidatesTags: (res, err, arg) => {
                console.log('invalidates tags', { res, err, arg })
                return [{ type: 'User' }]
            },
            // invalidatesTags: ['User'],
            transformResponse: (response, meta, arg) => {
                console.log({ response })
                return response.user
            },
        }),
        login: build.mutation({
            query(user) {
                return {
                    url: 'login',
                    method: 'POST',
                    body: user,
                }
            },
            invalidatesTags: (res, err, arg) => [{ type: 'User' }],
            transformResponse: (response, meta, arg) => {
                return response.user
            },
        }),
        createOrder: build.mutation({
            query(order) {
                return {
                    url: 'createorder',
                    method: 'POST',
                    body: order,
                }
            },
            invalidatesTags: [{ type: 'Order' }],
        }),
        createBefaringStep: build.mutation({
            query(data) {
                return {
                    url: 'createbefaringstep',
                    method: 'POST',
                    body: data,
                }
            },
            invalidatesTags: [{ type: 'Order' }],
        }),
        confirmViewingByPerfomer: build.mutation({
            query(data) {
                return {
                    url: 'confirmviewingbyperfomer',
                    method: 'POST',
                    body: data,
                }
            },
            invalidatesTags: [{ type: 'Order' }],
        }),
    }),
})

export const {
    useGetUserQuery,
    useGetOrdersQuery,
    useGetCompletedOrdersQuery,
    useCreateUserMutation,
    useLoginMutation,
    useCreateOrderMutation,
    useCreateBefaringStepMutation,
    useConfirmViewingByPerfomerMutation,
} = dyktiApi
