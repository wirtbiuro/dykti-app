import React from 'react'
import { IQuery, IOrder, StepName } from '../../types'
import Orders from '../Orders'
import { getDatas } from '../../utilities'
import CreateWorkStep from '../steps/CreateWorkStep'
import useGetOrders from '../../hooks/useGetOrders'
import AllCategoryOrders from '../AllCategoryOrders'

const WorkStepPanel = () => {
    const currentStep: StepName = 'workStep'

    const { data, isError }: IQuery<IOrder> = useGetOrders('WorkRespUser')

    console.log({ data })

    const { completedOrdersData, currentData, editedOrdersData, passedForEditData } = getDatas({ data, currentStep })

    if (!data) return <>Ładowanie danych...</>

    return (
        <AllCategoryOrders
            currentData={currentData}
            editedOrdersData={editedOrdersData}
            completedOrdersData={completedOrdersData}
            passedForEditData={passedForEditData}
            renderedComponent={<CreateWorkStep />}
            stepName="workStep"
        />
    )
}

export default WorkStepPanel
