import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { DateTime } from 'luxon'
import { FieldsToSend, Role, roles } from '../types'

const getOrderProvidesTags: () => Array<{ type: 'Order'; id: Role }> = () => {
    return roles.reduce((res: Array<{ type: 'Order'; id: Role }>, item) => {
        // return []
        return [...res, { type: 'Order', id: item }]
    }, [])
}

export const dyktiApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `/api/`,
    }),
    tagTypes: ['User', 'Order', 'Worker', 'Service'],
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
            providesTags: [{ type: 'User' }, ...getOrderProvidesTags()],
        }),
        getWorkers: build.query({
            query: () => `getworkers`,

            providesTags: [{ type: 'Worker' }],
        }),
        getUsers: build.query({
            query: () => `getusers`,
            providesTags: [{ type: 'User' }],
        }),
        getLastDecisionOrders: build.query({
            query: (role: Role) => `getorders?role=LastDecisionUser`,

            providesTags: [{ type: 'Order', id: 'LastDecisionUser' }],
        }),

        getCompletedOrders: build.query({
            query: (role: Role) => `getorders?completed=true&role=${role}`,

            providesTags: [{ type: 'User' }, ...getOrderProvidesTags()],

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
        updateUserRoles: build.mutation({
            query(user: any) {
                return {
                    url: 'updateuserroles',
                    method: 'POST',
                    body: user,
                }
            },
            invalidatesTags: (res: any, err: any, arg: any) => {
                return [{ type: 'User' }]
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
            invalidatesTags: (res: any, err: any, arg: any) => [
                { type: 'User' },
                { type: 'Order', id: 'LastDecisionUser' },
            ],
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
            invalidatesTags: (result: any, error: any, args: FieldsToSend) => {
                if (error) {
                    console.log({ error })
                    return []
                }
                console.log({ args })
                if (args.userRoles?.includes('LastDecisionUser') && args.role !== 'LastDecisionUser') {
                    return [
                        { type: 'Order', id: args.role },
                        { type: 'Order', id: 'LastDecisionUser' },
                        { type: 'Worker' },
                    ]
                }
                return [{ type: 'Order', id: args.role }]
            },
        }),
        createService: build.mutation({
            query(order: FieldsToSend) {
                return {
                    url: 'createservice',
                    method: 'POST',
                    body: order,
                }
            },
            invalidatesTags: (result: any, error: any, args: FieldsToSend) => {
                return [{ type: 'Order', id: 'CompletedOrdersViewer' }]
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
    useUpdateUserRolesMutation,
    useCreateServiceMutation,
    useCreateBefaringStepMutation,
    useConfirmViewingByPerfomerMutation,
    useGetLastDecisionOrdersQuery,
} = dyktiApi
