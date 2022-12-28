import React from "react";
import { useStore } from "./useStore";

const Second = () => {
  const { addTwo } = useStore();

  const AddTwo = () => {
    console.log("add 2");
    addTwo();
  };

  return (
    <div>
      <button onClick={AddTwo}>Add 2</button>
    </div>
  );
};

export default Second;
