import { useState, useRef } from "react";

export const divider = "<;;;>";

interface IuseMultiSelectProps {
  initialSelectedIdxsString?: string;
  title?: string;
  options: string[][];
  disabled?: boolean;
}

export const useMultiSelect = ({
  initialSelectedIdxsString = "",
  title = "",
  options,
  disabled = false,
}: IuseMultiSelectProps) => {
  const ref = useRef<HTMLSelectElement>(null);

  const [selectedIdxsString, setSelectedIdxsString] = useState<string>(
    initialSelectedIdxsString
  );

  const [errorValue, setErrorValue] = useState<string>("");

  const check: (showMessage: boolean) => boolean = (showMessage) => {
    if (selectedIdxsString !== "") {
      setErrorValue("");
      return true;
    } else if (showMessage) {
      setErrorValue("Required Field");
      ref.current?.focus();
    }
    return false;
  };

  return {
    selectedIdxsString,
    setSelectedIdxsString,
    errorValue,
    setErrorValue,
    check,
    title,
    ref,
    options,
    disabled,
  };
};

export type UseMultiSelectType = typeof useMultiSelect;

export type MultiSelectProps = ReturnType<UseMultiSelectType>;
