import React, { useEffect, FC } from "react";
import FormSelect from "./FormSelect";
import { useFormSelect } from "../hooks/useFormSelect";
import { useTextFormInput } from "../hooks/useTextFormInput";
import TextFormInput from "./TextFormInput";
import { FormMultiSelectWithOtherProps } from "../hooks/useFormMultiSelectWithOther";
import FormMultiSelect from "./FormMultiSelect";
import { divider } from "../hooks/useMultiSelect";

const FormMultiSelectWithOther: FC<{
  connection: FormMultiSelectWithOtherProps;
}> = ({ connection }) => {
  const {
    value,
    setValue,
    check,
    title,
    ref,
    disabled,
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
      <FormMultiSelect connection={formMultiSelectData} />
      {isOtherInMultiSelect && <TextFormInput connection={textInputData} />}
    </div>
  );
};

export default FormMultiSelectWithOther;
