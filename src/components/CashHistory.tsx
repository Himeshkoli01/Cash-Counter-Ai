import React, { useState } from 'react';
import {
  Search,
  Download,
  Calendar,
  Trash2,
  Edit2,
  FileText,
  RotateCw,
  FolderOpen,
  Info,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  CashRecord,
  deleteRecord,
  updateRecord,
  exportRecordsToCSV,
} from '../utils/storage';
import { formatIndianCurrency } from '../utils/currency';
import { sound } from '../utils/sound';

interface CashHistoryProps {
  records: CashRecord[];
  currencySymbol: string;
  onRefreshRecords: () => void;
  onLoadRecordToCounter: (counts: Record<number, number>) => void;
  onViewRecordReceipt: (record: CashRecord) => void;
}

export const CashHistory: React.FC<CashHistoryProps> = ({
  records,
  currencySymbol,
  onRefreshRecords,
  onLoadRecordToCounter,
  onViewRecordReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<CashRecord | null>(null);

  // Filter records based on search and date filter
  const filteredRecords = records.filter((rec) => {
    // Search query matching
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      rec.title.toLowerCase().includes(q) ||
      rec.category.toLowerCase().includes(q) ||
      (rec.notesText && rec.notesText.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Date filtering
    if (dateFilter === 'all') return true;

    const recDate = new Date(rec.timestamp);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'today') {
      return recDate >= startOfToday;
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return recDate >= oneWeekAgo;
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return recDate >= oneMonthAgo;
    }

    return true;
  });

  const handleStartEdit = (rec: CashRecord) => {
    setEditingId(rec.id);
    setEditTitle(rec.title);
    setEditCategory(rec.category);
  };

  const handleSaveEdit = (id: string) => {
    updateRecord(id, {
      title: editTitle.trim() || 'Untitled Cash Count',
      category: editCategory.trim() || 'General',
    });
    setEditingId(null);
    onRefreshRecords();
  };

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    deleteRecord(recordToDelete.id);
    sound.playPop();
    setRecordToDelete(null);
    onRefreshRecords();
  };

  const handleExport = () => {
    exportRecordsToCSV(filteredRecords, currencySymbol);
  };

  return (
    <div className="space-y-5">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by title, remarks, or category..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Date Filter Tabs */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            {(['all', 'today', 'week', 'month'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDateFilter(key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                  dateFilter === key
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {key === 'all' ? 'All' : key}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={filteredRecords.length === 0}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* LocalStorage Transparency Notice */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="leading-relaxed">
          <strong>Local Persistence:</strong> Cash records are stored safely in this browser&apos;s
          localStorage. They remain available when you refresh, reopen, or work offline. They are not
          transmitted or automatically synchronized to other browsers.
        </p>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <FolderOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
            No Cash Records Found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {records.length === 0
              ? 'Count cash in the counter and click Save to store your daily closing or register balances.'
              : 'No saved records match your current search or date filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((rec) => {
            const isEditing = editingId === rec.id;
            const dateStr = new Date(rec.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = new Date(rec.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            // Summary of notes
            const activeNotesList = Object.entries(rec.counts)
              .map(([val, qty]) => ({ val: Number(val), qty }))
              .filter((x) => x.qty > 0)
              .sort((a, b) => b.val - a.val);

            return (
              <div
                key={rec.id}
                className="group rounded-3xl border border-slate-200 bg-white p-4.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          placeholder="Category"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(rec.id)}
                          className="rounded-lg bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg bg-slate-200 p-1 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {rec.title}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-400">
                            · {rec.category}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>{dateStr}</span>
                          <span>·</span>
                          <span>{timeStr}</span>
                          <span>·</span>
                          <span>{rec.totalNotes} notes</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Amount & Action buttons */}
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white sm:text-xl">
                        {formatIndianCurrency(rec.totalCash, currencySymbol)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Load to counter */}
                      <button
                        type="button"
                        onClick={() => {
                          onLoadRecordToCounter(rec.counts);
                          sound.playSuccess();
                        }}
                        title="Load into Counter"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>

                      {/* View Receipt */}
                      <button
                        type="button"
                        onClick={() => onViewRecordReceipt(rec)}
                        title="View & Print Receipt"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(rec)}
                        title="Rename"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setRecordToDelete(rec)}
                        title="Delete Record"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95 dark:border-slate-800 dark:text-slate-400 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes breakdown pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span className="font-medium text-slate-400">Denominations:</span>
                  {activeNotesList.map((item, idx) => (
                    <span key={item.val} className="font-mono">
                      {currencySymbol}{item.val}×{item.qty}
                      {idx < activeNotesList.length - 1 && <span className="mx-1 text-slate-300">·</span>}
                    </span>
                  ))}
                  {rec.notesText && (
                    <div className="w-full text-slate-400 italic">
                      &quot;{rec.notesText}&quot;
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Cash Record?
              </h3>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete &quot;<strong>{recordToDelete.title}</strong>&quot; ({formatIndianCurrency(recordToDelete.totalCash, currencySymbol)})? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
