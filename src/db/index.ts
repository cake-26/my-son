import Dexie, { type Table } from 'dexie';

export interface Profile {
  id?: number;
  name: string;
  nickname?: string;
  birthDate: string;
  birthTime?: string;
  gender?: 'male' | 'female';
  photo?: string;
}

export interface DailyLog {
  date: string;
  milkTimes: number;
  milkTotalMl: number;
  poopTimes: number;
  peeTimes: number;
  sleepHours: number;
  note: string;
  symptomsTags: string[];
}

export interface FeedEvent {
  id?: number;
  datetime: string;
  type: '母乳' | '奶粉' | '混合';
  amountMl?: number;
  durationMin?: number;
  side: '左' | '右' | '双' | '无';
  spitUp: boolean;
  burpOk: boolean;
  note: string;
}

export interface SleepEvent {
  id?: number;
  start: string;
  end: string;
  place: '床' | '抱' | '推车' | '其他';
  method: '奶睡' | '抱睡' | '自主入睡' | '其他';
  note: string;
}

export interface DiaperEvent {
  id?: number;
  datetime: string;
  kind: '便' | '尿';
  poopTexture?: '稀' | '糊' | '成形' | '硬';
  poopColor?: '黄' | '绿' | '黑' | '红';
  note: string;
}

export interface GrowthRecord {
  id?: number;
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCm?: number;
  note: string;
}

export interface VaccineRecord {
  id?: number;
  date: string;
  name: string;
  reaction: string;
  note: string;
}

export interface Milestone {
  id?: number;
  date: string;
  title: string;
  description: string;
  tags: string[];
}

export interface JournalEntry {
  id?: number;
  datetime: string;
  title: string;
  tags: string[];
  context: string;
  action: string;
  result: string;
  next: string;
  mood?: string;
}

class BabyDB extends Dexie {
  profiles!: Table<Profile, number>;
  dailyLogs!: Table<DailyLog, string>;
  feedEvents!: Table<FeedEvent, number>;
  sleepEvents!: Table<SleepEvent, number>;
  diaperEvents!: Table<DiaperEvent, number>;
  growthRecords!: Table<GrowthRecord, number>;
  vaccineRecords!: Table<VaccineRecord, number>;
  milestones!: Table<Milestone, number>;
  journalEntries!: Table<JournalEntry, number>;

  constructor() {
    super('BabyDB');

    this.version(1).stores({
      profiles: '++id',
      dailyLogs: '&date',
      feedEvents: '++id, datetime',
      sleepEvents: '++id, start, end',
      diaperEvents: '++id, datetime',
      growthRecords: '++id, date',
      vaccineRecords: '++id, date',
      milestones: '++id, date',
      journalEntries: '++id, datetime',
    });
  }
}

export const db = new BabyDB();
