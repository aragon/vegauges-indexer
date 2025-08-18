export function getDayId(timestamp: number) {
  return Math.floor(timestamp / 86400); // rounded
}

export function getDayStartTimestamp(dayID: number) {
  return dayID * 86400;
}

export function getEpoch(timestamp: number, period: number = 86400 * 7 * 2) {
  return Math.floor(timestamp / period);
}
