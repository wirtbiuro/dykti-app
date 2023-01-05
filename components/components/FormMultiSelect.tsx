import React, { SyntheticEvent, FC } from 'react'
import { MultiSelectProps, divider } from '../../hooks/new/useMultiSelect'
// import { MultiFormStyled } from '../../styles/styled-components'

const FormMultiSelect: FC<{ connection: MultiSelectProps; disabled?: boolean }> = ({
    connection,
    disabled = false,
}) => {
    const { selectedIdxsString, setSelectedIdxsString, errorValue, setErrorValue, title, ref, options } = connection

    console.log({ selectedIdxsString })

    const clicked = (e: SyntheticEvent<HTMLOptionElement>) => {
        e.preventDefault()
        const target = e.target as EventTarget & {
            value: any
            style: any
            blur: Function
            selected: boolean
        }
        const value = target.value
        setErrorValue('')

        const selectedIdxs = selectedIdxsString !== '' ? selectedIdxsString.split(`${divider} `) : []
        const idx = selectedIdxs.findIndex((cur) => cur === value)
        idx >= 0 ? selectedIdxs.splice(idx, 1) : selectedIdxs.push(value)
        if (idx >= 0) {
            target.selected = false
            console.log(target)
        }
        const _selectedIdxs = selectedIdxs.join(`${divider} `)
        console.log({ _selectedIdxs })
        setSelectedIdxsString(_selectedIdxs)
    }

    const getValues = () => {
        const idxs = selectedIdxsString.split(`${divider} `)
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
        const idxs = selectedIdxsString.split(`${divider} `)
        return idxs.includes(idx)
    }

    const onTouschStart = (e: SyntheticEvent<HTMLOptionElement>) => {
        e.preventDefault()
    }

    return (
        // <MultiFormStyled>
        <div>
            <p>{title}</p>
            <div className="formError">{errorValue}</div>
            <div className="multiple-values">{getValues()}</div>
            <select ref={ref} multiple={true}>
                <>
                    {options.map((option) => (
                        <option
                            value={option[0]}
                            onClick={clicked}
                            className={getIsSelected(option[0]) ? 'multi-selected' : 'not-selected'}
                            key={option[0]}
                            onMouseDown={onTouschStart}
                            disabled={disabled}
                        >
                            {option[1]}
                        </option>
                    ))}
                </>
            </select>
        </div>
        // </MultiFormStyled>
    )
}

export default FormMultiSelect
