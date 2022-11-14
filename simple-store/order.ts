import { useEffect, useState } from 'react'

interface IOrderStore {
    visibleOrderId?: null | number | string
}

class OrderStore {
    data: IOrderStore = {
        visibleOrderId: null,
    }
    finalCalls: Function[] = []

    setData = (data: IOrderStore) => {
        this.data = { ...this.data, ...data }
        console.log({ data: this.data, finalCalls: this.finalCalls })
        this.doFinalCalls()
    }

    registerFinalCall = (finalCall: Function) => {
        // console.log('registerFinalCall')
        this.finalCalls.push(finalCall)
    }
    unregisterFinalCall = (finalCall: Function) => {
        // console.log('unregisterFinalCall')
        this.finalCalls = this.finalCalls.filter((_finallCall) => _finallCall !== finalCall)
    }

    doFinalCalls = () => {
        this.finalCalls.forEach((finalCall) => {
            finalCall(this.data)
        })
    }
}

const orderStore = new OrderStore()

export const useOrderStore = () => {
    const [data, setData] = useState<IOrderStore>(orderStore.data)
    useEffect(() => {
        orderStore.registerFinalCall(setData)
        return () => {
            orderStore.unregisterFinalCall(setData)
        }
    }, [])
    return [data, orderStore.setData] as const
}
