import { db } from '@/db';

export async function syncDailyLog(date: string): Promise<void> {
  const feeds = await db.feedEvents
    .where('datetime')
    .startsWith(date)
    .toArray();

  const diapers = await db.diaperEvents
    .where('datetime')
    .startsWith(date)
    .toArray();

  const allSleeps = await db.sleepEvents.toArray();
  const sleeps = allSleeps.filter(
    (s) => s.start.slice(0, 10) <= date && s.end.slice(0, 10) >= date,
  );

  const milkTimes = feeds.length;
  const milkTotalMl = feeds.reduce((sum, f) => sum + (f.amountMl ?? 0), 0);
  const poopTimes = diapers.filter((d) => d.kind === '便').length;
  const peeTimes = diapers.filter((d) => d.kind === '尿').length;

  const dayStart = new Date(`${date}T00:00:00`).getTime();
  const dayEnd = new Date(`${date}T23:59:59`).getTime();

  const sleepMs = sleeps.reduce((sum, s) => {
    const start = Math.max(new Date(s.start).getTime(), dayStart);
    const end = Math.min(new Date(s.end).getTime(), dayEnd);
    return sum + Math.max(0, end - start);
  }, 0);
  const sleepHours = Math.round((sleepMs / 3_600_000) * 10) / 10;

  const existing = await db.dailyLogs.get(date);

  await db.dailyLogs.put({
    date,
    milkTimes,
    milkTotalMl,
    poopTimes,
    peeTimes,
    sleepHours,
    note: existing?.note ?? '',
    symptomsTags: existing?.symptomsTags ?? [],
  });
}
