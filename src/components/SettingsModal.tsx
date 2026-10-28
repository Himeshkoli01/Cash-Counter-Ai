import React, { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Coins,
  Building,
  RotateCcw,
  Trash2,
  Database,
  Moon,
  Sun,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  AppSettings,
  saveSettings,
  generateSampleRecords,
  clearAllRecords,
} from '../utils/storage';
import { ALL_DENOMINATIONS } from '../utils/currency';
import { sound } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onRefreshRecords: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRefreshRecords,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    sound.enabled = formData.soundEnabled;
    onUpdateSettings(formData);
    sound.playSuccess();
    onClose();
  };

  const toggleDenom = (val: number) => {
    const list = formData.activeDenominations;
    if (list.includes(val)) {
      if (list.length > 2) {
        setFormData({
          ...formData,
          activeDenominations: list.filter((v) => v !== val),
        });
      }
    } else {
      setFormData({
        ...formData,
        activeDenominations: [...list, val],
      });
    }
  };

  const handleLoadDemo = () => {
    generateSampleRecords();
    onRefreshRecords();
    sound.playSuccess();
    showToast('Sample cash records loaded successfully!');
  };

  const handleClearAllData = () => {
    clearAllRecords();
    onRefreshRecords();
    sound.playPop();
    setShowClearConfirm(false);
    showToast('All saved history records deleted.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Application Settings
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
        <form onSubmit={handleSave} className="max-h-[75vh] overflow-y-auto p-6 space-y-5">
          {feedback && (
            <div className="rounded-xl bg-emerald-50 p-2.5 text-center text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {feedback}
            </div>
          )}

          {/* Business / Shop Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Business / Shop Name (Printed on Receipts)
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <Building className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Metro Supermarket & Retail"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Currency Symbol Display */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Currency Symbol Format
            </label>
            <div className="mt-1.5 flex gap-2">
              {['₹', 'Rs.', 'INR '].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setFormData({ ...formData, currencySymbol: sym })}
                  className={`flex-1 rounded-xl border py-2 font-mono text-xs font-bold transition-all ${
                    formData.currencySymbol === sym
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {sym.trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Active Denominations Toggles */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visible Banknotes & Coins in Counter
              </label>
              <span className="text-[11px] text-slate-400">Tap to toggle</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_DENOMINATIONS.map((d) => {
                const isActive = formData.activeDenominations.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDenom(d.value)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-50/60 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'border-slate-200 bg-slate-50/60 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                    }`}
                  >
                    <span className="font-mono font-bold">{d.label}</span>
                    <span className="text-[10px] text-slate-400">
                      {d.value === 2000 ? 'Legacy' : d.type === 'coin' ? 'Coin' : 'Note'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound & Haptic Feedback */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Audio Tactile Feedback
              </div>
              <div className="text-[11px] text-slate-400">
                Play subtle mechanical clicks when incrementing notes
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, soundEnabled: !formData.soundEnabled })
              }
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                formData.soundEnabled
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              {formData.soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Visual Theme
              </div>
              <div className="text-[11px] text-slate-400">
                Switch between light and dark dashboard modes
              </div>
            </div>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'light' })}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  formData.theme === 'light'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  formData.theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-sky-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Demo Data & Storage
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Load Sample Records</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 active:scale-95 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Records</span>
              </button>
            </div>
          </div>

          {/* Clear confirmation inner alert */}
          {showClearConfirm && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs dark:border-red-900 dark:bg-red-950/50">
              <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Confirm erasing all saved records?</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                This deletes all saved history tallies from this browser.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 active:scale-95"
                >
                  Yes, Erase
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Save buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4">
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
              <Check className="h-3.5 w-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
