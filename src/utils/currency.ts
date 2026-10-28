/**
 * Indian Currency and Formatting Utilities
 */

export interface DenominationConfig {
  value: number;
  label: string;
  type: 'note' | 'coin';
  color: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  description: string;
  defaultActive: boolean;
}

export const ALL_DENOMINATIONS: DenominationConfig[] = [
  {
    value: 2000,
    label: '₹2000',
    type: 'note',
    color: '#be185d', // Magenta
    badgeBg: 'bg-pink-100 dark:bg-pink-950/60',
    borderColor: 'border-pink-300 dark:border-pink-800',
    textColor: 'text-pink-700 dark:text-pink-300',
    description: 'Magenta Note (Legacy)',
    defaultActive: false,
  },
  {
    value: 500,
    label: '₹500',
    type: 'note',
    color: '#475569', // Stone Grey
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-300 dark:border-slate-700',
    textColor: 'text-slate-800 dark:text-slate-200',
    description: 'Stone Grey Note',
    defaultActive: true,
  },
  {
    value: 200,
    label: '₹200',
    type: 'note',
    color: '#d97706', // Bright Orange
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    borderColor: 'border-amber-300 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-300',
    description: 'Bright Orange Note',
    defaultActive: true,
  },
  {
    value: 100,
    label: '₹100',
    type: 'note',
    color: '#7c3aed', // Lavender Purple
    badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
    borderColor: 'border-violet-300 dark:border-violet-800',
    textColor: 'text-violet-800 dark:text-violet-300',
    description: 'Lavender Note',
    defaultActive: true,
  },
  {
    value: 50,
    label: '₹50',
    type: 'note',
    color: '#0284c7', // Fluorescent Blue
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
    borderColor: 'border-sky-300 dark:border-sky-800',
    textColor: 'text-sky-800 dark:text-sky-300',
    description: 'Fluorescent Blue Note',
    defaultActive: true,
  },
  {
    value: 20,
    label: '₹20',
    type: 'note',
    color: '#65a30d', // Greenish Yellow
    badgeBg: 'bg-lime-100 dark:bg-lime-950/60',
    borderColor: 'border-lime-300 dark:border-lime-800',
    textColor: 'text-lime-800 dark:text-lime-300',
    description: 'Greenish Yellow Note',
    defaultActive: true,
  },
  {
    value: 10,
    label: '₹10',
    type: 'note',
    color: '#92400e', // Chocolate Brown
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    borderColor: 'border-orange-300 dark:border-orange-800',
    textColor: 'text-orange-900 dark:text-orange-300',
    description: 'Chocolate Brown Note',
    defaultActive: true,
  },
  {
    value: 5,
    label: '₹5',
    type: 'coin',
    color: '#059669', // Nickel Brass / Coin
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
    textColor: 'text-emerald-800 dark:text-emerald-300',
    description: 'Coin / Note',
    defaultActive: false,
  },
  {
    value: 2,
    label: '₹2',
    type: 'coin',
    color: '#64748b', // Steel Coin
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-300 dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    description: 'Steel Coin',
    defaultActive: false,
  },
  {
    value: 1,
    label: '₹1',
    type: 'coin',
    color: '#64748b', // Steel Coin
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-300 dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    description: 'Steel Coin',
    defaultActive: false,
  },
];

/**
 * Format a number using the Indian Numbering System (e.g. ₹1,23,450)
 */
export function formatIndianCurrency(
  amount: number,
  symbol: string = '₹',
  includeSymbol: boolean = true
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return includeSymbol ? `${symbol}0` : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  // Convert to Indian grouping: 3 digits at end, then groups of 2 digits
  const numStr = absAmount.toString();
  let result = '';

  if (numStr.length <= 3) {
    result = numStr;
  } else {
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${withCommas},${lastThree}`;
  }

  const prefix = isNegative ? '-' : '';
  return includeSymbol ? `${prefix}${symbol}${result}` : `${prefix}${result}`;
}

/**
 * Convert numbers into words according to Indian currency conventions (Crores, Lakhs, Thousands, Hundreds)
 */
export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Zero Rupees Only';
  }

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    const ten = tens[Math.floor(n / 10)];
    const one = ones[n % 10];
    return ten + (one ? ' ' + one : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += ones[hundred] + ' Hundred';
      if (rest > 0) res += ' and ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  const absAmount = Math.abs(Math.floor(amount));
  let remaining = absAmount;

  // Indian scales: Crores (10^7), Lakhs (10^5), Thousands (10^3), Hundreds
  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundredsPart = remaining;

  const parts: string[] = [];

  if (crores > 0) {
    parts.push(`${convertTwoDigits(crores)} Crore`);
  }
  if (lakhs > 0) {
    parts.push(`${convertTwoDigits(lakhs)} Lakh`);
  }
  if (thousands > 0) {
    parts.push(`${convertTwoDigits(thousands)} Thousand`);
  }
  if (hundredsPart > 0) {
    parts.push(convertThreeDigits(hundredsPart));
  }

  const words = parts.join(' ');
  return `${words} Rupees Only`;
}
