import React, { ChangeEvent, FC } from 'react'
import { TextFormInputProps } from '../../hooks/new/useTextFormInput'

const TextFormInput: FC<{ connection: TextFormInputProps }> = ({ connection }) => {
    const { textValue, setTextValue, errorValue, setErrorValue, title, placeholder, ref } = connection

    const onTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setTextValue(e.target.value)
        setErrorValue('')
    }

    return (
        <div>
            <div className="title">{title}</div>
            <div className="formError">{errorValue}</div>
            <input type="text" value={textValue} onChange={onTextChange} placeholder={placeholder} ref={ref} />
        </div>
    )
}

export default TextFormInput
