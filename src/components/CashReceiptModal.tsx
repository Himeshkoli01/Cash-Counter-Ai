import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  Check,
  Building,
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  ALL_DENOMINATIONS,
  formatIndianCurrency,
  numberToIndianWords,
} from '../utils/currency';

interface CashReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  category?: string;
  notesText?: string;
  timestamp?: string;
  counts: Record<number, number>;
  activeDenominations: number[];
  currencySymbol: string;
  businessName: string;
}

export const CashReceiptModal: React.FC<CashReceiptModalProps> = ({
  isOpen,
  onClose,
  title = 'Cash Count Receipt',
  category = 'Cash Tally',
  notesText = '',
  timestamp,
  counts,
  activeDenominations,
  currencySymbol,
  businessName,
}) => {
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const dateObj = timestamp ? new Date(timestamp) : new Date();
  const dateFormatted = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const receiptId = `RCP-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Filter rows with count > 0
  const rows = ALL_DENOMINATIONS.filter((d) => (counts[d.value] || 0) > 0)
    .map((d) => {
      const qty = counts[d.value] || 0;
      return {
        ...d,
        quantity: qty,
        subtotal: d.value * qty,
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalNotes = rows.reduce((acc, r) => acc + r.quantity, 0);
  const totalAmount = rows.reduce((acc, r) => acc + r.subtotal, 0);
  const words = numberToIndianWords(totalAmount);

  // Print Receipt handler
  const handlePrint = () => {
    window.print();
  };

  // Generate crisp PDF using jsPDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 160 + rows.length * 8], // thermal receipt style dimension
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(businessName || 'CashCount AI', pageWidth / 2, 12, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('OFFICIAL CASH VERIFICATION RECEIPT', pageWidth / 2, 17, { align: 'center' });

      // Receipt details
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      doc.text(`Receipt #: ${receiptId}`, 10, 24);
      doc.text(`Date & Time: ${dateFormatted} ${timeFormatted}`, 10, 29);
      doc.text(`Purpose: ${title} (${category})`, 10, 34);

      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(10, 37, pageWidth - 10, 37);

      // Table Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Denomination', 10, 42);
      doc.text('Qty', 55, 42, { align: 'right' });
      doc.text('Amount (INR)', pageWidth - 10, 42, { align: 'right' });

      doc.line(10, 44, pageWidth - 10, 44);

      // Table Rows
      doc.setFont('helvetica', 'normal');
      let currentY = 50;

      rows.forEach((r) => {
        doc.text(`Rs. ${r.value}`, 10, currentY);
        doc.text(`${r.quantity}`, 55, currentY, { align: 'right' });
        doc.text(
          `${formatIndianCurrency(r.subtotal, '', false)}`,
          pageWidth - 10,
          currentY,
          { align: 'right' }
        );
        currentY += 6.5;
      });

      // Total Line
      doc.line(10, currentY, pageWidth - 10, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Total Banknotes:', 10, currentY);
      doc.text(`${totalNotes} pcs`, pageWidth - 10, currentY, { align: 'right' });
      currentY += 6;

      doc.setFontSize(10);
      doc.text('GRAND TOTAL:', 10, currentY);
      doc.text(
        `Rs. ${formatIndianCurrency(totalAmount, '', false)}`,
        pageWidth - 10,
        currentY,
        { align: 'right' }
      );
      currentY += 6;

      // Amount in words
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      const splitWords = doc.splitTextToSize(`(${words})`, pageWidth - 20);
      doc.text(splitWords, 10, currentY);
      currentY += splitWords.length * 4 + 4;

      if (notesText) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Remarks: ${notesText}`, 10, currentY);
        currentY += 8;
      }

      // Signatures
      currentY += 6;
      doc.setDrawColor(180, 180, 180);
      doc.line(10, currentY, 40, currentY);
      doc.line(pageWidth - 40, currentY, pageWidth - 10, currentY);

      doc.setFontSize(7);
      doc.text('Cashier Signature', 10, currentY + 4);
      doc.text('Verified By', pageWidth - 40, currentY + 4);

      // Save PDF
      doc.save(`Receipt_${receiptId}.pdf`);
    } catch (e) {
      console.error('Error generating PDF', e);
    }
  };

  // Share summary
  const handleShare = async () => {
    let summary = `*${businessName} - Cash Receipt*\n`;
    summary += `Receipt: ${receiptId}\n`;
    summary += `Date: ${dateFormatted} ${timeFormatted}\n`;
    summary += `Purpose: ${title}\n`;
    summary += `------------------------------\n`;
    rows.forEach((r) => {
      summary += `${r.label} x ${r.quantity} = ${currencySymbol}${r.subtotal.toLocaleString('en-IN')}\n`;
    });
    summary += `------------------------------\n`;
    summary += `*Total Notes:* ${totalNotes}\n`;
    summary += `*GRAND TOTAL:* ${currencySymbol}${totalAmount.toLocaleString('en-IN')}\n`;
    summary += `(${words})\n`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cash Receipt - ${receiptId}`,
          text: summary,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Top Control Bar */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/60">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cash Summary Receipt
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Receipt Container */}
        <div
          ref={receiptRef}
          className="receipt-printable max-h-[70vh] overflow-y-auto p-6 font-mono text-slate-800 dark:text-slate-200"
        >
          {/* Header */}
          <div className="border-b border-dashed border-slate-300 pb-4 text-center dark:border-slate-700">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Building className="h-3.5 w-3.5" />
              <span>CASH VERIFICATION VOUCHER</span>
            </div>
            <h2 className="mt-1 font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {businessName || 'CashCount AI'}
            </h2>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Receipt No: <span className="font-semibold text-slate-700 dark:text-slate-300">{receiptId}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {dateFormatted} · {timeFormatted}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {title} {category ? `(${category})` : ''}
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="py-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <span>Denom</span>
              <span className="text-right">Notes</span>
              <span className="text-right">Subtotal</span>
            </div>

            <div className="divide-y divide-dashed divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <div
                  key={r.value}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <span className="font-semibold">
                    {currencySymbol}
                    {r.value}
                  </span>
                  <span className="text-right tabular-nums text-slate-600 dark:text-slate-400">
                    × {r.quantity}
                  </span>
                  <span className="text-right font-bold tabular-nums">
                    {formatIndianCurrency(r.subtotal, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="mt-3 border-t-2 border-slate-900 pt-3 dark:border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>TOTAL BANKNOTES:</span>
                <span className="tabular-nums">{totalNotes} Notes</span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between text-base font-bold text-slate-900 dark:text-white">
                <span>GRAND TOTAL:</span>
                <span className="font-mono text-xl tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatIndianCurrency(totalAmount, currencySymbol)}
                </span>
              </div>
            </div>

            {/* In Words */}
            <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-center text-[11px] italic text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {words}
            </div>

            {/* Remarks if any */}
            {notesText && (
              <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Remarks:</strong> {notesText}
              </div>
            )}

            {/* Signatures for formal paper verification */}
            <div className="mt-8 flex items-center justify-between pt-6 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="border-t border-slate-400 pt-1 text-center">
                <span>Cashier Signature</span>
              </div>
              <div className="border-t border-slate-400 pt-1 text-center">
                <span>Verified & Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Printer className="h-4 w-4" />
            <span>Print Slip</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Share or copy receipt"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
