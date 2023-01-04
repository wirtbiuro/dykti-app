import React, { FC } from "react";
import TextFormInput from "./TextFormInput";
import { FormMultiSelectWithOtherProps } from '../../hooks/new/useFormMultiSelectWithOther'
import FormMultiSelect from "./FormMultiSelect";
import { divider } from "../../hooks/new/useMultiSelect";

const FormMultiSelectWithOther: FC<{
  connection: FormMultiSelectWithOtherProps, disabled?: boolean
}> = ({ connection, disabled = false }) => {
  const {
    value,
    setValue,
    check,
    title,
    ref,
    options,
    formMultiSelectData,
    textInputData,
  } = connection;

  const regex = new RegExp("other(" + divider + `\\s|$)`);

  const isOtherInMultiSelect = formMultiSelectData.selectedIdxsString.match(
    regex
  );

  // const isOtherInMultiSelect = formMultiSelectData.selectedIdxsString.match(
  //   /other(;\s|$)/
  // );

  return (
    <div>
      <FormMultiSelect connection={formMultiSelectData} disabled={disabled}/>
      {isOtherInMultiSelect && <TextFormInput connection={textInputData} disabled={disabled}/>}
    </div>
  );
};

export default FormMultiSelectWithOther;
