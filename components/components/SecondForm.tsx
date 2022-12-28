import React from 'react'
import { useMultiSelect } from '../../hooks/new/useMultiSelect'
import FormMultiSelect from './FormMultiSelect'

const SecondForm = () => {
    const workersData = useMultiSelect({
        title: 'Workers',
        options: [
            ['olek', 'Olek'],
            ['kamil', 'Kamil'],
            ['michal', 'Michał'],
        ],
    })

    const check = () => {
        if (!workersData.check(false)) {
            workersData.setErrorValue('You should select at least one worker...')
            return false
        }
        return true
    }

    const onClick = () => {
        if (!check()) {
            return
        }
        console.log('submit')
    }

    return (
        <div>
            <FormMultiSelect connection={workersData} />
            <button onClick={onClick}>Send</button>
        </div>
    )
}

export default SecondForm
