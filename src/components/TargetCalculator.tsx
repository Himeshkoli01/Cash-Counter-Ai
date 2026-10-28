import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Coins,
  Check,
} from 'lucide-react';
import {
  ALL_DENOMINATIONS,
  formatIndianCurrency,
} from '../utils/currency';
import { getTargetSolutions, TargetCombination } from '../utils/targetSolver';
import { sound } from '../utils/sound';

interface TargetCalculatorProps {
  activeDenominations: number[];
  currencySymbol: string;
  onApplyCombinationToCounter: (counts: Record<number, number>) => void;
}

export const TargetCalculator: React.FC<TargetCalculatorProps> = ({
  activeDenominations,
  currencySymbol,
  onApplyCombinationToCounter,
}) => {
  const [targetAmountInput, setTargetAmountInput] = useState<string>('5000');
  const [selectedDenoms, setSelectedDenoms] = useState<number[]>(activeDenominations);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const targetAmount = Math.max(0, parseInt(targetAmountInput, 10) || 0);

  // Quick preset targets
  const presets = [500, 1000, 2500, 5000, 10000, 25000, 50000];

  const solutions = useMemo(() => {
    return getTargetSolutions(targetAmount, selectedDenoms);
  }, [targetAmount, selectedDenoms]);

  const toggleDenom = (val: number) => {
    if (selectedDenoms.includes(val)) {
      if (selectedDenoms.length > 1) {
        setSelectedDenoms(selectedDenoms.filter((d) => d !== val));
      }
    } else {
      setSelectedDenoms([...selectedDenoms, val]);
    }
  };

  const handleApply = (sol: TargetCombination) => {
    onApplyCombinationToCounter(sol.counts);
    sound.playSuccess();
    setAppliedId(sol.id);
    setTimeout(() => setAppliedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              Target Amount Note Combinations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate exact note breakdowns to assemble any payout, salary envelope, or bank withdrawal.
            </p>
          </div>
        </div>

        {/* Target Amount Input */}
        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enter Desired Cash Amount ({currencySymbol})
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xl font-bold text-slate-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                min="0"
                step="10"
                value={targetAmountInput}
                onChange={(e) => setTargetAmountInput(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 font-mono text-2xl font-bold text-slate-900 shadow-2xs outline-none transition-colors focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Presets:</span>
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setTargetAmountInput(val.toString())}
                className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-medium transition-colors active:scale-95 ${
                  targetAmount === val
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {formatIndianCurrency(val, currencySymbol)}
              </button>
            ))}
          </div>
        </div>

        {/* Available Denominations Filter */}
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available Banknotes In Hand
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Toggle to filter denominations
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {ALL_DENOMINATIONS.filter((d) => activeDenominations.includes(d.value)).map((d) => {
              const isSelected = selectedDenoms.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDenom(d.value)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-semibold transition-all active:scale-95 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 text-slate-400 line-through dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                  }`}
                >
                  <span>{d.label}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      {targetAmount <= 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Coins className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Please enter a target amount above zero to view possible note breakdowns.
          </p>
        </div>
      ) : solutions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No combination possible with selected denominations. Try enabling more denominations.
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Suggested Denomination Strategies ({solutions.length})
          </h3>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {solutions.map((sol) => {
              const entries = Object.entries(sol.counts)
                .map(([val, qty]) => ({
                  val: Number(val),
                  qty,
                  subtotal: Number(val) * qty,
                }))
                .filter((e) => e.qty > 0)
                .sort((a, b) => b.val - a.val);

              const isSuccessApplied = appliedId === sol.id;

              return (
                <div
                  key={sol.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sol.strategyName}
                      </h4>
                      {sol.isExact ? (
                        <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Exact Fit
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          Remainder {currencySymbol}{sol.remainder}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {sol.description}
                    </p>

                    {/* Breakdown List */}
                    <div className="mt-4 space-y-2 border-t border-b border-slate-100 py-3 dark:border-slate-800">
                      {entries.map((e) => (
                        <div
                          key={e.val}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {currencySymbol}
                            {e.val} × {e.qty} {e.qty === 1 ? 'note' : 'notes'}
                          </span>
                          <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                            {formatIndianCurrency(e.subtotal, currencySymbol)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        Total Physical Notes:
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {sol.totalNotes} notes
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        Total Value:
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatIndianCurrency(sol.totalAmount, currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Load into counter button */}
                  <div className="mt-5 pt-2">
                    <button
                      type="button"
                      onClick={() => handleApply(sol)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                        isSuccessApplied
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
                      }`}
                    >
                      {isSuccessApplied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Loaded into Counter!</span>
                        </>
                      ) : (
                        <>
                          <span>Load into Counter</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
