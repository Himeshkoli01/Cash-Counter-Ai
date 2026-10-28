import React, { useState } from 'react';
import {
  TrendingUp,
  Coins,
  Layers,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import {
  ALL_DENOMINATIONS,
  formatIndianCurrency,
  numberToIndianWords,
} from '../utils/currency';

interface CashSummaryProps {
  counts: Record<number, number>;
  activeDenominations: number[];
  currencySymbol: string;
}

export const CashSummary: React.FC<CashSummaryProps> = ({
  counts,
  activeDenominations,
  currencySymbol,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute breakdown data
  const visibleDenominations = ALL_DENOMINATIONS.filter((d) =>
    activeDenominations.includes(d.value)
  );

  let totalCash = 0;
  let totalNotes = 0;
  let highestDenom = 0;

  const rows = visibleDenominations
    .map((d) => {
      const qty = counts[d.value] || 0;
      const amount = d.value * qty;
      totalNotes += qty;
      totalCash += amount;
      if (qty > 0 && d.value > highestDenom) {
        highestDenom = d.value;
      }
      return {
        ...d,
        quantity: qty,
        amount,
      };
    })
    .filter((r) => r.quantity > 0);

  const averagePerNote = totalNotes > 0 ? Math.round(totalCash / totalNotes) : 0;

  const handleCopySummary = () => {
    if (totalCash === 0) return;

    let text = `*Cash Count Summary*\n`;
    text += `Date: ${new Date().toLocaleString('en-IN')}\n`;
    text += `-------------------------\n`;
    rows.forEach((r) => {
      text += `${r.label} x ${r.quantity} = ${currencySymbol}${r.amount.toLocaleString('en-IN')}\n`;
    });
    text += `-------------------------\n`;
    text += `*Total Notes:* ${totalNotes}\n`;
    text += `*Grand Total:* ${currencySymbol}${totalCash.toLocaleString('en-IN')}\n`;
    text += `(${numberToIndianWords(totalCash)})\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (totalCash === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <Coins className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">
          No Cash Counted Yet
        </h3>
        <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Add notes using the + and - buttons on the Cash Counter to view instant distribution charts
          and cash statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Highest Denomination */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Highest Denom
          </span>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-2xl">
            {highestDenom > 0 ? `${currencySymbol}${highestDenom}` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Largest note in drawer</div>
        </div>

        {/* Average Value Per Note */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Average / Note
          </span>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-2xl">
            {formatIndianCurrency(averagePerNote, currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Mean note denomination</div>
        </div>

        {/* Total Physical Pieces */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Pieces
          </span>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-2xl">
            {totalNotes}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Notes & coins count</div>
        </div>

        {/* Grand Total */}
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 shadow-2xs dark:border-emerald-800 dark:bg-emerald-950/40">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Total Valuation
          </span>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums text-emerald-900 dark:text-emerald-200 sm:text-2xl">
            {formatIndianCurrency(totalCash, currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Net calculated balance</div>
        </div>
      </div>

      {/* Cash Distribution Chart / Visual Share */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cash Distribution by Value
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>

        {/* Multi-segment segmented progress bar */}
        <div className="mt-4 flex h-6 w-full overflow-hidden rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {rows.map((r) => {
            const pct = (r.amount / totalCash) * 100;
            return (
              <div
                key={r.value}
                style={{ width: `${pct}%`, backgroundColor: r.color }}
                className="h-full first:rounded-l-lg last:rounded-r-lg transition-all duration-300 relative group"
                title={`${r.label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Distribution Legend & Individual bars */}
        <div className="mt-5 space-y-2.5">
          {rows.map((r) => {
            const pct = ((r.amount / totalCash) * 100).toFixed(1);
            return (
              <div key={r.value} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {r.label} Notes
                    </span>
                    <span className="text-slate-400">({r.quantity} pcs)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">{pct}%</span>
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatIndianCurrency(r.amount, currencySymbol)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Denomination-wise Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Detailed Denomination Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Denomination</th>
                <th className="px-5 py-3 text-right">Count</th>
                <th className="px-5 py-3 text-right">Total Amount</th>
                <th className="px-5 py-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr
                  key={r.value}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: r.color }}
                      />
                      <span>{r.label}</span>
                      <span className="text-[11px] text-slate-400">({r.description})</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {r.quantity}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatIndianCurrency(r.amount, currencySymbol)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {((r.amount / totalCash) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <td className="px-5 py-3.5 text-slate-900 dark:text-white">Total</td>
                <td className="px-5 py-3.5 text-right font-mono text-slate-900 dark:text-white">
                  {totalNotes}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  {formatIndianCurrency(totalCash, currencySymbol)}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-slate-900 dark:text-white">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
