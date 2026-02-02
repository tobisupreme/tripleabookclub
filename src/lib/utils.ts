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

/**
 * Transform Cloudinary URLs to auto-convert HEIC/HEIF to browser-compatible formats
 * Also adds quality optimization for all images
 */
export function getCloudinaryDisplayUrl(url: string): string {
  if (!url) return url
  
  // Only process Cloudinary URLs
  if (!url.includes('cloudinary.com')) return url
  
  // Check if it already has transformations
  if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto')) {
    return url
  }
  
  // Add f_auto (auto format) and q_auto (auto quality) transformations
  // This will convert HEIC/HEIF to WebP/JPG based on browser support
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}
