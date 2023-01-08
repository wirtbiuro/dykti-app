import React, { SyntheticEvent, FC } from 'react'
import { MultiSelectProps, divider } from '../../hooks/new/useMultiSelect'
import { MultiFormStyled } from '../../styles/styled-components'

const FormMultiSelect: FC<{ connection: MultiSelectProps; disabled?: boolean }> = ({
    connection,
    disabled = false,
}) => {
    const { selectedIdxs, setSelectedIdxs, errorValue, setErrorValue, title, ref, options } = connection

    console.log({ selectedIdxs })

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

        const _selectedIdxs = [...selectedIdxs]

        const idx = _selectedIdxs.findIndex((cur) => cur === value)
        idx >= 0 ? _selectedIdxs.splice(idx, 1) : _selectedIdxs.push(value)

        if (idx >= 0) {
            target.selected = false
            console.log(target)
        }
        console.log({ _selectedIdxs })
        setSelectedIdxs(_selectedIdxs)
    }

    const getValues = () => {
        const htmls: Array<JSX.Element> = []
        selectedIdxs.forEach((idx) => {
            const optionIdx = options.findIndex((option) => option[0] === idx)
            if (optionIdx >= 0) {
                htmls.push(<div key={options[optionIdx][0]}>{options[optionIdx][1]}</div>)
            }
        })
        return <>{htmls.map((html) => html)}</>
    }

    const getIsSelected: (idx: string) => boolean = (idx) => {
        return selectedIdxs.includes(idx)
    }

    const onTouschStart = (e: SyntheticEvent<HTMLOptionElement>) => {
        e.preventDefault()
    }

    return (
        <MultiFormStyled>
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
        </MultiFormStyled>
    )
}

export default FormMultiSelect
