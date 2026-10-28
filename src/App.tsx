import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Coins,
  History,
  Calculator,
  PieChart,
  Bot,
  Settings as SettingsIcon,
  Moon,
  Sun,
  PlusCircle,
  FileText,
  Calculator as CalcIcon,
} from 'lucide-react';

import { CashCounter } from './components/CashCounter';
import { CashSummary } from './components/CashSummary';
import { TargetCalculator } from './components/TargetCalculator';
import { CashHistory } from './components/CashHistory';
import { AiAssistant } from './components/AiAssistant';
import { CashReceiptModal } from './components/CashReceiptModal';
import { SaveCountModal } from './components/SaveCountModal';
import { SettingsModal } from './components/SettingsModal';
import { QuickCalculatorModal } from './components/QuickCalculatorModal';

import {
  ALL_DENOMINATIONS,
  formatIndianCurrency,
} from './utils/currency';
import {
  getSettings,
  saveSettings,
  getSavedRecords,
  saveRecord,
  AppSettings,
  CashRecord,
} from './utils/storage';
import { sound } from './utils/sound';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [records, setRecords] = useState<CashRecord[]>(() => getSavedRecords());

  // Note counts: denomination -> quantity
  const [counts, setCounts] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    ALL_DENOMINATIONS.forEach((d) => {
      initial[d.value] = 0;
    });
    return initial;
  });

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<
    'counter' | 'summary' | 'target' | 'history' | 'assistant'
  >('counter');

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  // Active receipt target for historical view
  const [activeReceiptRecord, setActiveReceiptRecord] = useState<CashRecord | null>(null);

  // Sync theme
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Compute Grand Total & Total Notes
  let totalCash = 0;
  let totalNotes = 0;
  ALL_DENOMINATIONS.forEach((d) => {
    if (settings.activeDenominations.includes(d.value)) {
      const qty = counts[d.value] || 0;
      totalNotes += qty;
      totalCash += d.value * qty;
    }
  });

  const handleCountChange = (denomValue: number, newCount: number) => {
    setCounts((prev) => ({
      ...prev,
      [denomValue]: Math.max(0, newCount),
    }));
  };

  const handleClearAll = () => {
    const cleared: Record<number, number> = {};
    ALL_DENOMINATIONS.forEach((d) => {
      cleared[d.value] = 0;
    });
    setCounts(cleared);
  };

  const handleSaveCount = (title: string, category: string, notesText: string) => {
    saveRecord(title, category, notesText, counts, totalCash, totalNotes);
    setRecords(getSavedRecords());
  };

  const handleLoadRecordToCounter = (newCounts: Record<number, number>) => {
    const updated: Record<number, number> = {};
    ALL_DENOMINATIONS.forEach((d) => {
      updated[d.value] = newCounts[d.value] || 0;
    });
    setCounts(updated);
    setActiveTab('counter');
  };

  const handleViewRecordReceipt = (record: CashRecord) => {
    setActiveReceiptRecord(record);
    setIsReceiptModalOpen(true);
  };

  const handleOpenCurrentReceipt = () => {
    setActiveReceiptRecord(null);
    setIsReceiptModalOpen(true);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme as 'light' | 'dark' };
    setSettings(updated);
    saveSettings(updated);
  };

  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    saveSettings(updated);
    sound.enabled = updated.soundEnabled;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand Wordmark Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-900/20">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  CashCount
                </span>
                <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 font-mono text-xs font-bold text-white shadow-2xs">
                  AI
                </span>
              </div>
              <div className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Indian Banknote Counter & Cash Desk
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={() => setActiveTab('counter')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'counter'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>Counter</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <PieChart className="h-4 w-4" />
              <span>Breakdown</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('target')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'target'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Target Solver</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              <span>History ({records.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>AI Assistant</span>
            </button>
          </nav>

          {/* Action Tools Zone */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Mini Total Indicator in Header */}
            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400">Total:</span>
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {formatIndianCurrency(totalCash, settings.currencySymbol)}
              </span>
            </div>

            {/* Quick Calculator Popup Trigger */}
            <button
              type="button"
              onClick={() => setIsCalcModalOpen(true)}
              title="Quick Billing Calculator"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              <CalcIcon className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {settings.theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              title="Settings & Denominations"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-7 lg:px-8 lg:pb-12">
        {activeTab === 'counter' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 8 columns: Cash Counter */}
            <div className="lg:col-span-8">
              <CashCounter
                counts={counts}
                activeDenominations={settings.activeDenominations}
                currencySymbol={settings.currencySymbol}
                soundEnabled={settings.soundEnabled}
                onCountChange={handleCountChange}
                onClearAll={handleClearAll}
                onOpenSaveModal={() => setIsSaveModalOpen(true)}
                onOpenReceiptModal={handleOpenCurrentReceipt}
                onToggleSound={toggleSound}
              />
            </div>

            {/* Right 4 columns on desktop: Quick Live Cash Breakdown & Assistant Hook */}
            <div className="hidden lg:block lg:col-span-4 space-y-5">
              <div className="sticky top-24 space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Live Cash Analytics
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('summary')}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Full Analysis →
                    </button>
                  </div>

                  {totalCash === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Count banknotes to preview the real-time distribution chart.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500">Average Note Value</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatIndianCurrency(
                            totalNotes > 0 ? Math.round(totalCash / totalNotes) : 0,
                            settings.currencySymbol
                          )}
                        </span>
                      </div>

                      {/* Mini bar breakdown */}
                      <div className="space-y-2">
                        {ALL_DENOMINATIONS.filter((d) => (counts[d.value] || 0) > 0).map((d) => {
                          const val = d.value * (counts[d.value] || 0);
                          const pct = ((val / totalCash) * 100).toFixed(0);
                          return (
                            <div key={d.value} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {d.label} × {counts[d.value]}
                                </span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {pct}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%`, backgroundColor: d.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleOpenCurrentReceipt}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Generate & Print Receipt</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Assistant Callout */}
                <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-slate-900">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Bot className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      CashCount AI Assistant
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    Need note combination advice for customer change or target salaries?
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assistant')}
                    className="mt-3 flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    <span>Open AI Cash Desk</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <CashSummary
            counts={counts}
            activeDenominations={settings.activeDenominations}
            currencySymbol={settings.currencySymbol}
          />
        )}

        {activeTab === 'target' && (
          <TargetCalculator
            activeDenominations={settings.activeDenominations}
            currencySymbol={settings.currencySymbol}
            onApplyCombinationToCounter={handleLoadRecordToCounter}
          />
        )}

        {activeTab === 'history' && (
          <CashHistory
            records={records}
            currencySymbol={settings.currencySymbol}
            onRefreshRecords={() => setRecords(getSavedRecords())}
            onLoadRecordToCounter={handleLoadRecordToCounter}
            onViewRecordReceipt={handleViewRecordReceipt}
          />
        )}

        {activeTab === 'assistant' && (
          <AiAssistant
            currentCounts={counts}
            activeDenominations={settings.activeDenominations}
            currencySymbol={settings.currencySymbol}
            onApplyCombinationToCounter={handleLoadRecordToCounter}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-900/95">
        <div className="grid grid-cols-5 items-center h-16">
          <button
            type="button"
            onClick={() => setActiveTab('counter')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'counter'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Coins className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-medium tracking-tight">Counter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'summary'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <PieChart className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-medium tracking-tight">Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'target'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-medium tracking-tight">Target</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'history'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <History className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-medium tracking-tight">History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'assistant'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Bot className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-medium tracking-tight">AI Desk</span>
          </button>
        </div>
      </nav>

      {/* Save Count Modal */}
      <SaveCountModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        totalCash={totalCash}
        totalNotes={totalNotes}
        currencySymbol={settings.currencySymbol}
        onSave={handleSaveCount}
      />

      {/* Cash Receipt Modal */}
      <CashReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title={activeReceiptRecord?.title || 'Cash Verification Voucher'}
        category={activeReceiptRecord?.category || 'Daily Count'}
        notesText={activeReceiptRecord?.notesText || ''}
        timestamp={activeReceiptRecord?.timestamp}
        counts={activeReceiptRecord?.counts || counts}
        activeDenominations={settings.activeDenominations}
        currencySymbol={settings.currencySymbol}
        businessName={settings.businessName}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onRefreshRecords={() => setRecords(getSavedRecords())}
      />

      {/* Quick Calculator Modal */}
      <QuickCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        currencySymbol={settings.currencySymbol}
      />
    </div>
  );
}
