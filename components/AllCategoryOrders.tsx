import React, { FC } from 'react'
import Orders from './Orders'
import { IOrder, StepName } from '../types'

interface IAllCategoryOrders {
    currentData: IOrder[]
    editedOrdersData: IOrder[]
    completedOrdersData: IOrder[]
    passedForEditData: IOrder[]
    renderedComponent: JSX.Element
    stepName: StepName
    currentOrEditedOrdersData: IOrder[]
}

const AllCategoryOrders: FC<IAllCategoryOrders> = ({
    currentData,
    editedOrdersData,
    completedOrdersData,
    passedForEditData,
    renderedComponent,
    stepName,
    currentOrEditedOrdersData,
}) => {
    return (
        <>
            <h2>Sprawy bieżące:</h2>

            {/* <Orders orders={currentData} stepName={stepName} /> */}
            <Orders orders={currentOrEditedOrdersData} stepName={stepName} />

            {/* <h2>Do poprawienia:</h2>

            <Orders orders={editedOrdersData} stepName={stepName} /> */}

            <h2>Przekazane dalej:</h2>

            <Orders orders={completedOrdersData} stepName={stepName} />

            <h2>Przekazane do poprawienia:</h2>

            <Orders orders={passedForEditData} stepName={stepName} />
        </>
    )
}

export default AllCategoryOrders
