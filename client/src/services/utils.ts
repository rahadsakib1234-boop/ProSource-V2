/**
 * Utility Functions
 * Common helpers used throughout the application
 */

/**
 * Generate a unique ID using timestamp and random string
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * HTML escape to prevent XSS
 */
export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Format date as DD-MM-YYYY
 */
export function formatDate(date: Date | number): string {
  const d = new Date(date);
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | number): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

/**
 * Check if date is overdue
 */
export function isOverdue(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

/**
 * Check if date is today
 */
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

/**
 * Check if date is in the future
 */
export function isUpcoming(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr > today;
}

/**
 * Get days until date
 */
export function daysUntil(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr + 'T00:00:00Z');
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Merge objects
 */
export function mergeObjects<T extends Record<string, any>>(base: T, updates: Partial<T>): T {
  return { ...base, ...updates };
}

/**
 * Filter object by keys
 */
export function filterObjectByKeys<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Group array by key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Sort array by key
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by search term
 */
export function filterBySearch<T extends Record<string, any>>(
  arr: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] {
  const term = searchTerm.toLowerCase();
  return arr.filter((item) =>
    searchKeys.some((key) => String(item[key]).toLowerCase().includes(term))
  );
}

/**
 * Paginate array
 */
export function paginate<T>(arr: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return arr.slice(start, start + pageSize);
}

/**
 * Get total pages
 */
export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}
