import React, { useRef, FC, useEffect, RefObject } from 'react'
import { IOutputRef } from '../../types'
import { showErrorFormModal } from '../../utilities'
import { Modal } from 'antd'

interface IFormInputProps<T = string> {
    type?: 'text' | 'checkbox'
    name?: T
    placeholder?: string
    children?: JSX.Element
    dataRef?: RefObject<IOutputRef>
    checkFn?: Function
    onErrorOk?: Function
    defaultValue?: string
    defaultChecked?: boolean
}

function FormInput<T extends string>({
    type = 'text',
    children,
    name,
    placeholder,
    defaultValue,
    defaultChecked,
    dataRef,
    checkFn = (value: string | boolean) => {
        if (typeof value === 'string') {
            return value !== ''
        }
        if (typeof value === 'boolean') {
            return value !== true
        }
    },
    onErrorOk,
}: IFormInputProps<T>) {
    const errRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const getValue = () => {
        return inputRef.current?.type === 'text'
            ? inputRef.current?.value
            : inputRef.current?.checked
    }

    const check = () => {
        return inputRef.current?.type === 'text'
            ? checkFn(inputRef.current?.value)
            : checkFn(inputRef.current?.checked)
    }

    const showError = () => {
        showErrorFormModal({
            element: inputRef.current as HTMLInputElement,
            errElement: errRef.current as HTMLDivElement,
            modal: Modal,
            onOk: onErrorOk,
        })
    }

    const onChange = () => {
        errRef.current!.innerHTML = ''
    }

    const getErrTitleElement = () => {
        return errRef.current
    }

    useEffect(() => {
        if (dataRef) {
            dataRef!.current!.check = check
            dataRef!.current!.getValue = getValue
            dataRef!.current!.showError = showError
            dataRef!.current!.getErrTitleElement = getErrTitleElement
        }
    }, [dataRef])

    return (
        <div className="withErr">
            <div className="formError" ref={errRef}></div>
            <input
                ref={inputRef}
                type={type}
                name={name}
                placeholder={placeholder}
                defaultValue={defaultValue}
                defaultChecked={defaultChecked}
                onChange={onChange}
            />
            {children}
        </div>
    )
}

export default FormInput
