import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет классы с использованием clsx и twMerge для правильного слияния tailwind классов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
