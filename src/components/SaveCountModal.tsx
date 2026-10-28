import React, { useState } from 'react';
import { X, Save, Tag, FileText } from 'lucide-react';
import { formatIndianCurrency, numberToIndianWords } from '../utils/currency';
import { sound } from '../utils/sound';

interface SaveCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCash: number;
  totalNotes: number;
  currencySymbol: string;
  onSave: (title: string, category: string, notesText: string) => void;
}

export const SaveCountModal: React.FC<SaveCountModalProps> = ({
  isOpen,
  onClose,
  totalCash,
  totalNotes,
  currencySymbol,
  onSave,
}) => {
  const [title, setTitle] = useState('Daily Evening Closing');
  const [category, setCategory] = useState('Shop Cash');
  const [notesText, setNotesText] = useState('');

  if (!isOpen) return null;

  const titlePresets = [
    'Daily Evening Closing',
    'Morning Cash Float',
    'Afternoon Shift Change',
    'Shop Counter #1',
    'Vendor Cash Settlement',
    'Personal Savings Tally',
  ];

  const categoryPresets = ['Shop Cash', 'Register Float', 'Petty Cash', 'Personal'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title, category, notesText);
    sound.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Save Cash Count
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Preview */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
                Amount to Save
              </span>
              <span className="font-mono text-xl font-bold tabular-nums text-emerald-950 dark:text-emerald-100">
                {formatIndianCurrency(totalCash, currencySymbol)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
              <span>{totalNotes} Total Notes</span>
              <span className="truncate max-w-[200px]">{numberToIndianWords(totalCash)}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Record Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Evening Closing"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {/* Title Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {titlePresets.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTitle(t)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-700 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {categoryPresets.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    category === cat
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Remarks / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Checked with billing software, cash deposited into safe."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Footer buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Confirm & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
