import React, { useRef, FC, useEffect, RefObject } from 'react'
import { IOutputRef } from '../../types'
import { showErrorFormModal } from '../../utilities'
import { Modal } from 'antd'
import { useFormInputType } from '../../hooks/useFormInput'

interface IFormInputProps<T = string> {
    type?: 'text' | 'checkbox'
    name?: T
    placeholder?: string
    children?: JSX.Element
    checkFn?: (value: string | boolean) => boolean
    onErrorOk?: Function
    defaultValue?: string
    defaultChecked?: boolean
    connection?: useFormInputType
}

function FormInput<T extends string>({
    connection,
    type = 'text',
    children,
    name,
    placeholder,
    defaultValue,
    defaultChecked,
    checkFn = (value: string | boolean) => {
        if (typeof value === 'string') {
            return value !== ''
        }
        if (typeof value === 'boolean') {
            return value !== true
        }
        return false
    },
    onErrorOk,
}: IFormInputProps<T>) {
    const errRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const getValue = () => {
        // console.log('form input get value')
        return inputRef.current?.type === 'text' ? inputRef.current?.value : inputRef.current?.checked
    }

    const check = () => {
        // console.log('form input check')
        const isChecked =
            inputRef.current?.type === 'text'
                ? checkFn(inputRef.current?.value)
                : checkFn(inputRef.current?.checked || false)
        // console.log({ isChecked })
        connection?.__setIsChecked(isChecked)
        return isChecked
    }

    const showError = (errDescription: string) => {
        // console.log({ errDescription, errRef })
        showErrorFormModal({
            element: inputRef.current as HTMLInputElement,
            errElement: errRef.current as HTMLDivElement,
            modal: Modal,
            onOk: onErrorOk,
            errDescription,
        })
    }

    const onChange = () => {
        // console.log('form input changed', connection)
        errRef.current!.innerHTML = ''
        check()
        connection?.__setValue(getValue())
        connection?.__setErrTitleElement(getErrTitleElement())
    }

    const getErrTitleElement = () => {
        return errRef.current
    }

    const setValue = (value: string | boolean) => {
        typeof value === 'string' ? (inputRef.current!.value = value) : (inputRef.current!.checked = value)
    }

    useEffect(() => {
        check()
        // console.log({ connection })
        connection?.__setShowError(() => showError)
        connection?.__setCheck(() => check)
        connection?.__setSetValue(() => setValue)
        connection?.__setValue(getValue())
        connection?.__setErrTitleElement(getErrTitleElement())
    }, [])

    return (
        <div className="withErr">
            <div className="formError" ref={errRef}></div>
            <div className="checkbox-styled">
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
        </div>
    )
}

export default FormInput
