import React, { useEffect, FC } from 'react'
import FormSelect from './FormSelect'
import { useFormSelect } from '../../hooks/new/useFormSelect'
import { useTextFormInput } from '../../hooks/new/useTextFormInput'
import TextFormInput from './TextFormInput'
import { FormSelectWithOtherProps } from '../../hooks/new/useFormSelectWithOther'

const FormSelectWithOther: FC<{ connection: FormSelectWithOtherProps; disabled?: boolean }> = ({
    connection,
    disabled = false,
}) => {
    const { value, setValue, check, title, ref, options, formSelectData, textInputData } = connection

    return (
        <div>
            <FormSelect connection={formSelectData} />
            {formSelectData.value === 'other' && <TextFormInput connection={textInputData} />}
        </div>
    )
}

export default FormSelectWithOther
