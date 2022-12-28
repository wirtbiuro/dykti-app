import React from "react";
import { useFormMultiSelectWithOther } from "../hooks/useFormMultiSelectWithOther";
import FormMultiSelectWithOther from "./FormMultiSelectWithOther";

const FourthForm = () => {
  const connectionData = useFormMultiSelectWithOther({
    title: "Przyczyna zadowolenia klienta",
    options: [
      ["price", "Wysoka cena"],
      ["period", "Termin"],
      ["quality", "Quality"],
      ["other", "Inne"],
    ],
    initialValue: "price<;;;> quality<;;;> hhh",
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
      <FormMultiSelectWithOther connection={connectionData} />
      <button onClick={onClick}>Send</button>
    </div>
  );
};

export default FourthForm;
