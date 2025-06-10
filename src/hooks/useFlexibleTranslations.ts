import { useTranslations, TranslationValues } from 'next-intl';

const isDebug = process.env.NODE_ENV === 'development';

type Messages = Record<string, any>;

/**
 * Formats a key into a readable string
 */
function formatTranslationKey(key: string): string {
  return key
    .split(/(?=[A-Z])|\./)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Logs translation-related messages in development mode
 */
function logTranslation(message: string, ...args: any[]) {
  if (isDebug) {
    console.log(`🔍 [i18n] ${message}`, ...args);
  }
}

/**
 * Applies parameters to translation string
 */
function applyParams(text: string, params?: TranslationValues): string {
  if (!params) return text;
  return Object.entries(params).reduce((str, [key, value]) => {
    return str.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
  }, text);
}

/**
 * Recursively searches for a value in messages object
 */
function findInMessages(obj: Messages, searchKey: string): string | null {
  if (typeof obj === 'string') return obj;
  if (!obj || typeof obj !== 'object') return null;

  // 1. Try exact match first
  const exactMatch = searchKey.split('.').reduce((current: any, part) => 
    current && current[part], obj);
  if (typeof exactMatch === 'string') return exactMatch;

  // 2. Try case variations
  const variations = [
    searchKey,
    searchKey.toLowerCase(),
    searchKey.toUpperCase(),
    // Convert first letter of each part to uppercase
    searchKey.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join('.')
  ];

  for (const variant of variations) {
    const match = variant.split('.').reduce((current: any, part) => 
      current && current[part], obj);
    if (typeof match === 'string') return match;
  }

  // 3. Try searching in all objects recursively
  for (const value of Object.values(obj)) {
    if (typeof value === 'object') {
      const found = findInMessages(value, searchKey);
      if (found) return found;
    }
  }

  return null;
}

export function useFlexibleTranslations(namespace?: string) {
  // Get standard next-intl translator and root translator
  const translate = useTranslations(namespace);
  const rootTranslate = useTranslations();
  
  return (key: string, values?: TranslationValues) => {
    if (isDebug) {
      logTranslation(`Looking up: ${key} in ${namespace || 'root'}`);
    }

    try {
      // 1. Try in specified namespace
      try {
        const result = translate(key, values);
        if (isDebug) logTranslation(`Found in namespace ${namespace}`);
        return result;
      } catch (e) {
        if (isDebug) logTranslation(`Not found in namespace ${namespace}, trying root...`);
      }

      // 2. Try in root namespace
      try {
        const result = rootTranslate(key, values);
        if (isDebug) logTranslation(`Found in root namespace`);
        return result;
      } catch (e) {
        if (isDebug) logTranslation(`Not found in root namespace, trying flexible search...`);
      }

      // 3. Try flexible search in all messages
      const messages = (translate as any)._messages || {};
      const rootMessages = (rootTranslate as any)._messages || {};
      
      // Try in namespace messages
      const foundInNamespace = findInMessages(messages, key);
      if (foundInNamespace) {
        if (isDebug) logTranslation(`Found via flexible search in namespace`);
        return applyParams(foundInNamespace, values);
      }

      // Try in root messages
      const foundInRoot = findInMessages(rootMessages, key);
      if (foundInRoot) {
        if (isDebug) logTranslation(`Found via flexible search in root`);
        return applyParams(foundInRoot, values);
      }

      // 4. If nothing found and values has default, use it
      if (values?.default) {
        if (isDebug) logTranslation(`Using provided default: ${values.default}`);
        return values.default;
      }

      // 5. Last resort - format the key
      const fallback = formatTranslationKey(key);
      
      if (isDebug) {
        logTranslation(`No translation found for: ${key}, using: ${fallback}`);
      }
      
      return fallback;

    } catch (error) {
      if (isDebug) {
        logTranslation(`Error processing translation for: ${key}`, error);
      }
      return formatTranslationKey(key);
    }
  };
} 