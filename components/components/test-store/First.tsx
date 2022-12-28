import React from "react";
import { useStore } from "./useStore";

const First = () => {
  const { addOne } = useStore();

  const AddOne = () => {
    console.log("add 1");
    addOne();
  };

  return (
    <div>
      <button onClick={AddOne}>Add 1</button>
    </div>
  );
};

export default First;
