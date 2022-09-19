import { IQuery, IOrder, stepNames, StepName } from '../../types'
import { useGetOrdersQuery, useGetCompletedOrdersQuery, dyktiApi } from '../../state/apiSlice'
import CreateBefaringStep from '../steps/CreateBefaringStep'
import Orders from '../Orders'
import { getArrIdx, getDatas } from '../../utilities'
import { useEffect } from 'react'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const BefaringPanel = () => {
    const currentStep: StepName = 'beffaringStep'

    const { data, isError, error, refetch }: IQuery<IOrder> = useGetOrders('BefaringUser')

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({
        data,
        currentStep,
    })

    if (!data) return <>Ładowanie danych...</>

    return (
        <AllCategoryOrders
            currentData={currentData}
            editedOrdersData={editedOrdersData}
            completedOrdersData={completedOrdersData}
            passedForEditData={passedForEditData}
            renderedComponent={<CreateBefaringStep />}
            stepName="beffaringStep"
        />
        // <>
        //     <h2>Sprawy bieżące:</h2>

        //     <Orders orders={currentData} stepName="beffaringStep">
        //         <CreateBefaringStep />
        //     </Orders>

        //     <h2>Do poprawienia:</h2>

        //     <Orders orders={editedOrdersData} stepName="beffaringStep">
        //         <CreateBefaringStep />
        //     </Orders>

        //     <h2>Przekazane dalej:</h2>

        //     <Orders orders={completedOrdersData} children={<CreateBefaringStep />} stepName="beffaringStep" />

        //     <h2>Przekazane do poprawienia:</h2>

        //     <Orders orders={passedForEditData} children={<CreateBefaringStep />} stepName="beffaringStep" />
        // </>
    )
}

export default BefaringPanel
