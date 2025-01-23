import { concatenateZeroIfLessThanTen } from "./concatenateZeroIfLessThanTen";

export const renderTime = (time: number | Date) => {
  if (!time) {
    return;
  }
  const localTime = new Date(time);
  const year = concatenateZeroIfLessThanTen(localTime.getFullYear());
  const month = concatenateZeroIfLessThanTen(localTime.getMonth());
  const day = concatenateZeroIfLessThanTen(localTime.getDate());
  const hours = concatenateZeroIfLessThanTen(localTime.getHours());
  const minutes = concatenateZeroIfLessThanTen(localTime.getMinutes());
  const seconds = concatenateZeroIfLessThanTen(localTime.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
