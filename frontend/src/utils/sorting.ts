import dayjs from 'dayjs'

export function sortByDateAndTime(a: Match, b: Match): number {
  if (!a.datum) return 1
  if (!b.datum) return -1
  const dateA = dayjs(a.datum)
  const dateB = dayjs(b.datum)
  if (dateA.isBefore(dateB)) return -1
  if (dateA.isAfter(dateB)) return 1
  const timeA = dayjs(a.tijdstip)
  const timeB = dayjs(b.tijdstip || '00:00')
  if (timeA.isBefore(timeB)) return -1
  if (timeA.isAfter(timeB)) return 1
  return 0
}
