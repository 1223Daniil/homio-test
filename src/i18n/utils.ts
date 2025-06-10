import { TranslationValues } from 'next-intl';

export const isDebug = process.env.NODE_ENV === 'development';

export type Messages = Record<string, any>;

/**
 * Formats a key into a readable string
 */
export function formatTranslationKey(key: string): string {
  return key
    .split(/(?=[A-Z])|\./)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Logs translation-related messages in development mode
 */
export function logTranslation(message: string, ...args: any[]) {
  if (isDebug) {
    console.log(`🔍 [i18n] ${message}`, ...args);
  }
}

/**
 * Applies parameters to translation string
 */
export function applyTranslationValues(text: string, values?: TranslationValues): string {
  if (!values) return text;
  return Object.entries(values).reduce((str, [key, value]) => {
    return str.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
  }, text);
}

/**
 * Gets all possible variations of a translation key
 */
export function getAllKeyVariations(key: string): string[] {
  const parts = key.split('.');
  const variations: string[] = [
    key,                                                    // original
    key.toLowerCase(),                                      // lowercase
    key.toUpperCase(),                                      // uppercase
    parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('.'), // Title Case
    [parts[0].toLowerCase(), ...parts.slice(1)].join('.'),  // camelCase
    [parts[0].toUpperCase(), ...parts.slice(1)].join('.')   // PascalCase
  ];
  
  return [...new Set(variations)];
}

/**
 * Recursively searches for a translation value in messages object
 */
export function findTranslationValue(messages: Messages, key: string): string | null {
  if (typeof messages === 'string') return messages;
  if (!messages || typeof messages !== 'object') return null;

  // 1. Try exact match first
  const exactMatch = key.split('.').reduce((current: any, part) => 
    current && current[part], messages);
  if (typeof exactMatch === 'string') return exactMatch;

  // 2. Try case variations
  for (const variant of getAllKeyVariations(key)) {
    const match = variant.split('.').reduce((current: any, part) => 
      current && current[part], messages);
    if (typeof match === 'string') return match;
  }

  // 3. Try searching in all objects recursively
  for (const value of Object.values(messages)) {
    if (typeof value === 'object') {
      const found = findTranslationValue(value, key);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Creates a map of all translation keys and their values
 */
export function createTranslationMap(messages: Messages): Map<string, string> {
  const map = new Map<string, string>();
  
  function traverse(obj: Messages, path: string[] = []) {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];
      const fullPath = currentPath.join('.');
      
      if (typeof value === 'string') {
        getAllKeyVariations(fullPath).forEach(variation => {
          map.set(variation, value);
        });
      } else {
        traverse(value, currentPath);
      }
    });
  }
  
  traverse(messages);
  return map;
} 