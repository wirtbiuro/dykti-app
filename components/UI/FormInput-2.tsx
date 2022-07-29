import React, { useRef, FC, useEffect } from 'react'

interface IFormInputProps<T = string> {
    type?: string
    name: T
    placeholder?: string
    setErr?: (el: HTMLDivElement | null) => void
    children?: JSX.Element
    defaultValue?: string
    defaultChecked?: boolean
}

function FormInput<T extends string>({
    type = 'text',
    name,
    placeholder,
    setErr,
    children,
    defaultValue,
    defaultChecked,
}: IFormInputProps<T>) {
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
                    defaultChecked={defaultChecked}
                />
            )}
        </div>
    )
}

export default FormInput
