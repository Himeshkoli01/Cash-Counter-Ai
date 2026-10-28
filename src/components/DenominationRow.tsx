import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { DenominationConfig, formatIndianCurrency } from '../utils/currency';
import { sound } from '../utils/sound';

interface DenominationRowProps {
  config: DenominationConfig;
  count: number;
  totalCash: number;
  currencySymbol: string;
  onCountChange: (value: number, newCount: number) => void;
}

export const DenominationRow: React.FC<DenominationRowProps> = ({
  config,
  count,
  totalCash,
  currencySymbol,
  onCountChange,
}) => {
  const lineTotal = config.value * (count || 0);
  const percentage = totalCash > 0 ? Math.min(100, Math.round((lineTotal / totalCash) * 100)) : 0;

  const handleIncrement = (amount: number = 1) => {
    const updated = Math.max(0, (count || 0) + amount);
    sound.playClick(1.0 + (config.value / 1000) * 0.2);
    onCountChange(config.value, updated);
  };

  const handleDecrement = (amount: number = 1) => {
    const updated = Math.max(0, (count || 0) - amount);
    if (updated !== count) {
      sound.playPop();
    }
    onCountChange(config.value, updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value.trim();
    if (valStr === '') {
      onCountChange(config.value, 0);
      return;
    }
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onCountChange(config.value, parsed);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-3.5 transition-all duration-150 hover:shadow-md dark:bg-slate-900 ${
        count > 0
          ? 'border-emerald-300/80 shadow-xs dark:border-emerald-700/60'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      {/* Background share indicator line at the bottom */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-emerald-500/80 transition-all duration-300 dark:bg-emerald-400"
        style={{ width: `${percentage}%` }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Denomination badge & note info */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-20 shrink-0 items-center justify-center rounded-xl border font-bold tracking-tight shadow-2xs transition-transform group-hover:scale-[1.02] sm:h-12 sm:w-22 ${config.badgeBg} ${config.borderColor} ${config.textColor}`}
          >
            <span className="font-mono text-base font-bold sm:text-lg">
              {currencySymbol}
              {config.value}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {config.type === 'coin' ? 'Coin' : 'Banknote'}
              </span>
              {count > 0 && percentage > 0 && (
                <span className="font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {percentage}% of cash
                </span>
              )}
            </div>
            <div className="truncate text-xs text-slate-400 dark:text-slate-500">
              {config.description}
            </div>
          </div>
        </div>

        {/* Center / Controls: Minus, Input, Plus & Quick buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          {/* Stepper controls */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-0.5 dark:border-slate-700 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => handleDecrement(1)}
              disabled={count <= 0}
              aria-label={`Decrease ${config.label} count`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min="0"
              max="999999"
              step="1"
              value={count === 0 ? '' : count}
              placeholder="0"
              onChange={handleInputChange}
              onFocus={(e) => e.target.select()}
              aria-label={`Quantity of ${config.label}`}
              className="h-10 w-16 bg-transparent text-center font-mono text-base font-semibold tabular-nums text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600 sm:w-20"
            />

            <button
              type="button"
              onClick={() => handleIncrement(1)}
              aria-label={`Increase ${config.label} count`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Quick preset increments (+5, +10, +50, +100) */}
          <div className="hidden items-center gap-1 xl:flex">
            {[5, 10, 50, 100].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => handleIncrement(step)}
                className="h-7 rounded-md border border-slate-200 bg-white px-1.5 font-mono text-[11px] font-medium text-slate-600 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
              >
                +{step}
              </button>
            ))}
          </div>

          {/* Line total */}
          <div className="min-w-[110px] text-right sm:min-w-[130px]">
            <div className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white sm:text-lg">
              {formatIndianCurrency(lineTotal, currencySymbol)}
            </div>
            <div className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
              {currencySymbol}
              {config.value} × {count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile quick steps on small screens */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 xl:hidden dark:border-slate-800">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Quick Add
        </span>
        <div className="flex items-center gap-1.5">
          {[5, 10, 50, 100].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => handleIncrement(step)}
              className="h-6 rounded border border-slate-200 bg-slate-50 px-2 font-mono text-[10px] font-medium text-slate-600 active:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:active:bg-emerald-900"
            >
              +{step}
            </button>
          ))}
          {count > 0 && (
            <button
              type="button"
              onClick={() => onCountChange(config.value, 0)}
              className="h-6 rounded border border-red-200 bg-red-50/70 px-2 text-[10px] font-medium text-red-600 active:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              Zero
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
