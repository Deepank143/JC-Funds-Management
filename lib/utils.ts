import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Indian Rupee. Shows decimals only when there are paise.
 * e.g. ₹5,00,000 for whole amounts, ₹1,23,456.50 for partial.
 */
export function formatINR(amount: number): string {
  const hasPaise = amount % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats currency in a human-readable adaptive way (K, L, Cr)
 * Useful for charts, mobile views, and large numbers.
 */
export function formatINRAdaptive(amount: number, withPrefix = true): string {
  const prefix = withPrefix ? '₹' : '';
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 10000000) { // 1 Crore
    return `${sign}${prefix}${(absAmount / 10000000).toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) { // 1 Lakh
    return `${sign}${prefix}${(absAmount / 100000).toFixed(2)} L`;
  }
  if (absAmount >= 1000) { // 1 Thousand
    return `${sign}${prefix}${(absAmount / 1000).toFixed(1)} K`;
  }
  return `${sign}${prefix}${absAmount.toFixed(0)}`;
}

// Format date to DD-MM-YYYY
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Generic signed difference: positive when date2 is AFTER date1.
 * Prefer the semantic helpers below for readability.
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * How many days UNTIL a future date from today.
 * Positive = date is in the future (days remaining).
 * Negative = date is in the past (days overdue).
 * Use this in intelligence / urgency logic.
 */
export function daysUntil(targetDate: string | Date): number {
  return daysBetween(new Date(), targetDate);
}

/**
 * How many days AGO a past date was, from today.
 * Positive = date is in the past.
 * Negative = date is in the future.
 */
export function daysSince(pastDate: string | Date): number {
  return daysBetween(pastDate, new Date());
}

// Get user-friendly relative time string
export function getRelativeTime(date: string | Date): string {
  const diff = daysSince(date); // positive = date is in the past
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff === -1) return 'tomorrow';
  if (diff > 1) return `${diff}d ago`;
  return `in ${Math.abs(diff)}d`;
}

// Get color based on profit margin
export function getProfitColor(margin: number): string {
  if (margin >= 15) return 'text-emerald-600 bg-emerald-50';
  if (margin >= 5) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

