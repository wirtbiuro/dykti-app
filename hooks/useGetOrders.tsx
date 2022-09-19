import { dyktiApi } from '../state/apiSlice'
import { useEffect } from 'react'
import useErrFn from './useErrFn'
import { withRtkQueryTokensCheck } from '../utilities'
import { Role, IQuery, IOrder } from '../types'

export default function (role: Role): IQuery<IOrder> {
    const getOrdersEndpoint = dyktiApi.endpoints.getOrders as any
    const [getOrders, result] = getOrdersEndpoint.useLazyQuery()

    const errFn = useErrFn()

    useEffect(() => {
        withRtkQueryTokensCheck({
            err: errFn,
            cb: () => {
                return getOrders(role)
            },
        })
    }, [])

    return result as IQuery<IOrder>
}
