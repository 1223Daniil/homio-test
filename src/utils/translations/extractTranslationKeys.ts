import { readFileSync } from 'fs';

const TRANSLATION_PATTERNS = [
    // t function calls
    /\bt\(['"]([^'"]+)['"]\)/g,                    // t('key') or t("key")
    /\bt\(`([^`]+)`\)/g,                           // t(`key`)
    
    // useTranslation hook usage
    /useTranslation\(['"]([^'"]+)['"]\)/g,         // useTranslation('namespace')
    
    // Trans component
    /<Trans[^>]*i18nKey=["']([^"']+)["'][^>]*>/g,  // <Trans i18nKey="key" />
    
    // Dynamic translations
    /\bt\(`([^`$]*\${[^}]+}[^`]*)`\)/g,           // t(`Prefix.dynamic.suffix`)
    
    // Namespace translations
    /\['([^']+)'\]\.t\(['"]([^'"]+)['"]\)/g,      // ['namespace'].t('key')
    /\["([^"]+)"\]\.t\(['"]([^'"]+)['"]\)/g,      // ["namespace"].t('key')
];

export async function extractTranslationKeys(filePath: string): Promise<string[]> {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const keys: Set<string> = new Set();

        for (const pattern of TRANSLATION_PATTERNS) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                // For namespace.t() patterns, combine namespace and key
                if (pattern.source.includes('namespace')) {
                    const namespace = match[1];
                    const key = match[2];
                    keys.add(`${namespace}:${key}`);
                } else {
                    keys.add(match[1]);
                }
            }
        }

        // Handle dynamic keys with template literals
        const dynamicMatches = Array.from(content.matchAll(/\bt\(`([^`]+)`\)/g));
        for (const match of dynamicMatches) {
            const key = match[1];
            if (key.includes('${')) {
                // Extract the static parts of the key
                const staticParts = key.split(/\${[^}]+}/);
                if (staticParts.length > 1) {
                    // Add both the full template and static parts
                    keys.add(key);
                    staticParts.forEach(part => part.trim() && keys.add(part.trim()));
                }
            }
        }

        return Array.from(keys);
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        return [];
    }
} 