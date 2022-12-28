import React, { FC, ChangeEvent } from 'react'
import { YesNoSelectProps } from '../../hooks/new/useYesNoSelect'

const YesNoSelect: FC<{ connection: YesNoSelectProps; disabled?: boolean }> = ({ connection, disabled = false }) => {
    const { value, setValueByString, errorValue, setErrorValue, title, ref } = connection

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault()
        setValueByString(e.target.value)
        setErrorValue('')
    }

    const showedValue = value === null ? 'select' : value === true ? 'yes' : 'no'

    return (
        <div className="withErr">
            <p>{title}</p>
            <div className="formError">{errorValue}</div>
            <select ref={ref} value={showedValue} onChange={onChange} disabled={disabled}>
                <option value="select">Wybierz</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>
        </div>
    )
}

export default YesNoSelect
