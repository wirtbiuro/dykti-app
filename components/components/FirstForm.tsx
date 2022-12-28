import React from "react";
import TextFormInput from "./TextFormInput";
import { useTextFormInput } from "../hooks/useTextFormInput";

const FirstForm = () => {
  const nameData = useTextFormInput({
    initialTextValue: "",
    placeholder: "Enter your name...",
    title: "Name",
  });
  const emailData = useTextFormInput({
    initialTextValue: "",
    placeholder: "Enter your email...",
    title: "E-mail",
  });

  const check = () => {
    if (!nameData.check(false) && !emailData.check(false)) {
      nameData.setErrorValue("You should enter name or e-mail...");
      return false;
    }
    return true;
  };

  const onClick = () => {
    if (!check()) {
      return;
    }
    console.log("submit");
  };

  return (
    <div>
      <TextFormInput connection={nameData} />
      <TextFormInput connection={emailData} />
      <button onClick={onClick}>Send</button>
    </div>
  );
};

export default FirstForm;
