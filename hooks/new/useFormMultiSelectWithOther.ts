import { useState, useRef, useEffect } from "react";
import { useFormSelect } from "./useFormSelect";
import { useTextFormInput } from "./useTextFormInput";
import { useMultiSelect, divider } from "./useMultiSelect";

interface IuseMultiSelectProps {
  initialValue?: string;
  title?: string;
  selectTitle?: string;
  options: string[][];
  disabled?: boolean;
  otherPlaceholder?: string;
  otherTitle?: string;
}

export const useFormMultiSelectWithOther = ({
  initialValue = "",
  title = "",
  selectTitle = "",
  disabled = false,
  options,
  otherPlaceholder = "",
  otherTitle = "",
}: IuseMultiSelectProps) => {
  const [value, setValue] = useState<string>(initialValue);

  const ref = useRef<HTMLSelectElement>(null);

  const optionKeys = options.map((option) => option[0]);

  const initialSelectedIdxs = initialValue.split(`${divider} `);

  const initialSelectedIdxsString = initialSelectedIdxs
    .map((item) => {
      return optionKeys.includes(item) ? item : "other";
    })
    .join(`${divider} `);

  const formMultiSelectData = useMultiSelect({
    options,
    title: selectTitle,
    initialSelectedIdxsString,
  });

  const initialTextValue = initialSelectedIdxs.find(
    (item) => !optionKeys.includes(item)
  );

  const textInputData = useTextFormInput({
    placeholder: otherPlaceholder,
    title: otherTitle,
    initialTextValue,
  });

  const regex = new RegExp("other(" + divider + `\\s|$)`);

  const isOtherInMultiSelect = formMultiSelectData.selectedIdxsString.match(
    // /other(;\s|$)/
    regex
  );

  useEffect(() => {
    if (!isOtherInMultiSelect) {
      console.log("setTextValue to nothing");
      textInputData.setTextValue("");
      textInputData.setErrorValue("");
    }
  }, [formMultiSelectData.selectedIdxsString]);

  useEffect(() => {
    if (isOtherInMultiSelect && textInputData.textValue) {
      console.log(`isOtherInMultiSelect && textInputData.textValue`);
      console.log(
        "formMultiSelectData.selectedIdxsString",
        formMultiSelectData.selectedIdxsString
      );
      setValue(
        formMultiSelectData.selectedIdxsString
          .replace(`other${divider}`, textInputData.textValue + divider)
          .replace(/other$/, textInputData.textValue)
      );
    } else {
      setValue(formMultiSelectData.selectedIdxsString);
    }
  }, [formMultiSelectData.selectedIdxsString, textInputData.textValue]);

  const check: (showMessage?: boolean) => boolean = (showMessage = false) => {
    if (!formMultiSelectData.check(false)) {
      if (showMessage) {
        formMultiSelectData.check(true);
      }
      return false;
    }
    if (isOtherInMultiSelect && !textInputData.check(false)) {
      if (showMessage) {
        textInputData.check(true);
      }
      return false;
    }
    return true;
  };

  console.log({ value });

  return {
    value,
    setValue,
    check,
    title,
    ref,
    disabled,
    options,
    formMultiSelectData,
    textInputData,
  };
};

export type UseFormMultiSelectWithOtherType = typeof useFormMultiSelectWithOther;

export type FormMultiSelectWithOtherProps = ReturnType<
  UseFormMultiSelectWithOtherType
>;
