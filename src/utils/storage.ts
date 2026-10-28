/**
 * LocalStorage Data Management and Persistence
 */

export interface CashRecord {
  id: string;
  title: string;
  category: string;
  notesText: string;
  timestamp: string; // ISO string
  counts: Record<number, number>; // denomination value -> quantity
  totalCash: number;
  totalNotes: number;
}

export interface AppSettings {
  businessName: string;
  currencySymbol: string;
  soundEnabled: boolean;
  activeDenominations: number[];
  theme: 'light' | 'dark';
}

const STORAGE_KEY_RECORDS = 'cashcount_ai_records_v1';
const STORAGE_KEY_SETTINGS = 'cashcount_ai_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'My Cash Register',
  currencySymbol: '₹',
  soundEnabled: true,
  activeDenominations: [500, 200, 100, 50, 20, 10],
  theme: 'light',
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getSavedRecords(): CashRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    return [];
  } catch (e) {
    console.error('Failed to parse records from localStorage', e);
    return [];
  }
}

export function saveRecord(
  title: string,
  category: string,
  notesText: string,
  counts: Record<number, number>,
  totalCash: number,
  totalNotes: number
): CashRecord {
  const newRecord: CashRecord = {
    id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: title.trim() || 'Cash Count',
    category: category.trim() || 'General',
    notesText: notesText.trim(),
    timestamp: new Date().toISOString(),
    counts: { ...counts },
    totalCash,
    totalNotes,
  };

  const records = getSavedRecords();
  records.unshift(newRecord);

  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to persist record', e);
  }

  return newRecord;
}

export function updateRecord(
  id: string,
  updates: Partial<Pick<CashRecord, 'title' | 'category' | 'notesText'>>
): boolean {
  const records = getSavedRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return false;

  records[index] = {
    ...records[index],
    ...updates,
  };

  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    return true;
  } catch (e) {
    console.error('Failed to update record', e);
    return false;
  }
}

export function deleteRecord(id: string): boolean {
  const records = getSavedRecords();
  const filtered = records.filter((r) => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete record', e);
    return false;
  }
}

export function clearAllRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_RECORDS);
  } catch (e) {
    console.error('Failed to clear records', e);
  }
}

/**
 * Export records to standard CSV with complete denomination columns
 */
export function exportRecordsToCSV(records: CashRecord[], currencySymbol: string = '₹'): void {
  if (records.length === 0) return;

  const standardDenoms = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  const denomHeaders = standardDenoms.map((d) => `${currencySymbol}${d} Notes`);

  const headers = [
    'Record ID',
    'Title',
    'Category',
    'Date & Time',
    'Total Amount',
    'Total Notes',
    ...denomHeaders,
    'Remarks',
  ];

  const rows = records.map((rec) => {
    const formattedDate = new Date(rec.timestamp).toLocaleString('en-IN');
    const denomCounts = standardDenoms.map((d) => rec.counts[d] || 0);

    return [
      `"${rec.id}"`,
      `"${rec.title.replace(/"/g, '""')}"`,
      `"${rec.category.replace(/"/g, '""')}"`,
      `"${formattedDate}"`,
      rec.totalCash,
      rec.totalNotes,
      ...denomCounts,
      `"${(rec.notesText || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CashCount_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate realistic Indian business demo records for shops/daily closing
 */
export function generateSampleRecords(): CashRecord[] {
  const now = Date.now();
  const samples: CashRecord[] = [
    {
      id: 'rec_sample_1',
      title: 'Daily Evening Cash Closing',
      category: 'Shop Cash',
      notesText: 'Counter #1 sales register closure. Reconciled with billing software.',
      timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
      counts: { 500: 42, 200: 25, 100: 60, 50: 30, 20: 45, 10: 70 },
      totalCash: 35100,
      totalNotes: 272,
    },
    {
      id: 'rec_sample_2',
      title: 'Morning Cash Float / Change',
      category: 'Register Float',
      notesText: 'Change drawer starting balance issued to cashier.',
      timestamp: new Date(now - 14 * 3600 * 1000).toISOString(),
      counts: { 500: 8, 200: 10, 100: 25, 50: 20, 20: 30, 10: 40 },
      totalCash: 10500,
      totalNotes: 133,
    },
    {
      id: 'rec_sample_3',
      title: 'Vendor Petty Cash Settlement',
      category: 'Petty Cash',
      notesText: 'Packaging materials and local delivery courier dispatch.',
      timestamp: new Date(now - 48 * 3600 * 1000).toISOString(),
      counts: { 500: 12, 200: 8, 100: 15, 50: 10 },
      totalCash: 9600,
      totalNotes: 45,
    },
    {
      id: 'rec_sample_4',
      title: 'Weekend Festive Collection',
      category: 'Store Income',
      notesText: 'Diwali rush weekend retail walk-in customer turnover.',
      timestamp: new Date(now - 96 * 3600 * 1000).toISOString(),
      counts: { 500: 110, 200: 65, 100: 95, 50: 40, 20: 80, 10: 100 },
      totalCash: 82100,
      totalNotes: 490,
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(samples));
  } catch (e) {
    console.error('Failed to populate sample records', e);
  }

  return samples;
}
