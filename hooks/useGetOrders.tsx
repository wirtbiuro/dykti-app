import { dyktiApi } from '../state/apiSlice'
import { useEffect } from 'react'
import useErrFn from './useErrFn'
import { withRtkQueryTokensCheck } from '../utilities'
import { Role, IQuery, IOrder } from '../types'

export default function (role: Role): IQuery<IOrder> {
    const [getOrders, result] = dyktiApi.endpoints.getOrders.useLazyQuery()

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
