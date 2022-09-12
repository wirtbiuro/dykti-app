import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { DateTime } from 'luxon'
import { FieldsToSend, Role } from '../types'

const orderProvidesTags: Array<{ type: 'Order'; id: Role }> = [
    { type: 'Order', id: 'BefaringUser' },
    { type: 'Order', id: 'ContractChecker' },
    { type: 'Order', id: 'ContractCreator' },
    { type: 'Order', id: 'ContractPreparer' },
    { type: 'Order', id: 'FormCreator' },
    { type: 'Order', id: 'OfferCreator' },
    { type: 'Order', id: 'WorkRespUser' },
    { type: 'Order', id: 'ReferenceUser' },
    { type: 'Order', id: 'QuestionnaireUser' },
]

export const dyktiApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api/',
    }),
    tagTypes: ['User', 'Order'],
    endpoints: (build: any) => ({
        getUser: build.query({
            query: () => `getuser`,
            providesTags: (res: any, err: any, args: any) => {
                console.log({ res, err, args })
                return [{ type: 'User' }]
            },
            // providesTags: ['User'],
        }),
        getOrders: build.query({
            query: (role: Role) => `getorders?role=${role}`,

            providesTags: [{ type: 'User' }, ...orderProvidesTags],
        }),
        getCompletedOrders: build.query({
            query: (role: Role) => `getorders?completed=true&role=${role}`,

            providesTags: [{ type: 'User' }, ...orderProvidesTags],

            transformResponse: (response: any, meta: any, arg: any) => {
                return response.sort((a: any, b: any) => {
                    return DateTime.fromISO(b.createdAt).toMillis() - DateTime.fromISO(a.createdAt).toMillis()
                })
            },
        }),
        createUser: build.mutation({
            query(user: any) {
                return {
                    url: 'createuser',
                    method: 'POST',
                    body: user,
                }
            },
            invalidatesTags: (res: any, err: any, arg: any) => {
                console.log('invalidates tags', { res, err, arg })
                return [{ type: 'User' }]
            },
            // invalidatesTags: ['User'],
            transformResponse: (response: any, meta: any, arg: any) => {
                console.log({ response })
                return response.user
            },
        }),
        login: build.mutation({
            query(user: any) {
                return {
                    url: 'login',
                    method: 'POST',
                    body: user,
                }
            },
            invalidatesTags: (res: any, err: any, arg: any) => [{ type: 'User' }],
            transformResponse: (response: any, meta: any, arg: any) => {
                return response.user
            },
        }),
        createOrder: build.mutation({
            query(order: FieldsToSend) {
                return {
                    url: 'createorder',
                    method: 'POST',
                    body: order,
                }
            },
            invalidatesTags: (result: any, error: any, args: any) => {
                if (error) {
                    console.log({ error })
                    return []
                }
                console.log({ args })
                return [{ type: 'Order', id: args.role }]
            },
        }),
        createBefaringStep: build.mutation({
            query(data: any) {
                return {
                    url: 'createbefaringstep',
                    method: 'POST',
                    body: data,
                }
            },
            invalidatesTags: [{ type: 'Order' }],
        }),
        confirmViewingByPerfomer: build.mutation({
            query(data: any) {
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
