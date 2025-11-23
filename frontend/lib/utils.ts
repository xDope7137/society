import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string with relative time for recent dates
 * - Less than 1 hour: "x minutes ago"
 * - Less than 24 hours: "x hours ago"
 * - Otherwise: "18th November 2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Helper function for ordinal suffix
  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Helper function for formatted date
  const getFormattedDate = (d: Date) => {
    const day = d.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  // If date is in the future, just show formatted date
  if (diffMs < 0) {
    return getFormattedDate(date);
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // If less than 1 hour ago, show minutes
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }

  // If less than 24 hours ago, show hours
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  // Otherwise, show formatted date: "18th November 2025"
  return getFormattedDate(date);
}

