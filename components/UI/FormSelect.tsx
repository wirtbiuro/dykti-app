import React, { useRef, useEffect } from 'react'
import { showErrorFormModal } from '../../utilities'
import { Modal } from 'antd'
import { useFormSelectType } from '../../hooks/useFormSelect'

interface IFormSelectProps<T = string> {
    type?: 'text' | 'checkbox'
    name?: T
    placeholder?: string
    checkFn?: Function
    onErrorOk?: Function
    defaultValue?: string
    connection?: useFormSelectType
    options: string[][]
    title?: string
}
function FormSelect<T extends string>({
    connection,
    name,
    defaultValue,
    checkFn = (value: string) => {
        console.log({ value })
        return value !== 'select'
    },
    onErrorOk,
    options,
    title,
}: IFormSelectProps<T>) {
    const errRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLSelectElement>(null)

    const getValue = () => {
        return selectRef.current?.value
    }

    const check = () => {
        const isChecked = checkFn(selectRef.current?.value)
        connection?.__setIsChecked(isChecked)
        return isChecked
    }

    const showError = () => {
        showErrorFormModal({
            element: selectRef.current as HTMLSelectElement,
            errElement: errRef.current as HTMLDivElement,
            modal: Modal,
            onOk: onErrorOk,
        })
    }

    const onChange = () => {
        errRef.current!.innerHTML = ''
        check()
        connection?.__setValue(getValue())
        connection?.__setErrTitleElement(getErrTitleElement())
    }

    const getErrTitleElement = () => {
        return errRef.current
    }

    const setValue = (value: string) => {
        return (selectRef.current!.value = value)
    }

    useEffect(() => {
        check()
        console.log({ connection })
        connection?.__setShowError(() => showError)
        connection?.__setCheck(() => check)
        connection?.__setSetValue(() => setValue)
        connection?.__setValue(getValue())
        connection?.__setErrTitleElement(getErrTitleElement())
    }, [])

    return (
        <div className="withErr">
            <p>{title}</p>
            <div className="formError" ref={errRef}></div>
            <select name={name} ref={selectRef} defaultValue={defaultValue} onChange={onChange}>
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
