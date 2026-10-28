import React, { useState } from 'react';
import {
  RotateCcw,
  Save,
  FileText,
  Volume2,
  VolumeX,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { DenominationRow } from './DenominationRow';
import {
  ALL_DENOMINATIONS,
  DenominationConfig,
  formatIndianCurrency,
  numberToIndianWords,
} from '../utils/currency';
import { sound } from '../utils/sound';

interface CashCounterProps {
  counts: Record<number, number>;
  activeDenominations: number[];
  currencySymbol: string;
  soundEnabled: boolean;
  onCountChange: (value: number, count: number) => void;
  onClearAll: () => void;
  onOpenSaveModal: () => void;
  onOpenReceiptModal: () => void;
  onToggleSound: () => void;
}

export const CashCounter: React.FC<CashCounterProps> = ({
  counts,
  activeDenominations,
  currencySymbol,
  soundEnabled,
  onCountChange,
  onClearAll,
  onOpenSaveModal,
  onOpenReceiptModal,
  onToggleSound,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showBundleMenu, setShowBundleMenu] = useState(false);

  // Filter denominations according to active settings
  const visibleDenominations = ALL_DENOMINATIONS.filter((d) =>
    activeDenominations.includes(d.value)
  );

  // Calculate totals deterministically
  let totalCash = 0;
  let totalNotes = 0;
  visibleDenominations.forEach((d) => {
    const qty = counts[d.value] || 0;
    totalNotes += qty;
    totalCash += d.value * qty;
  });

  const amountInWords = numberToIndianWords(totalCash);

  // Handle adding full bundle (100 notes)
  const handleAddBundle = (denomValue: number) => {
    const current = counts[denomValue] || 0;
    onCountChange(denomValue, current + 100);
    sound.playSuccess();
    setShowBundleMenu(false);
  };

  const handleConfirmClear = () => {
    onClearAll();
    sound.playPop();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Sticky Metric Display / Executive Cash Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
        {/* Total Cash Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-lg shadow-emerald-900/10 dark:border-emerald-600/40 dark:from-emerald-900 dark:via-emerald-950 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-100/90">
              Grand Total Cash
            </span>
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-100 hover:bg-white/20 active:scale-95"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="font-mono text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
              {formatIndianCurrency(totalCash, currencySymbol)}
            </h2>
          </div>

          <div className="mt-2 line-clamp-2 text-xs font-medium text-emerald-100/80">
            {amountInWords}
          </div>
        </div>

        {/* Total Notes Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Total Banknotes & Coins
            </span>
            <div className="text-xs font-mono text-slate-400">
              {visibleDenominations.length} Denominations
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white sm:text-4xl">
                {totalNotes.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {totalNotes === 1 ? '1 physical note counted' : `${totalNotes} physical notes counted`}
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={totalNotes === 0}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={onOpenSaveModal}
                disabled={totalNotes === 0}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-xs transition-transform hover:bg-slate-800 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={onOpenReceiptModal}
                disabled={totalNotes === 0}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Bank Bundle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Quick Bundle (+100 notes packet):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {visibleDenominations
            .filter((d) => d.value >= 50)
            .map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => handleAddBundle(d.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
              >
                +{currencySymbol}
                {d.value} Packet
              </button>
            ))}
        </div>
      </div>

      {/* Denominations List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>Denomination</span>
          <span className="hidden sm:inline">Note Count & Line Total</span>
        </div>

        {visibleDenominations.map((denom) => (
          <DenominationRow
            key={denom.value}
            config={denom}
            count={counts[denom.value] || 0}
            totalCash={totalCash}
            currencySymbol={currencySymbol}
            onCountChange={onCountChange}
          />
        ))}
      </div>

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clear All Cash Counts?
              </h3>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              This will reset all note quantities to zero. Any unsaved count will be discarded. Are you
              sure you want to proceed?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 active:scale-95"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
