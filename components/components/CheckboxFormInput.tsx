import React, { ChangeEvent, FC } from 'react'
import { CheckboxFormInputProps } from '../../hooks/new/useCheckboxFormInput'
import { FormStyled } from '../../styles/styled-components'

const CheckboxFormInput: FC<{ connection: CheckboxFormInputProps; disabled?: boolean }> = ({
    connection,
    disabled = false,
}) => {
    const { checkboxValue, setCheckboxValue, errorValue, setErrorValue, title, ref } = connection

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        // e.preventDefault()
        console.log('changed', e.target.checked)
        setCheckboxValue(e.target.checked)
        setErrorValue('')
    }

    return (
        <FormStyled>
            <div className="formError">{errorValue}</div>
            <div className="checkbox-styled">
                <input
                    type="checkbox"
                    checked={checkboxValue || false}
                    onChange={onChange}
                    ref={ref}
                    disabled={disabled}
                />
                <div className="title">{title}</div>
            </div>
        </FormStyled>
    )
}

export default CheckboxFormInput
