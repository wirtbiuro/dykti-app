import React, { useRef, FC, useEffect } from 'react'
import { IFormStep } from '../../types'
import { Names } from '../CreateForm'

interface IFormInputProps<T = string> {
    type?: string
    name: T
    placeholder?: string
    setErr?: (el: HTMLDivElement | null) => void
    children?: JSX.Element
    defaultValue?: string
}

const FormInput: FC<IFormInputProps> = ({
    type = 'text',
    name,
    placeholder,
    setErr,
    children,
    defaultValue,
}) => {
    const errRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (setErr) {
            setErr(errRef.current)
        }
    }, [errRef.current])

    return (
        <div className="withErr">
            <div className="formError" ref={errRef}></div>
            {children ?? (
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                />
            )}
        </div>
    )
}

export const CreateFormFormInput: FC<IFormInputProps<Names>> = (props) => (
    <FormInput {...props} />
)

export default FormInput
