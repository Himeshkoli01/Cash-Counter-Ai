import React, { useState } from 'react';
import { X, Delete, Percent, Divide, Equal, Plus, Minus, X as MultiplyIcon } from 'lucide-react';
import { sound } from '../utils/sound';

interface QuickCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

export const QuickCalculatorModal: React.FC<QuickCalculatorModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
}) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    sound.playClick(0.9);
    if (display === '0' || shouldResetDisplay) {
      setDisplay(digit);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    sound.playClick(0.9);
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    sound.playClick(1.1);
    setEquation(`${display} ${op} `);
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    sound.playPop();
    setDisplay('0');
    setEquation('');
    setShouldResetDisplay(false);
  };

  const handleBackspace = () => {
    sound.playClick(0.8);
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    if (!equation) return;
    sound.playSuccess();
    try {
      const fullExpr = equation + display;
      // Sanitize equation to allow only standard math
      const sanitized = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');
      if (/^[0-9+\-*/. ()]+$/.test(sanitized)) {
        // Safe arithmetic evaluation
        const result = Function(`'use strict'; return (${sanitized})`)();
        const formatted = Number.isInteger(result) ? result.toString() : Number(result.toFixed(4)).toString();
        setDisplay(formatted);
        setEquation('');
        setShouldResetDisplay(true);
      }
    } catch {
      setDisplay('Error');
      setEquation('');
      setShouldResetDisplay(true);
    }
  };

  const handlePercentage = () => {
    sound.playClick(1.0);
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay((val / 100).toString());
      setShouldResetDisplay(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xs overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cash & Billing Calculator
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-900 p-5 text-right font-mono text-white dark:bg-slate-950">
          <div className="h-5 text-xs text-slate-400">{equation || '\u00A0'}</div>
          <div className="mt-1 truncate text-3xl font-bold tracking-tight">
            {display}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2 p-4">
          <button
            type="button"
            onClick={handleClear}
            className="flex h-12 items-center justify-center rounded-2xl bg-red-50 text-xs font-bold text-red-600 active:scale-95 dark:bg-red-950/40 dark:text-red-400"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="flex h-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 active:scale-95 dark:bg-slate-800 dark:text-slate-200"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handlePercentage}
            className="flex h-12 items-center justify-center rounded-2xl bg-slate-100 text-xs font-bold text-slate-700 active:scale-95 dark:bg-slate-800 dark:text-slate-200"
          >
            <Percent className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className="flex h-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 active:scale-95 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <Divide className="h-4 w-4" />
          </button>

          {['7', '8', '9'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n)}
              className="flex h-12 items-center justify-center rounded-2xl border border-slate-100 bg-white font-mono text-base font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className="flex h-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 active:scale-95 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <MultiplyIcon className="h-4 w-4" />
          </button>

          {['4', '5', '6'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n)}
              className="flex h-12 items-center justify-center rounded-2xl border border-slate-100 bg-white font-mono text-base font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('-')}
            className="flex h-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 active:scale-95 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <Minus className="h-4 w-4" />
          </button>

          {['1', '2', '3'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n)}
              className="flex h-12 items-center justify-center rounded-2xl border border-slate-100 bg-white font-mono text-base font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className="flex h-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 active:scale-95 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex h-12 items-center justify-center rounded-2xl border border-slate-100 bg-white font-mono text-base font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleDigit('00')}
            className="flex h-12 items-center justify-center rounded-2xl border border-slate-100 bg-white font-mono text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            00
          </button>
          <button
            type="button"
            onClick={handleDecimal}
            className="flex h-12 items-center justify-center rounded-2xl border border-slate-100 bg-white font-mono text-base font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleCalculate}
            className="flex h-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:scale-95"
          >
            <Equal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
