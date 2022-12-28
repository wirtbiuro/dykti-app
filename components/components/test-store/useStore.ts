import { useEffect, useState } from "react";

let store = {
  sum: 0,
  addedNumber: 0,
  operation: "",
};

export const useStore = () => {
  const [state, setState] = useState(store);

  console.log({ state });

  useEffect(() => {
    console.log("store changed");
    setState({ ...store });
  }, [store]);

  const addOne = () => {
    // setState({
    //   sum: state.sum + 1,
    //   operation: "Add 1",
    //   addedNumber: 1,
    // });
    console.log("useStore add 1");
    store.sum = store.sum + 1;
    store.operation = "Add 1";
    store.addedNumber = 1;
    store = { ...store };
    console.log({ store });
  };
  const addTwo = () => {
    // setState({
    //   sum: state.sum + 2,
    //   operation: "Add 2",
    //   addedNumber: 2,
    // });
    console.log("useStore add 2");
    store.sum = store.sum + 2;
    store.operation = "Add 2";
    store.addedNumber = 2;
    store = { ...store };
    console.log({ store });
  };

  return { state, addOne, addTwo };
};
