// import moment from 'moment-timezone';

// export function toTaipeiTime(time: string | number | Date): string {
//   return moment(new Date(time)).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
// }

// export function toTorontoTime(time: string | number | Date): string {
//   return moment(new Date(time)).tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss');
// }

// export function torontoToUTCTime(time: string | number | Date): string {
//   return moment.tz(time, 'America/Toronto').utc().format('YYYY-MM-DD HH:mm:ss');
// }

// export function formatToSimpleDateTime(input: string | Date): string {
//   return moment(new Date(input)).format('YYYY-MM-DD HH:mm:ss');
// }

export function roundToHour(date: Date) {
  const roundedDate = new Date(date);
  roundedDate.setMinutes(0, 0, 0); // 將分鐘、秒、毫秒設置為 0
  return roundedDate;
}

export function roundTo12Hour(date: Date) {
  const roundedDate = new Date(date);
  const hours = roundedDate.getHours();
  // Round to the nearest 12-hour interval
  if (hours < 12) {
      roundedDate.setHours(0, 0, 0, 0); // Round to 12:00 AM
  } else {
      roundedDate.setHours(12, 0, 0, 0); // Round to 12:00 PM
  }
  return roundedDate;
}

export function roundToDay(date : Date) {
  const roundedDate = new Date(date);
  roundedDate.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00.000)
  return roundedDate;
}

export function getDateByDaysAgo(day: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - day);
  return date;
}

/**
 * @param timestamp UTC timestamp
 * @returns UTC DateTime string in format 'YYYY-MM-DD HH:mm:ss'
 */
// export function timestampToDateTime(timestamp: number): string {
//   return moment.utc(timestamp).format('YYYY-MM-DD HH:mm:ss');
// }

/**
 * @param time local time in a format YYYY-MM-DD-HH-MM
 * @returns UTC Date
 */
export function stringToUTCDate(time: string): Date {
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-(0[0-9]|1[0-9]|2[0-3])-[0-5]\d$/;
  if (!regex.test(time)) {
    throw new Error('invalid time format');
  }

  const [year, month, day, hour, minute] = time.split('-').map(v => Number(v));
  const date = new Date(year, month - 1, day, hour, minute);
  return date;
}

export function floorToNearestMinutes(date: Date, minutes: number): Date {
  const ms = 1000 * 60 * Number(minutes);
  return new Date(Math.floor(Number(date.getTime()) / ms) * ms);
}

export function floorToNearest10Minutes(date: Date): Date {
  const ms = 1000 * 60 * 10; // 每10分鐘的毫秒數
  return new Date(Math.floor(Number(date.getTime()) / ms) * ms);
}

export function floorToNearest5Minutes(date: Date): Date {
  const ms = 1000 * 60 * 5; // 每5分鐘的毫秒數
  return new Date(Math.floor(Number(date.getTime()) / ms) * ms);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
