import React, { FC } from "react";
import { DateTime } from "luxon";
import styles from "./Calendar.module.css";

interface IRows {
  date: DateTime | null;
  zone: string;
  setDay: (selectedDate: DateTime) => void;
}

const Rows: FC<IRows> = ({ date, zone, setDay }) => {
  const getDays = () => {
    const selectedDate = date || DateTime.now().setZone(zone);
    const currentMonth = selectedDate.month;
    const currentYear = selectedDate.year;

    const firstCurMonthDate = DateTime.fromObject({
      year: currentYear,
      month: currentMonth,
      day: 1,
      hour: selectedDate.hour,
      minute: selectedDate.minute,
    });

    const currentDay = firstCurMonthDate.weekday;

    let dayArr = [];
    const firstIdx = currentDay - 1;
    dayArr[firstIdx] = firstCurMonthDate;

    for (let index = firstIdx - 1; index >= 0; index--) {
      dayArr[index] = firstCurMonthDate.minus({ days: firstIdx - index });
    }

    let cur = firstCurMonthDate;
    let idx = firstIdx + 1;
    while (true) {
      cur = cur.plus({ days: 1 });
      dayArr[idx] = cur;
      idx += 1;
      if (cur.month !== firstCurMonthDate.month && cur.weekday === 7) {
        break;
      }
    }

    return dayArr;
  };

  function getRows(dayArr: DateTime[]) {
    const firstDate = DateTime.now();
    const quantity = dayArr.length / 7;
    let rows = [];
    for (let i = 0; i < quantity; i++) {
      rows[i] = (
        <div className={styles.row} key={i}>
          {dayArr.slice(i * 7, i * 7 + 7).map((day, idx) => {
            const currentDate = date || DateTime.now();
            const currentMillis: number = DateTime.now()
              .startOf("day")
              .toMillis();

            const dayClassName =
              day.day === currentDate.day &&
              day.month === currentDate.month &&
              day.year === currentDate.year &&
              date
                ? "current"
                : day.day === firstDate.day &&
                  day.month === firstDate.month &&
                  day.year === firstDate.year
                ? "first"
                : day.toMillis() < currentMillis
                ? "prev"
                : day.month !== currentDate.month
                ? "other"
                : "day";
            return (
              <div
                className={styles.dayWrapper}
                key={`${i}${idx}`}
                onClick={() => {
                  setDay(day);
                }}
              >
                <div className={styles[dayClassName]}>{day.day}</div>
              </div>
            );
          })}
        </div>
      );
    }

    return rows;
  }

  return <div>{getRows(getDays())}</div>;
};

export default Rows;
