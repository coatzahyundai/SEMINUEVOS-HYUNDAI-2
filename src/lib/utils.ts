import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeString(s: string) {
  if (!s) return "";
  let str = String(s).toUpperCase();
  str = str.replace(/5 PUERTAS/g, 'HB').replace(/4 PUERTAS/g, 'SD').replace(/5DR/g, 'HB').replace(/4DR/g, 'SD');
  str = str.replace(/SEDAN/g, 'SD').replace(/HATCHBACK/g, 'HB').replace(/AUTOMATICA/g, 'TA').replace(/AUTOMATICO/g, 'TA');
  str = str.replace(/\bAUT\b/g, 'TA').replace(/\bAT\b/g, 'TA').replace(/\bDCT\b/g, 'TA').replace(/\bIVT\b/g, 'TA');
  str = str.replace(/MANUAL/g, 'TM').replace(/\bMT\b/g, 'TM').replace(/GRANDI10/g, 'GRAND I10').replace(/PREMUIM/g, 'PREMIUM');
  str = str.replace(/[^A-Z0-9. ]/g, ' ');
  return str.replace(/\s+/g, ' ').trim();
}
