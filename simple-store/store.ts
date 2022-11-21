import { useEffect, useState } from 'react'

interface IStore {
    visibleOrderId?: null | number | string
}

class Store {
    data: IStore = {
        visibleOrderId: null,
    }
    finalCalls: Function[] = []

    setData = (data: IStore) => {
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

const simpleStore = new Store()

export const useSimpleStore = () => {
    const [data, setData] = useState<IStore>(simpleStore.data)
    useEffect(() => {
        simpleStore.registerFinalCall(setData)
        return () => {
            simpleStore.unregisterFinalCall(setData)
        }
    }, [])
    return [data, simpleStore.setData] as const
}
