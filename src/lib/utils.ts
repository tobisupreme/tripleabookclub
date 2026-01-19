import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || ''
}

export function getCurrentMonthYear() {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export function getNextMonth(month: number, year: number) {
  if (month === 12) {
    return { month: 1, year: year + 1 }
  }
  return { month: month + 1, year }
}

export function getBiMonthlyPeriod(month: number, year: number): { startMonth: number; endMonth: number; year: number } {
  // Non-fiction is bi-monthly: Jan-Feb, Mar-Apr, May-Jun, etc.
  const startMonth = month % 2 === 0 ? month - 1 : month
  const endMonth = startMonth + 1
  return { startMonth, endMonth, year }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
