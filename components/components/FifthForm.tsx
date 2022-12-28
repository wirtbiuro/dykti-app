import React from "react";
import Calendar from "./calendar";
import { useCalendarData } from "../hooks/useCalendarData";
import { DateTime } from "luxon";

const FifthForm = () => {
  const calendarData = useCalendarData({
    withTime: true,
    selectedDate: DateTime.fromISO("2022-12-25T09:15:34.123"),
  });

  const check = (showMessage: boolean) => {
    if (!calendarData.check(showMessage)) {
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
      <Calendar connection={calendarData} />
      <button onClick={onClick}>Send</button>
    </div>
  );
};

export default FifthForm;
