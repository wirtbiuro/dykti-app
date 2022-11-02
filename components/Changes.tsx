import React, { useState, useEffect, FC } from 'react'
import { StepType, stepNamesRelations, roleTitles, IUser } from '../types'
import { DateTime } from 'luxon'
import { selectData, fieldNames } from '../accessories/constants'
import { ChangesStyled } from '../styles/styled-components'

interface IChangesProps {
    step: StepType
    prevStep: StepType
}

const Changes: FC<IChangesProps> = ({ step, prevStep }) => {
    const getChanges = () => {
        const changes: JSX.Element[] = []

        let key: keyof typeof step

        for (key in step) {
            if (step.hasOwnProperty(key)) {
                if (key === 'stepCreatorId' || key === 'createdAt' || key === 'id') {
                    continue
                }

                if (prevStep && step[key] !== prevStep[key]) {
                    // changes.push(`${prevStep[key]} --> ${step[key]}`)

                    let value = prevStep[key]
                    if (value === null) value = '-'
                    if (value === '') value = '-'
                    if (value === true) value = 'tak'
                    if (value === false) value = 'nie'

                    if (typeof value === 'string') {
                        if (DateTime.fromISO(value).toString() !== 'Invalid DateTime') {
                            value = DateTime.fromISO(value).toFormat('dd.MM.yyyy HH:mm')
                        }
                    }

                    if (['passedTo', 'maxPromotion', 'createdByStep'].includes(key)) {
                        const relation = stepNamesRelations.find((relation) => relation[1] === value)
                        const role = relation![0]
                        value = roleTitles[role]
                    }

                    if (key === 'stepCreator') {
                        const _value = value as IUser
                        value = _value.name || _value.username
                    }

                    if (['workStepTeam'].includes(key)) {
                        type keyType = keyof typeof selectData
                        const _value = value as string
                        const values = _value.split('; ')
                        let _values: string[] = []

                        values.map((value) => {
                            const row = selectData[key as keyType].find((row) => row[0] === value)
                            if (row) _values.push(row[1])
                        })
                        value = _values.join('; ')
                    }

                    // changes.push(`${fieldNames[key]}: ${value}`)
                    changes.push(
                        <div className="change">
                            <strong>{fieldNames[key]}:</strong> <p>{value?.toString()}</p>
                        </div>
                    )
                }
            }
        }

        return changes
    }

    const creatorName = prevStep.stepCreator?.name || prevStep.stepCreator?.username

    return (
        <ChangesStyled>
            <div className="col date">
                <strong>Godzina&nbsp;i&nbsp;data</strong>
                <p>{DateTime.fromISO(prevStep.createdAt!).toFormat('dd.MM.yyyy HH:mm')}</p>
            </div>

            <div className="col">
                <strong>Kto&nbsp;zmienił</strong>
                <p>{creatorName}</p>
            </div>

            <div className="col">
                <strong>Co zostało zmienione</strong>
                <p>{getChanges()}</p>
            </div>
        </ChangesStyled>
    )
}

export default Changes
