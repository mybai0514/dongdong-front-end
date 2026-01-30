/**
 * 改进的时间处理工具库 - 完全独立于系统时区
 * 所有时间统一使用 UTC+8（北京时间）
 */

/**
 * 获取 UTC+8 的当前时间（Date 对象）
 * 不依赖于系统时区
 */
export function getNowUTC8(): Date {
  const nowUTC = Date.now() // UTC 时间戳（毫秒）
  return new Date(nowUTC + 8 * 60 * 60 * 1000) // 加 8 小时
}

/**
 * 将 UTC 时间戳转换为 UTC+8 的 Date 对象
 * 用于显示和比较
 */
export function toUTC8Date(utcTimestamp: number | Date | string): Date {
  const timestamp = typeof utcTimestamp === 'number'
    ? utcTimestamp
    : new Date(utcTimestamp).getTime()

  // 直接加 8 小时的偏移，不考虑系统时区
  return new Date(timestamp + 8 * 60 * 60 * 1000)
}

/**
 * 从 UTC+8 的 Date 对象中提取日期部分（年月日）
 * 使用 getUTC* 方法确保不受系统时区影响
 */
export function getDateComponentsUTC8(date: Date | string | number): {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds: number
} {
  const utc8Date = toUTC8Date(date)
  return {
    year: utc8Date.getUTCFullYear(),
    month: utc8Date.getUTCMonth() + 1,
    day: utc8Date.getUTCDate(),
    hours: utc8Date.getUTCHours(),
    minutes: utc8Date.getUTCMinutes(),
    seconds: utc8Date.getUTCSeconds()
  }
}

/**
 * 将时间转换为 UTC+8 的日期字符串 (YYYY-MM-DD)
 */
export function formatDateUTC8(date: Date | string | number): string {
  const comp = getDateComponentsUTC8(date)
  return `${comp.year}-${String(comp.month).padStart(2, '0')}-${String(comp.day).padStart(2, '0')}`
}

/**
 * 将时间转换为 UTC+8 的时间字符串 (HH:mm:ss)
 */
export function formatTimeUTC8(date: Date | string | number): string {
  const comp = getDateComponentsUTC8(date)
  return `${String(comp.hours).padStart(2, '0')}:${String(comp.minutes).padStart(2, '0')}:${String(comp.seconds).padStart(2, '0')}`
}

/**
 * 将时间转换为 UTC+8 的完整日期时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTimeUTC8(date: Date | string | number): string {
  return `${formatDateUTC8(date)} ${formatTimeUTC8(date)}`
}

/**
 * 判断两个时间是否为同一天（UTC+8 时区）
 */
export function isSameDayUTC8(
  date1: Date | string | number,
  date2: string // YYYY-MM-DD 格式的日期字符串
): boolean {
  const comp1 = getDateComponentsUTC8(date1)

  // 直接解析 YYYY-MM-DD 字符串，不经过 Date 对象
  const [year, month, day] = date2.split('-').map(Number)

  return comp1.year === year && comp1.month === month && comp1.day === day
}

/**
 * 比较两个时间
 * 返回值: < 0 表示 date1 早于 date2，= 0 表示相等，> 0 表示 date1 晚于 date2
 */
export function compareTimesUTC8(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  const utc8_1 = toUTC8Date(date1).getTime()
  const utc8_2 = toUTC8Date(date2).getTime()
  return utc8_1 - utc8_2
}

/**
 * 检查时间是否已过期（与 UTC+8 当前时间比较）
 */
export function isExpiredUTC8(date: Date | string | number): boolean {
  return compareTimesUTC8(date, getNowUTC8()) < 0
}

/**
 * 检查时间是否还未开始（与 UTC+8 当前时间比较）
 */
export function isNotStartedYetUTC8(date: Date | string | number): boolean {
  return compareTimesUTC8(date, getNowUTC8()) > 0
}
