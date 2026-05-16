import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const API_PATH = "/api/v1";
export const FULL_API_URL = `${APP_URL}${API_PATH}`;
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateLevel(xp: number): {
  level: number;
  currentXp: number;
  xpToNext: number;
  progress: number;
} {
  const xpPerLevel = 200;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentXp = xp % xpPerLevel;
  const xpToNext = xpPerLevel - currentXp;
  const progress = (currentXp / xpPerLevel) * 100;
  return { level, currentXp, xpToNext, progress };
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
