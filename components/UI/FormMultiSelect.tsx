import React, { useRef, useEffect, SyntheticEvent, useState } from 'react'
import { showErrorFormModal } from '../../utilities'
import { Modal } from 'antd'
import { useFormSelectType } from '../../hooks/useFormSelect'
import { MultiFormStyled } from '../../styles/styled-components'
import { flushSync } from 'react-dom'

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
function FormSelect({
    connection,
    name,
    defaultValue = '',
    checkFn = (value: string) => {
        console.log({ value })
        return value !== 'select'
    },
    onErrorOk,
    options,
    title,
}: IFormSelectProps<string>) {
    const errRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLSelectElement>(null)

    console.log({ defaultValue })

    const [selectedIdxsString, setSelectedIdxsString] = useState<string>(defaultValue)

    const getValue = () => {
        console.log('getValue selectedIdxsString', selectedIdxsString)
        return selectedIdxsString
    }

    const check = () => {
        const isChecked = selectedIdxsString !== ''
        console.log({ isChecked }, selectedIdxsString)
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

    const clicked = (e: SyntheticEvent<HTMLOptionElement>) => {
        e.preventDefault()
        const target = e.target as EventTarget & { value: any; style: any; blur: Function; selected: boolean }
        console.log(target.value, target)
        const value = target.value
        errRef.current!.innerHTML = ''

        const selectedIdxs = selectedIdxsString !== '' ? selectedIdxsString.split('; ') : []
        const idx = selectedIdxs.findIndex((cur) => cur === value)
        idx >= 0 ? selectedIdxs.splice(idx, 1) : selectedIdxs.push(value)
        if (idx >= 0) {
            target.selected = false
            console.log(target)
        }
        // flushSync(() => {
        const _selectedIdxs = selectedIdxs.join('; ')
        console.log({ _selectedIdxs })
        setSelectedIdxsString(_selectedIdxs)
        // })

        // console.log({ selectedIdxsString })

        // check()
        // connection?.__setValue(getValue())
        // connection?.__setErrTitleElement(getErrTitleElement())
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

    useEffect(() => {
        check()
        console.log('selectedIdxsString useEffect', selectedIdxsString)
        connection?.__setValue(getValue())
        connection?.__setErrTitleElement(getErrTitleElement())
    }, [selectedIdxsString])

    const getValues = () => {
        const idxs = selectedIdxsString.split('; ')
        console.log('getValues', selectedIdxsString)
        const htmls: Array<JSX.Element> = []
        idxs.forEach((idx) => {
            const optionIdx = options.findIndex((option) => option[0] === idx)
            if (optionIdx >= 0) {
                htmls.push(<div key={options[optionIdx][0]}>{options[optionIdx][1]}</div>)
            }
        })
        return <>{htmls.map((html) => html)}</>
    }

    const getIsSelected: (idx: string) => boolean = (idx) => {
        const idxs = selectedIdxsString.split('; ')
        return idxs.includes(idx)
    }

    const onTouschStart = (e: SyntheticEvent<HTMLOptionElement>) => {
        e.preventDefault()
    }

    return (
        <MultiFormStyled>
            <p>{title}</p>
            <div className="formError" ref={errRef}></div>
            <div className="multiple-values">{getValues()}</div>
            <select name={name} ref={selectRef} multiple={true}>
                <>
                    {options.map((option) => (
                        <option
                            value={option[0]}
                            onClick={clicked}
                            className={getIsSelected(option[0]) ? 'multi-selected' : 'not-selected'}
                            key={option[0]}
                            onMouseDown={onTouschStart}
                        >
                            {option[1]}
                        </option>
                    ))}
                </>
            </select>
        </MultiFormStyled>
    )
}

export default FormSelect
