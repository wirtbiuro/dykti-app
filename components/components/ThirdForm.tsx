import React from "react";
import { useFormSelectWithOther } from "../hooks/useFormSelectWithOther";
import FormMultiSelect from "./FormMultiSelect";
import FormSelectWithOther from "./FormSelectWithOther";

const ThirdForm = () => {
  const connectionData = useFormSelectWithOther({
    title: "Przyczyna odrzucania oferty",
    options: [
      ["select", "Select"],
      ["price", "Wysoka cena"],
      ["period", "Termin"],
      ["other", "Inne"],
    ],
    initialValue: "ttt",
    otherTitle: "Other",
    otherPlaceholder: "Type here...",
  });

  const check = (showMessage: boolean) => {
    if (!connectionData.check(showMessage)) {
      return false;
    }
    return true;
  };

  const onClick = () => {
    if (!check(true)) {
      return;
    }
    console.log("submit");
  };

  return (
    <div>
      <FormSelectWithOther connection={connectionData} />
      <button onClick={onClick}>Send</button>
    </div>
  );
};

export default ThirdForm;
