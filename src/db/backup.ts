import { db } from '@/db';
import { SCHEMA_VERSION } from '@/lib/constants';

interface BackupData {
  schemaVersion: number;
  exportedAt: string;
  profiles: unknown[];
  dailyLogs: unknown[];
  feedEvents: unknown[];
  sleepEvents: unknown[];
  diaperEvents: unknown[];
  growthRecords: unknown[];
  vaccineRecords: unknown[];
  milestones: unknown[];
  journalEntries: unknown[];
}

export async function exportData(): Promise<string> {
  const [
    profiles,
    dailyLogs,
    feedEvents,
    sleepEvents,
    diaperEvents,
    growthRecords,
    vaccineRecords,
    milestones,
    journalEntries,
  ] = await Promise.all([
    db.profiles.toArray(),
    db.dailyLogs.toArray(),
    db.feedEvents.toArray(),
    db.sleepEvents.toArray(),
    db.diaperEvents.toArray(),
    db.growthRecords.toArray(),
    db.vaccineRecords.toArray(),
    db.milestones.toArray(),
    db.journalEntries.toArray(),
  ]);

  const data: BackupData = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profiles,
    dailyLogs,
    feedEvents,
    sleepEvents,
    diaperEvents,
    growthRecords,
    vaccineRecords,
    milestones,
    journalEntries,
  };

  return JSON.stringify(data, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data: BackupData = JSON.parse(json);

  if (!data.schemaVersion) {
    throw new Error('Invalid backup file: missing schemaVersion');
  }

  await db.transaction(
    'rw',
    [db.profiles, db.dailyLogs, db.feedEvents, db.sleepEvents, db.diaperEvents, db.growthRecords, db.vaccineRecords, db.milestones, db.journalEntries],
    async () => {
      await Promise.all([
        db.profiles.clear(),
        db.dailyLogs.clear(),
        db.feedEvents.clear(),
        db.sleepEvents.clear(),
        db.diaperEvents.clear(),
        db.growthRecords.clear(),
        db.vaccineRecords.clear(),
        db.milestones.clear(),
        db.journalEntries.clear(),
      ]);

      await Promise.all([
        data.profiles?.length && db.profiles.bulkAdd(data.profiles as never[]),
        data.dailyLogs?.length && db.dailyLogs.bulkAdd(data.dailyLogs as never[]),
        data.feedEvents?.length && db.feedEvents.bulkAdd(data.feedEvents as never[]),
        data.sleepEvents?.length && db.sleepEvents.bulkAdd(data.sleepEvents as never[]),
        data.diaperEvents?.length && db.diaperEvents.bulkAdd(data.diaperEvents as never[]),
        data.growthRecords?.length && db.growthRecords.bulkAdd(data.growthRecords as never[]),
        data.vaccineRecords?.length && db.vaccineRecords.bulkAdd(data.vaccineRecords as never[]),
        data.milestones?.length && db.milestones.bulkAdd(data.milestones as never[]),
        data.journalEntries?.length && db.journalEntries.bulkAdd(data.journalEntries as never[]),
      ]);
    },
  );
}

export function downloadBackup(): void {
  exportData().then((json) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const filename = `baby-log-${stamp}.json`;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text();
  await importData(text);
}
