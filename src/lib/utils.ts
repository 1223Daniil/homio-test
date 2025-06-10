import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function getMediaUrl(url?: string): string {
  // If url is undefined or null, return empty string or default image
  if (!url) {
    return ""; // or return your default image URL
  }

  // If the URL is already absolute or starts with http/https, return as is
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }

  // If it starts with /uploads, it's a local file
  if (url.startsWith("/uploads/")) {
    return url;
  }

  // Otherwise, prepend the base URL
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length to 50 characters
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
