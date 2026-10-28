/**
 * Target Amount Note Combination Solver
 * Provides deterministic algorithms for finding note splits
 */

export interface TargetCombination {
  id: string;
  strategyName: string;
  description: string;
  counts: Record<number, number>;
  totalAmount: number;
  totalNotes: number;
  isExact: boolean;
  remainder: number;
}

/**
 * Strategy 1: Minimum Notes (Greedy Largest First)
 */
export function solveMinimumNotes(
  targetAmount: number,
  availableDenoms: number[]
): TargetCombination {
  const sorted = [...availableDenoms].sort((a, b) => b - a);
  let remaining = targetAmount;
  const counts: Record<number, number> = {};
  let totalNotes = 0;

  for (const d of sorted) {
    if (remaining >= d) {
      const num = Math.floor(remaining / d);
      counts[d] = num;
      totalNotes += num;
      remaining %= d;
    } else {
      counts[d] = 0;
    }
  }

  const formedAmount = targetAmount - remaining;
  return {
    id: 'min-notes',
    strategyName: 'Minimum Notes (Fastest / Large First)',
    description: 'Uses the highest denomination banknotes available for compact cash handling.',
    counts,
    totalAmount: formedAmount,
    totalNotes,
    isExact: remaining === 0,
    remainder: remaining,
  };
}

/**
 * Strategy 2: Balanced Mix (Distribute evenly across available denominations)
 */
export function solveBalancedMix(
  targetAmount: number,
  availableDenoms: number[]
): TargetCombination {
  if (targetAmount <= 0 || availableDenoms.length === 0) {
    return solveMinimumNotes(targetAmount, availableDenoms);
  }

  const sorted = [...availableDenoms].sort((a, b) => b - a);
  const counts: Record<number, number> = {};
  sorted.forEach((d) => (counts[d] = 0));

  let remaining = targetAmount;
  const sumOfDenoms = sorted.reduce((acc, v) => acc + v, 0);

  // If amount is large enough, try putting at least some notes in each denomination
  if (remaining >= sumOfDenoms && sorted.length > 1) {
    const baseRounds = Math.floor(remaining / (sumOfDenoms * 1.5)) || 1;
    for (const d of sorted) {
      counts[d] += baseRounds;
      remaining -= d * baseRounds;
    }
  }

  // Then distribute greedily for the remainder
  for (const d of sorted) {
    if (remaining >= d) {
      const add = Math.floor(remaining / d);
      counts[d] = (counts[d] || 0) + add;
      remaining %= d;
    }
  }

  let totalNotes = 0;
  let totalAmount = 0;
  Object.entries(counts).forEach(([val, qty]) => {
    totalNotes += qty;
    totalAmount += Number(val) * qty;
  });

  return {
    id: 'balanced-mix',
    strategyName: 'Balanced Cash Drawer Mix',
    description: 'Blends both larger and smaller notes so the recipient has versatile change.',
    counts,
    totalAmount,
    totalNotes,
    isExact: remaining === 0,
    remainder: remaining,
  };
}

/**
 * Strategy 3: Change-Friendly (Retailer Preference - uses ₹100, ₹50, ₹20, ₹10)
 */
export function solveChangeFriendly(
  targetAmount: number,
  availableDenoms: number[]
): TargetCombination {
  const sorted = [...availableDenoms].sort((a, b) => a - b); // smallest first
  const counts: Record<number, number> = {};
  availableDenoms.forEach((d) => (counts[d] = 0));

  let remaining = targetAmount;

  // Prefer small/medium notes up to reasonable caps so we don't return 1000 ten-rupee notes
  const caps: Record<number, number> = {
    10: 20,
    20: 20,
    50: 20,
    100: 40,
    200: 30,
    500: 100,
    2000: 50,
  };

  // First pass: distribute to smaller denominations up to modest caps
  for (const d of sorted) {
    const maxUse = caps[d] || 15;
    if (remaining >= d) {
      const take = Math.min(Math.floor(remaining / d), maxUse);
      counts[d] = take;
      remaining -= take * d;
    }
  }

  // Second pass: cover remainder with available largest notes
  const reverseSorted = [...availableDenoms].sort((a, b) => b - a);
  for (const d of reverseSorted) {
    if (remaining >= d) {
      const add = Math.floor(remaining / d);
      counts[d] = (counts[d] || 0) + add;
      remaining %= d;
    }
  }

  let totalNotes = 0;
  let totalAmount = 0;
  Object.entries(counts).forEach(([val, qty]) => {
    totalNotes += qty;
    totalAmount += Number(val) * qty;
  });

  return {
    id: 'change-friendly',
    strategyName: 'Retail / Change-Friendly',
    description: 'Provides more small and medium notes, ideal for market stalls and customer change.',
    counts,
    totalAmount,
    totalNotes,
    isExact: remaining === 0,
    remainder: remaining,
  };
}

/**
 * Generate all 3 strategies for a target amount
 */
export function getTargetSolutions(
  targetAmount: number,
  availableDenoms: number[]
): TargetCombination[] {
  if (targetAmount <= 0 || availableDenoms.length === 0) return [];
  return [
    solveMinimumNotes(targetAmount, availableDenoms),
    solveBalancedMix(targetAmount, availableDenoms),
    solveChangeFriendly(targetAmount, availableDenoms),
  ];
}
