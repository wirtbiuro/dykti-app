import React, { useRef, useEffect, FC, ChangeEvent } from 'react'
import { FormSelectProps } from '../../hooks/new/useFormSelect'

const FormSelect: FC<{ connection: FormSelectProps; disabled?: boolean }> = ({ connection, disabled = false }) => {
    const { value, setValue, errorValue, setErrorValue, check, title, ref, options } = connection

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault()
        setValue(e.target.value)
        setErrorValue('')
    }

    return (
        <div className="withErr">
            <p>{title}</p>
            <div className="formError">{errorValue}</div>
            <select ref={ref} value={value} onChange={onChange} disabled={disabled}>
                <>
                    {options.map((option) => (
                        <option value={option[0]} key={option[0]}>
                            {option[1]}
                        </option>
                    ))}
                </>
            </select>
        </div>
    )
}

export default FormSelect
