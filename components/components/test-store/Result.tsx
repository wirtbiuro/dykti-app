import React from "react";
import { useStore } from "./useStore";

const Result = () => {
  const { state: data } = useStore();

  return (
    <div>
      Result:
      <div>Sum is: {data.sum}</div>
      <div>Current operation: {data.operation}</div>
      <div>Current number: {data.addedNumber}</div>
    </div>
  );
};

export default Result;
