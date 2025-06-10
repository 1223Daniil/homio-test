#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, promises as fsPromises } from 'fs';
import { glob } from 'glob';
import { OpenAI } from 'openai';
import { extractTranslationKeys } from './extractTranslationKeys.js';
import { TranslationCollector } from './collector.js';
import { TranslationValidator } from './validator.js';
import { TranslationKeyAnalyzer } from './key-analyzer.js';
import { TranslationKeyMigrator } from './key-migration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

interface TranslationStats {
    total: number;
    missing: number;
    added: number;
    files: number;
}

interface TranslationObject {
    [key: string]: string | TranslationObject;
}

interface Translations {
    [key: string]: string | Translations;
}

interface ValidationResult {
    duplicates: string[];
    invalidStructure: string[];
    emptyValues: string[];
}

interface TranslateOptions {
    locale: string;
    dryRun?: boolean;
    filter?: string;
}

interface TranslationOptions {
    batchSize?: number;
    delay?: number;
    context?: string;
}

const program = new Command();

program
    .name('translate')
    .description('CLI to manage translations')
    .version('1.0.0');

const BATCH_SIZE = 50; // Уменьшаем размер батча для большей стабильности

// Добавляем константу с терминологией недвижимости на уровне модуля
const REAL_ESTATE_TERMS: Record<string, string> = {
    'Developer': 'Застройщик',
    'Property': 'Недвижимость',
    'Unit': 'Юнит',
    'Layout': 'Планировка',
    'Floor plan': 'План этажа',
    'Master plan': 'Генеральный план',
    'Amenities': 'Удобства',
    'Investment': 'Инвестиции',
    'Maintenance fee': 'Плата за обслуживание',
    'Down payment': 'Первоначальный взнос',
    'Installment': 'Рассрочка',
    'Off-plan': 'На этапе строительства',
    'Ready to move in': 'Готов к заселению',
    'Under construction': 'В процессе строительства',
    'Handover': 'Сдача в эксплуатацию',
    'Return on investment': 'Доходность инвестиций',
    'Rental yield': 'Арендная доходность',
    'Capital appreciation': 'Прирост капитала',
    'Title deed': 'Свидетельство о праве собственности',
    'Common area': 'Места общего пользования'
};

// Function to flatten nested object with dot notation
function flattenTranslations(obj: Translations, prefix = ''): Map<string, string> {
    const flattened = new Map<string, string>();
    
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
            flattened.set(newKey, value);
        } else if (typeof value === 'object' && value !== null) {
            const nested = flattenTranslations(value as Translations, newKey);
            for (const [nestedKey, nestedValue] of nested.entries()) {
                flattened.set(nestedKey, nestedValue);
            }
        }
    }
    
    return flattened;
}

// Function to validate translations structure
function validateTranslations(translations: Translations): ValidationResult {
    const result: ValidationResult = {
        duplicates: [],
        invalidStructure: [],
        emptyValues: []
    };
    
    // Flatten translations for duplicate checking
    const flattened = flattenTranslations(translations);
    const keys = Array.from(flattened.entries());
    
    // Check for duplicates
    const seen = new Set<string>();
    for (const [key] of keys) {
        if (seen.has(key)) {
            result.duplicates.push(key);
        }
        seen.add(key);
    }
    
    // Check for invalid structure and empty values
    function validateStructure(obj: any, path: string[] = []) {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = [...path, key];
            const fullPath = currentPath.join('.');
            
            if (value === null || value === undefined) {
                result.invalidStructure.push(fullPath);
            } else if (typeof value === 'string' && value.trim() === '') {
                result.emptyValues.push(fullPath);
            } else if (typeof value === 'object') {
                validateStructure(value, currentPath);
            }
        }
    }
    
    validateStructure(translations);
    
    return result;
}

program
    .command('validate')
    .description('Validate translations structure and check for duplicates')
    .action(async () => {
        try {
            const localesDir = join(process.cwd(), 'src/locales');
            const files = await glob('*.json', { cwd: localesDir });
            
            for (const file of files) {
                console.log(`\nValidating ${file}...`);
                const content = readFileSync(join(localesDir, file), 'utf-8');
                const translations = JSON.parse(content);
                
                const validation = validateTranslations(translations);
                
                if (validation.duplicates.length === 0 &&
                    validation.invalidStructure.length === 0 &&
                    validation.emptyValues.length === 0) {
                    console.log('✓ No issues found');
                    continue;
                }
                
                if (validation.duplicates.length > 0) {
                    console.log('\nDuplicate keys found:');
                    validation.duplicates.forEach(key => console.log(`  - ${key}`));
                }
                
                if (validation.invalidStructure.length > 0) {
                    console.log('\nInvalid structure (null or undefined values):');
                    validation.invalidStructure.forEach(key => console.log(`  - ${key}`));
                }
                
                if (validation.emptyValues.length > 0) {
                    console.log('\nEmpty values found:');
                    validation.emptyValues.forEach(key => console.log(`  - ${key}`));
                }
            }
        } catch (error) {
            console.error('Validation failed:', error);
            process.exit(1);
        }
    });

async function scanProject(): Promise<Map<string, Set<string>>> {
    const allKeys = new Map<string, Set<string>>();
    const files = await glob('src/**/*.{ts,tsx}', {
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
    });

    for (const file of files) {
        const keys = await extractTranslationKeys(file);
        for (const key of keys) {
            if (!allKeys.has(file)) {
                allKeys.set(file, new Set());
            }
            allKeys.get(file)?.add(key);
        }
    }

    return allKeys;
}

async function updateTranslations(dryRun: boolean = false): Promise<TranslationStats> {
    const stats: TranslationStats = { total: 0, missing: 0, added: 0, files: 0 };
    const localesDir = join(process.cwd(), 'src/locales');
    
    // Load existing translations
    const baseLocalePath = join(localesDir, 'en.json');
    const targetLocalePath = join(localesDir, 'ru.json');
    
    let enTranslations: TranslationObject = {};
    let ruTranslations: TranslationObject = {};
    
    try {
        enTranslations = JSON.parse(readFileSync(baseLocalePath, 'utf-8'));
        ruTranslations = JSON.parse(readFileSync(targetLocalePath, 'utf-8'));
    } catch (e) {
        console.error('Error loading translation files:', e);
        process.exit(1);
    }

    // Scan for translation keys
    const fileKeys = await scanProject();
    stats.files = fileKeys.size;

    // Collect all unique keys
    const allKeys = new Set<string>();
    for (const keys of fileKeys.values()) {
        keys.forEach(key => allKeys.add(key));
    }
    stats.total = allKeys.size;

    // Find missing keys
    const missingInEn = new Set<string>();
    const missingInRu = new Set<string>();

    for (const key of allKeys) {
        const keyParts = key.split('.');
        let current: any = enTranslations;
        let missing = false;

        // Check in English translations
        for (const part of keyParts) {
            if (!current || typeof current !== 'object') {
                missing = true;
                break;
            }
            current = current[part];
        }
        if (missing || current === undefined) {
            missingInEn.add(key);
        }

        // Check in Russian translations
        current = ruTranslations;
        missing = false;
        for (const part of keyParts) {
            if (!current || typeof current !== 'object') {
                missing = true;
                break;
            }
            current = current[part];
        }
        if (missing || current === undefined) {
            missingInRu.add(key);
        }
    }

    stats.missing = missingInRu.size;

    if (!dryRun) {
        // Add missing keys to translations
        for (const key of missingInEn) {
            setNestedValue(enTranslations, key, key);
            stats.added++;
        }

        for (const key of missingInRu) {
            setNestedValue(ruTranslations, key, key);
            stats.added++;
        }

        // Save updated translations
        writeFileSync(baseLocalePath, JSON.stringify(enTranslations, null, 4), 'utf-8');
        writeFileSync(targetLocalePath, JSON.stringify(ruTranslations, null, 4), 'utf-8');
    }

    return stats;
}

function setNestedValue(obj: TranslationObject, path: string, value: string): void {
    const parts = path.split('.');
    let current: TranslationObject = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
            current[part] = {};
        }
        const next = current[part];
        if (typeof next === 'string') {
            current[part] = {};
        }
        current = current[part] as TranslationObject;
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
}

program
    .command('scan')
    .description('Scan project for missing translation keys')
    .option('-d, --dry-run', 'Only show what would be added without making changes')
    .action(async (options) => {
        console.log('Scanning project for translation keys...');
        const stats = await updateTranslations(options.dryRun || false);
        
        console.log('\nScan Results:');
        console.log(`Files scanned: ${stats.files}`);
        console.log(`Total unique keys found: ${stats.total}`);
        console.log(`Missing translations: ${stats.missing}`);
        
        if (!options.dryRun) {
            console.log(`Keys added: ${stats.added}`);
            console.log('\nTranslation files have been updated.');
        } else {
            console.log('\nDry run - no changes made.');
        }
    });

program
    .command('check')
    .description('Check for missing translations')
    .action(async () => {
        // Implementation needed
    });

// Улучшенная валидация переводов
interface ValidationOptions {
    checkPlaceholders: boolean;
    checkHtmlTags: boolean;
    checkPunctuation: boolean;
    checkCapitalization: boolean;
}

// Переименовываем класс чтобы избежать конфликта
class TranslationContentValidator {
    private readonly options: ValidationOptions;

    constructor(options: Partial<ValidationOptions> = {}) {
        this.options = {
            checkPlaceholders: true,
            checkHtmlTags: true,
            checkPunctuation: true,
            checkCapitalization: true,
            ...options
        };
    }

    validateTranslation(sourceText: string, translatedText: string): string[] {
        const errors: string[] = [];

        // Проверка плейсхолдеров
        if (this.options.checkPlaceholders) {
            const sourcePlaceholders = this.extractPlaceholders(sourceText);
            const translatedPlaceholders = this.extractPlaceholders(translatedText);
            
            const missingPlaceholders = sourcePlaceholders.filter(p => !translatedPlaceholders.includes(p));
            if (missingPlaceholders.length > 0) {
                errors.push(`Missing placeholders: ${missingPlaceholders.join(', ')}`);
            }
        }

        // Проверка HTML тегов
        if (this.options.checkHtmlTags) {
            const sourceTags = this.extractHtmlTags(sourceText);
            const translatedTags = this.extractHtmlTags(translatedText);
            
            const missingTags = sourceTags.filter(t => !translatedTags.includes(t));
            if (missingTags.length > 0) {
                errors.push(`Missing HTML tags: ${missingTags.join(', ')}`);
            }
        }

        // Проверка пунктуации
        if (this.options.checkPunctuation) {
            const sourceEndsWithPunct = /[.!?]$/.test(sourceText);
            const translatedEndsWithPunct = /[.!?]$/.test(translatedText);
            
            if (sourceEndsWithPunct && !translatedEndsWithPunct) {
                errors.push('Missing ending punctuation');
            }
        }

        // Проверка капитализации
        if (this.options.checkCapitalization) {
            const sourceStartsWithUpper = /^[A-Z]/.test(sourceText);
            const translatedStartsWithUpper = /^[A-ZА-Я]/.test(translatedText);
            
            if (sourceStartsWithUpper && !translatedStartsWithUpper) {
                errors.push('Should start with capital letter');
            }
        }

        return errors;
    }

    private extractPlaceholders(text: string): string[] {
        const placeholderRegex = /\{[^}]+\}|\$\{[^}]+\}/g;
        return (text.match(placeholderRegex) || []);
    }

    private extractHtmlTags(text: string): string[] {
        const tagRegex = /<[^>]+>/g;
        return (text.match(tagRegex) || []);
    }
}

// Обновляем функцию translateBatch для использования TranslationContentValidator
async function translateBatch(items: Array<[string, string]>, targetLocale: string, ai: OpenAI): Promise<Map<string, string>> {
    const validator = new TranslationContentValidator();
    const result = new Map<string, string>();
    const maxRetries = 3;

    const systemPrompt = `You are a professional UI/UX translator specializing in real estate and property management interfaces. 
Translate to natural, idiomatic ${targetLocale === 'ru' ? 'Russian' : targetLocale}.
Follow these rules strictly:
1. Preserve all placeholders like {value} or ${'{'}variable}
2. Preserve HTML tags
3. Maintain the same capitalization style
4. Keep the same punctuation
5. Preserve numbers and units
6. Do not translate proper names
7. Use appropriate real estate terminology for the target locale
8. Return translations in the exact same order
9. Use common real estate terminology, for example:
   - "Developer" → "Застройщик"
   - "Property" → "Недвижимость"
   - "Unit" → "Юнит"
   - "Layout" → "Планировка"
   - "Floor plan" → "План этажа"
   - "Master plan" → "Генеральный план"
   - "Amenities" → "Удобства"
   - "Investment" → "Инвестиции"
   - "Maintenance fee" → "Плата за обслуживание"
   - "Down payment" → "Первоначальный взнос"
   - "Installment" → "Рассрочка"`;

    for (const [key, value] of items) {
        let translation: string | undefined;
        let currentTry = 0;

        while (!translation && currentTry < maxRetries) {
            try {
                const response = await ai.chat.completions.create({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Translate this UI element (type: ${getElementType(key)}): ${value}` }
                    ],
                    temperature: 0.1,
                    max_tokens: 200,
                    response_format: { type: 'text' }
                });

                const candidateTranslation = response.choices[0].message.content?.trim();
                
                if (candidateTranslation) {
                    // Валидируем перевод
                    const validationErrors = validator.validateTranslation(value, candidateTranslation);
                    
                    if (validationErrors.length === 0) {
                        translation = candidateTranslation;
                        result.set(key, translation);
                        console.log(`✓ Translated ${key}: "${value}" → "${translation}"`);
                    } else {
                        console.warn(`⚠ Translation validation failed for key ${key}:`, validationErrors);
                        currentTry++;
                    }
                }
            } catch (error) {
                console.error(`✗ Error translating key ${key}:`, error);
                currentTry++;
                await new Promise(resolve => setTimeout(resolve, 1000 * currentTry));
            }
        }

        if (!translation) {
            console.error(`✗ Failed to translate key ${key} after ${maxRetries} attempts`);
            // В случае неудачи сохраняем оригинальное значение
            result.set(key, value);
        }

        // Добавляем небольшую задержку между запросами
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return result;
}

// Helper function to determine UI element type based on key
function getElementType(key: string): string {
    const parts = key.toLowerCase().split('.');
    
    // Check for specific types
    if (parts.includes('title') || parts.includes('header')) return 'Title';
    if (parts.includes('button') || parts.includes('action')) return 'Button';
    if (parts.includes('label') || parts.includes('field')) return 'Field Label';
    if (parts.includes('error') || parts.includes('warning')) return 'Error Message';
    if (parts.includes('description') || parts.includes('info')) return 'Description';
    if (parts.includes('menu') || parts.includes('nav')) return 'Menu Item';
    
    // Default to generic UI element
    return 'UI Element';
}

// Улучшенная структура для управления переводами
interface TranslationBatch {
    items: Array<[string, string]>;
    retries: number;
    maxRetries: number;
}

class TranslationManager {
    private batches: TranslationBatch[] = [];
    private results: Map<string, string> = new Map();
    private currentBatchSize: number;
    private readonly minBatchSize = 5;
    private readonly maxRetries = 3;
    private readonly delayBetweenBatches = 1000; // ms

    constructor(initialBatchSize: number = 30) {
        this.currentBatchSize = initialBatchSize;
    }

    prepareBatches(items: Array<[string, string]>): void {
        this.batches = [];
        for (let i = 0; i < items.length; i += this.currentBatchSize) {
            this.batches.push({
                items: items.slice(i, i + this.currentBatchSize),
                retries: 0,
                maxRetries: this.maxRetries
            });
        }
    }

    async processBatches(ai: OpenAI, targetLocale: string): Promise<Map<string, string>> {
        for (const batch of this.batches) {
            try {
                const translations = await this.processBatchWithRetry(batch, ai, targetLocale);
                for (const [key, value] of translations) {
                    this.results.set(key, value);
                }
                // Добавляем задержку между батчами
                await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
            } catch (error) {
                console.error(`Failed to process batch after ${batch.retries} retries:`, error);
                if (batch.items.length > this.minBatchSize) {
                    // Разбиваем батч на меньшие части и добавляем их обратно в очередь
                    const midPoint = Math.floor(batch.items.length / 2);
                    this.batches.push({
                        items: batch.items.slice(0, midPoint),
                        retries: 0,
                        maxRetries: this.maxRetries
                    });
                    this.batches.push({
                        items: batch.items.slice(midPoint),
                        retries: 0,
                        maxRetries: this.maxRetries
                    });
                }
            }
        }
        return this.results;
    }

    private async processBatchWithRetry(
        batch: TranslationBatch,
        ai: OpenAI,
        targetLocale: string
    ): Promise<Map<string, string>> {
        try {
            return await translateBatch(batch.items, targetLocale, ai);
        } catch (error) {
            batch.retries++;
            if (batch.retries >= batch.maxRetries) {
                throw error;
            }
            // Уменьшаем размер батча при повторной попытке
            this.currentBatchSize = Math.max(this.minBatchSize, Math.floor(this.currentBatchSize * 0.75));
            // Добавляем экспоненциальную задержку между попытками
            await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches * batch.retries));
            return this.processBatchWithRetry(batch, ai, targetLocale);
        }
    }
}

// Обновляем функцию translateFile для использования TranslationManager
async function translateFile(locale: string, dryRun: boolean = false, filter?: string, options: TranslationOptions = {}): Promise<void> {
    const {
        batchSize = BATCH_SIZE,
        delay = 1000,
        context = 'real-estate'
    } = options;

    const localesDir = join(process.cwd(), 'src/locales');
    const sourceFile = join(localesDir, 'en.json');
    const targetFile = join(localesDir, `${locale}.json`);

    if (!existsSync(sourceFile)) {
        console.error('Source file (en.json) not found');
        process.exit(1);
    }

    // First, load and validate source file
    let sourceContent: TranslationObject;
    try {
        const content = readFileSync(sourceFile, 'utf-8');
        sourceContent = JSON.parse(content);
    } catch (e) {
        console.error('Error reading source file:', e);
        process.exit(1);
    }

    // Then load or create target file
    let targetContent: TranslationObject;
    try {
        targetContent = existsSync(targetFile) 
            ? JSON.parse(readFileSync(targetFile, 'utf-8'))
            : {};
    } catch (e) {
        console.error('Error reading target file:', e);
        process.exit(1);
    }

    const baseURL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
    const ai = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: `${baseURL}/v1`
    });

    // Flatten both objects for easier comparison
    const sourceFlat = flattenTranslations(sourceContent);
    const targetFlat = flattenTranslations(targetContent);

    let translated = 0;
    let skipped = 0;
    let total = sourceFlat.size;

    const translationManager = new TranslationManager(batchSize);
    const itemsToTranslate: Array<[string, string]> = [];

    // Собираем все элементы для перевода
    for (const [key, value] of sourceFlat.entries()) {
        if (filter) {
            const keyParts = key.toLowerCase().split('.');
            const filterParts = filter.toLowerCase().split('.');
            if (!keyParts[0].startsWith(filterParts[0])) {
                skipped++;
                continue;
            }
        }

        const targetValue = targetFlat.get(key);
        if (!targetValue || 
            targetValue === key || 
            targetValue === value || 
            targetValue.startsWith('[') ||
            targetValue.trim() === '' ||
            targetValue.includes(key) ||
            value.includes(key)) {
            itemsToTranslate.push([key, value]);
        } else {
            skipped++;
        }
    }

    if (!dryRun && itemsToTranslate.length > 0) {
        console.log(`\nTranslating ${itemsToTranslate.length} items...`);
        translationManager.prepareBatches(itemsToTranslate);
        
        try {
            const translations = await translationManager.processBatches(ai, locale);
            
            // Применяем переводы и сохраняем результаты
            for (const [key, translation] of translations.entries()) {
                setNestedValue(targetContent, key, translation);
                translated++;
            }
            
            // Сохраняем изменения
            writeFileSync(targetFile, JSON.stringify(targetContent, null, 4), 'utf-8');
            
            console.log('\nTranslation completed:');
            console.log(`Total keys: ${total}`);
            console.log(`Translated: ${translated}`);
            console.log(`Skipped: ${skipped}`);
        } catch (error) {
            console.error('Translation process failed:', error);
            process.exit(1);
        }
    } else if (dryRun) {
        console.log('\nDry run completed:');
        console.log(`Would translate ${itemsToTranslate.length} items`);
        console.log(`Would skip ${skipped} items`);
    }
}

program
    .command('translate')
    .description('Translate missing values in locale file')
    .option('-l, --locale <locale>', 'Target locale', 'ru')
    .option('-d, --dry-run', 'Show what would be translated without making changes')
    .option('-f, --filter <pattern>', 'Only translate keys containing this pattern')
    .action(async (options: TranslateOptions) => {
        console.log(`Translating to ${options.locale}...`);
        await translateFile(options.locale, options.dryRun, options.filter);
    });

program
    .command('add')
    .description('Add new translation key to base locale')
    .argument('<key>', 'Translation key (e.g. common.buttons.save)')
    .argument('<value>', 'Translation value')
    .action(async (key: string, value: string) => {
        // Implementation needed
    });

program
    .command('generate-en')
    .description('Generate proper English translations from keys')
    .option('-d, --dry-run', 'Preview changes without saving')
    .option('-f, --filter <pattern>', 'Only process keys matching pattern')
    .action(async (options: { dryRun?: boolean; filter?: string }) => {
        console.log('Generating English translations...');
        
        const enFile = join(process.cwd(), 'src/locales/en.json');
        const translations = JSON.parse(readFileSync(enFile, 'utf8'));
        
        function humanize(key: string): string {
            // Remove common prefixes/namespaces
            const parts = key.split('.');
            const lastPart = parts[parts.length - 1] || '';
            
            // Convert camelCase to spaces
            const withSpaces = lastPart
                .replace(/([A-Z])/g, ' $1')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/\./g, ' ')
                .replace(/_/g, ' ')
                .trim();
                
            // Capitalize first letter of sentences
            let capitalized = withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
            
            // Special handling for UI elements based on context
            const context = parts.slice(0, -1).join('.').toLowerCase();
            if (context.includes('button') || context.includes('action')) {
                capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
            } else if (context.includes('title')) {
                capitalized = capitalized.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
            
            return capitalized;
        }
        
        function processTranslations(obj: any, parentKey = ''): any {
            const result: any = {};
            
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;
                
                // Skip if filter is set and key doesn't match
                if (options.filter && !fullKey.includes(options.filter)) {
                    result[key] = value;
                    continue;
                }
                
                if (typeof value === 'object' && value !== null) {
                    result[key] = processTranslations(value, fullKey);
                } else if (typeof value === 'string') {
                    // Check if value is a key reference or empty
                    if (value === fullKey || value === key || value.trim() === '' || value.includes('${')) {
                        result[key] = humanize(key);
                    } else {
                        result[key] = value;
                    }
                } else {
                    result[key] = value;
                }
            }
            
            return result;
        }
        
        const processed = processTranslations(translations);
        
        if (options.dryRun) {
            console.log('Preview of changes:');
            console.log(JSON.stringify(processed, null, 2));
        } else {
            writeFileSync(enFile, JSON.stringify(processed, null, 2));
            console.log('English translations generated successfully');
        }
    });

program
    .command('find-hardcoded')
    .description('Find hardcoded strings in components')
    .option('-o, --output <file>', 'Output report file', 'hardcoded-strings-report.md')
    .action(async (options) => {
        console.log('Scanning for hardcoded strings...');
        
        const collector = new TranslationCollector(process.cwd());
        await collector.collect();
        
        const hardcodedStrings = collector.getHardcodedStrings();
        
        // Group by file
        const byFile = hardcodedStrings.reduce((acc, item) => {
            if (!acc[item.file]) {
                acc[item.file] = [];
            }
            acc[item.file].push(item);
            return acc;
        }, {} as Record<string, typeof hardcodedStrings>);
        
        // Generate report
        let report = '# Hardcoded Strings Report\n\n';
        report += 'This report lists all potentially hardcoded strings found in the codebase.\n\n';
        
        for (const [file, strings] of Object.entries(byFile)) {
            report += `## ${file}\n\n`;
            strings.forEach(({ line, key, context }) => {
                report += `### Line ${line}\n`;
                report += `- String: \`${key}\`\n`;
                report += `- Context: \`${context}\`\n`;
                report += `- Suggested key: \`${suggestTranslationKey(file, key)}\`\n\n`;
            });
        }
        
        // Write report
        fsPromises.writeFile(options.output, report);
        console.log(`Found ${hardcodedStrings.length} hardcoded strings in ${Object.keys(byFile).length} files`);
        console.log(`Report saved to ${options.output}`);
    });

program
    .command('create-locale')
    .description('Create a new locale file with proper structure')
    .argument('<locale>', 'Locale code (e.g., fr, de, es)')
    .option('-t, --translate', 'Automatically translate strings after creation')
    .option('-s, --structure-only', 'Create structure without translations')
    .option('--batch-size <size>', 'Translation batch size', '30')
    .option('--delay <ms>', 'Delay between batches in ms', '1000')
    .action(async (locale: string, options) => {
        console.log(`Creating new locale: ${locale}`);
        
        const localesDir = join(process.cwd(), 'src/locales');
        const sourceFile = join(localesDir, 'en.json');
        const targetFile = join(localesDir, `${locale}.json`);
        
        if (!existsSync(sourceFile)) {
            console.error('Source file (en.json) not found');
            process.exit(1);
        }
        
        if (existsSync(targetFile) && !options.force) {
            console.error(`Locale file ${locale}.json already exists. Use --force to overwrite.`);
            process.exit(1);
        }
        
        // Load source structure
        const sourceContent = JSON.parse(readFileSync(sourceFile, 'utf-8'));
        
        // Create empty structure
        function createEmptyStructure(obj: any): any {
            const result: any = {};
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'object' && value !== null) {
                    result[key] = createEmptyStructure(value);
                } else {
                    result[key] = options.structureOnly ? '' : value;
                }
            }
            return result;
        }
        
        const newStructure = createEmptyStructure(sourceContent);
        writeFileSync(targetFile, JSON.stringify(newStructure, null, 2));
        
        console.log(`Created ${locale}.json with proper structure`);
        
        if (options.translate) {
            console.log('\nStarting translation...');
            await translateFile(locale, false, undefined, {
                batchSize: parseInt(options.batchSize),
                delay: parseInt(options.delay)
            });
        }
    });

program
    .command('fix-structure')
    .description('Fix structure inconsistencies between locale files')
    .option('-d, --dry-run', 'Show what would be fixed without making changes')
    .action(async (options) => {
        try {
            console.log('Checking translation structure...');
            
            const localesDir = join(process.cwd(), 'src/locales');
            const files = await glob('*.json', { cwd: localesDir });
            
            // Загружаем все файлы локализации
            const locales = new Map<string, any>();
            for (const file of files) {
                const content = JSON.parse(readFileSync(join(localesDir, file), 'utf-8'));
                locales.set(file, content);
            }
            
            // Собираем все ключи из всех файлов
            const allKeys = new Set<string>();
            for (const content of locales.values()) {
                const flat = flattenTranslations(content);
                for (const key of flat.keys()) {
                    allKeys.add(key);
                }
            }
            
            let fixCount = 0;
            
            // Проверяем и исправляем структуру для каждого файла
            for (const [file, content] of locales.entries()) {
                console.log(`\nProcessing ${file}...`);
                const flat = flattenTranslations(content);
                let needsSave = false;
                
                // Добавляем отсутствующие ключи
                for (const key of allKeys) {
                    if (!flat.has(key)) {
                        console.log(`Adding missing key: ${key}`);
                        setNestedValue(content, key, '');
                        needsSave = true;
                        fixCount++;
                    }
                }
                
                // Проверяем на пустые значения и некорректную структуру
                for (const [key, value] of flat.entries()) {
                    if (value === null || value === undefined) {
                        console.log(`Fixing null/undefined value for key: ${key}`);
                        setNestedValue(content, key, '');
                        needsSave = true;
                        fixCount++;
                    }
                }
                
                // Сохраняем изменения
                if (needsSave && !options.dryRun) {
                    writeFileSync(
                        join(localesDir, file),
                        JSON.stringify(content, null, 2),
                        'utf-8'
                    );
                    console.log(`Saved changes to ${file}`);
                }
            }
            
            if (fixCount > 0) {
                if (options.dryRun) {
                    console.log(`\nWould fix ${fixCount} issues (dry run)`);
                } else {
                    console.log(`\nFixed ${fixCount} issues`);
                }
            } else {
                console.log('\nNo structure issues found');
            }
            
        } catch (error) {
            console.error('Failed to fix structure:', error);
            process.exit(1);
        }
    });

// Helper function to suggest translation key based on file path and string
function suggestTranslationKey(file: string, str: string): string {
    // Remove src/ and file extension
    const pathParts = file.replace(/^src\//, '').replace(/\.[^/.]+$/, '').split('/');
    
    // Convert string to camelCase
    const key = str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '');
    
    // Build key based on path
    let namespace = '';
    if (pathParts[0] === 'components') {
        namespace = `Components.${pathParts[1]}`;
    } else if (pathParts[0] === 'pages') {
        namespace = `Pages.${pathParts[1]}`;
    } else {
        namespace = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);
    }
    
    return `${namespace}.${key}`;
}

program
    .command('analyze-keys')
    .description('Analyze translation key structure and suggest improvements')
    .option('-o, --output <file>', 'Output report file', 'translation-keys-report.md')
    .action(async (options) => {
        console.log('Analyzing translation keys...');
        
        const analyzer = new TranslationKeyAnalyzer(process.cwd());
        await analyzer.analyze();
        
        const analyses = analyzer.getAnalyses();
        const issuesCount = analyses.filter(a => a.issues.length > 0).length;
        
        console.log(`Found ${issuesCount} keys with potential issues`);
        
        // Generate and save report
        const report = analyzer.generateReport();
        fsPromises.writeFile(options.output, report);
        console.log(`Report saved to ${options.output}`);
    });

const MIGRATION_RULES = [
    // Нормализация основных секций
    {
        pattern: /^([a-z]+)\./i,
        replacement: (_: string, section: string): string => `${section.charAt(0).toUpperCase()}${section.slice(1)}.`
    },
    
    // Перемещение общих действий в Common.actions
    {
        pattern: /^(?!Common\.).*\.(save|cancel|delete|edit|create|update|add|back|next|retry|apply|confirm|refresh|submit|view|close)$/i,
        replacement: (_: string, action: string): string => `Common.actions.${action.toLowerCase()}`
    },
    
    // Перемещение общих меток в Common.labels
    {
        pattern: /^(?!Common\.).*\.(name|email|phone|address|description|title|type|status|date|price|area|floor|untitled|loading|amount|deposit)$/i,
        replacement: (_: string, label: string): string => `Common.labels.${label.toLowerCase()}`
    },
    
    // Нормализация сообщений об успехе/ошибке
    {
        pattern: /^.*\.(success|error)\.(create|update|delete|fetch|save|load)$/i,
        replacement: (_: string, type: string, action: string): string => `Common.messages.${type}.${action}`
    },
    
    // Нормализация валидационных сообщений
    {
        pattern: /^.*\.validation\.(required|invalid|tooLong|tooShort|invalidEmail|invalidPhone|invalidUrl|forbidden|notFound)$/i,
        replacement: (_: string, rule: string): string => `Common.validation.${rule}`
    },
    
    // Нормализация статусов недвижимости
    {
        pattern: /^.*\.status\.(active|inactive|draft|planning|construction|completed|published|archived|available|reserved|sold)$/i,
        replacement: (_: string, status: string): string => `Common.status.${status}`
    },
    
    // Нормализация полей форм
    {
        pattern: /^Forms\.([^.]+)$/i,
        replacement: (_: string, field: string): string => `Forms.fields.${field.toLowerCase()}.label`
    },
    
    // Нормализация структуры проектов
    {
        pattern: /^Projects\.(sections|details|info)\.([^.]+)\.(title|description)$/i,
        replacement: (_: string, category: string, section: string, type: string): string => 
            `Projects.${category}.${section}.${type}`
    },
    
    // Нормализация типов недвижимости
    {
        pattern: /^.*\.types\.(residential|commercial|industrial|mixed|sale|rent)$/i,
        replacement: (_: string, type: string): string => `RealEstate.types.${type}`
    },
    
    // Нормализация локации
    {
        pattern: /^Location\.(address|country|city|district|beachDistance|centerDistance)$/i,
        replacement: (_: string, field: string): string => `Location.fields.${field}.label`
    },
    
    // Нормализация удобств
    {
        pattern: /^Amenities\.(title|description|list|category)$/i,
        replacement: (_: string, field: string): string => `Amenities.${field}`
    },
    
    // Нормализация юнитов
    {
        pattern: /^Units\.(info|details|parameters)\.([^.]+)$/i,
        replacement: (_: string, category: string, field: string): string => `Units.${category}.${field}`
    },
    
    // Нормализация застройщиков
    {
        pattern: /^Developers\.(info|stats|projects)\.([^.]+)$/i,
        replacement: (_: string, category: string, field: string): string => `Developers.${category}.${field}`
    },
    
    // Нормализация платежей и цен
    {
        pattern: /^.*\.(price|payment|installment|deposit)\.([^.]+)$/i,
        replacement: (_: string, category: string, field: string): string => `Payments.${category}.${field}`
    },
    
    // Нормализация динамических ключей
    {
        pattern: /\${([^}]+)}/g,
        replacement: (_: string, variable: string): string => `{${variable}}`
    }
];

program
    .command('migrate-keys')
    .description('Migrate translation keys to a consistent format')
    .option('--dry-run [boolean]', 'Show what would be migrated without making changes', false)
    .option('-p, --pattern <pattern>', 'Only migrate keys matching pattern')
    .option('--check-structure [boolean]', 'Check and ensure proper structure', true)
    .action(async (options) => {
        console.log('Starting translation keys migration...');
        console.log(`Dry run: ${options.dryRun}`);
        console.log(`Check structure: ${options.checkStructure}`);
        
        const isDryRun = options.dryRun === 'true' || options.dryRun === true;
        const migrator = new TranslationKeyMigrator(process.cwd(), isDryRun);
        
        try {
            // Step 1: Ensure proper structure if requested
            if (options.checkStructure) {
                console.log('Checking and ensuring proper structure...');
                const locales = ['en', 'ru'];
                
                for (const locale of locales) {
                    const filePath = join(process.cwd(), 'src/locales', `${locale}.json`);
                    console.log(`Processing ${locale}.json...`);
                    
                    const content = JSON.parse(await fsPromises.readFile(filePath, 'utf-8'));
                    const structuredContent = await migrator.ensureStructure(content);
                    
                    if (!isDryRun) {
                        await fsPromises.writeFile(
                            filePath, 
                            JSON.stringify(structuredContent, null, 2)
                        );
                        console.log(`Structure updated for ${locale}.json`);
                    } else {
                        console.log(`Would update structure for ${locale}.json (dry run)`);
                    }
                }
            }
            
            // Step 2: Generate and apply migration rules
            console.log('\nGenerating migration mappings...');
            await migrator.generateMappings(MIGRATION_RULES);
            
            // Step 3: Perform migration
            console.log('Applying migrations...');
            const results = await migrator.migrate();
            
            // Step 4: Output results
            console.log('\nMigration completed!');
            console.log(`Files processed: ${results.length}`);
            console.log('Check translation-migration-report.md for details');
            
        } catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    });

// Добавляем утилиты для повторных попыток
async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        maxRetries?: number;
        delay?: number;
        onRetry?: (error: Error, attempt: number) => void;
        name?: string;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        delay = 1000,
        onRetry = (error, attempt) => console.log(`Retry attempt ${attempt} after error:`, error.message),
        name = 'operation'
    } = options;

    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) break;
            
            onRetry(lastError, attempt);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    
    throw new Error(`${name} failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

// Обновляем функцию init-translations с улучшенной обработкой ошибок
program
    .command('init-translations')
    .description('Initialize translations from scratch')
    .option('-l, --languages <languages>', 'Comma-separated list of language codes', 'en,ru')
    .option('--force', 'Force regeneration of existing files')
    .option('--retry-count <number>', 'Number of retries for failed operations', '3')
    .option('--retry-delay <number>', 'Delay between retries in milliseconds', '2000')
    .option('--batch-size <number>', 'Translation batch size', '30')
    .option('--skip-validation', 'Skip final validation', false)
    .action(async (options) => {
        const languages = options.languages.split(',');
        const retryCount = parseInt(options.retryCount);
        const retryDelay = parseInt(options.retryDelay);
        const batchSize = parseInt(options.batchSize);

        console.log('Starting translation initialization process...');
        console.log(`Languages to process: ${languages.join(', ')}`);
        console.log(`Retry settings: ${retryCount} attempts with ${retryDelay}ms delay`);
        console.log(`Batch size: ${batchSize}`);

        try {
            // 1. Поиск хардкодных строк
            const hardcodedStrings = await withRetry(
                async () => {
                    console.log('\n1. Finding hardcoded strings...');
                    const collector = new TranslationCollector(process.cwd());
                    await collector.collect();
                    const strings = collector.getHardcodedStrings();
                    console.log(`Found ${strings.length} hardcoded strings`);
                    return strings;
                },
                { maxRetries: retryCount, delay: retryDelay, name: 'Hardcoded strings collection' }
            );
            
            // 2. Анализ и стандартизация ключей
            await withRetry(
                async () => {
                    console.log('\n2. Analyzing and standardizing keys...');
                    const analyzer = new TranslationKeyAnalyzer(process.cwd());
                    await analyzer.analyze();
                    console.log('Keys analysis completed');
                },
                { maxRetries: retryCount, delay: retryDelay, name: 'Keys analysis' }
            );
            
            // 3. Миграция ключей
            await withRetry(
                async () => {
                    console.log('\n3. Migrating keys to standard format...');
                    const migrator = new TranslationKeyMigrator(process.cwd(), false);
                    await migrator.generateMappings(MIGRATION_RULES);
                    await migrator.migrate();
                    console.log('Keys migration completed');
                },
                { maxRetries: retryCount, delay: retryDelay, name: 'Keys migration' }
            );

            // 4. Генерация базовой английской локали
            await withRetry(
                async () => {
                    console.log('\n4. Generating English locale...');
                    const enFile = join(process.cwd(), 'src/locales/en.json');
                    if (options.force || !existsSync(enFile)) {
                        await program.parseAsync(['generate-en']);
                        console.log('English locale generated successfully');
                    } else {
                        console.log('English locale already exists, skipping generation');
                    }
                },
                { maxRetries: retryCount, delay: retryDelay, name: 'English locale generation' }
            );

            // 5. Создание и перевод других локалей
            for (const lang of languages) {
                if (lang === 'en') continue;
                
                await withRetry(
                    async () => {
                        console.log(`\n5. Creating and translating ${lang} locale...`);
                        const langFile = join(process.cwd(), `src/locales/${lang}.json`);
                        
                        if (options.force || !existsSync(langFile)) {
                            // Создаем локаль
                            await program.parseAsync(['create-locale', lang, '--structure-only']);
                            console.log(`Created structure for ${lang} locale`);
                            
                            // Переводим
                            await translateFile(lang, false, undefined, {
                                batchSize: batchSize,
                                delay: retryDelay,
                                context: 'real-estate'
                            });
                            console.log(`Translated ${lang} locale`);
                        } else {
                            console.log(`${lang} locale already exists, skipping`);
                        }
                    },
                    { 
                        maxRetries: retryCount, 
                        delay: retryDelay,
                        name: `${lang} locale processing`,
                        onRetry: (error, attempt) => {
                            console.log(`\nRetrying ${lang} locale processing (attempt ${attempt})...`);
                            console.log(`Previous error: ${error.message}`);
                        }
                    }
                );
                
                // Добавляем паузу между языками
                if (languages.indexOf(lang) < languages.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            // 6. Финальная валидация и исправление структуры
            if (!options.skipValidation) {
                await withRetry(
                    async () => {
                        console.log('\n6. Validating and fixing structure...');
                        
                        // Используем новые функции вместо вызова команд
                        await fixStructure(false);
                        console.log('Structure validation and fixes completed');
                        
                        // Проверяем качество переводов
                        for (const lang of languages) {
                            if (lang === 'en') continue;
                            console.log(`\nChecking quality for ${lang}...`);
                            await checkQuality(lang, true);
                        }
                    },
                    { maxRetries: retryCount, delay: retryDelay, name: 'Final validation' }
                );
            }

            console.log('\nTranslation initialization completed successfully!');
            
        } catch (error) {
            console.error('\nTranslation initialization failed:');
            console.error(error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// Добавляем вспомогательные функции перед определением команд
async function fixStructure(dryRun: boolean = false): Promise<void> {
    try {
        console.log('Checking translation structure...');
        
        const localesDir = join(process.cwd(), 'src/locales');
        const files = await glob('*.json', { cwd: localesDir });
        
        // Загружаем все файлы локализации
        const locales = new Map<string, any>();
        for (const file of files) {
            const content = JSON.parse(readFileSync(join(localesDir, file), 'utf-8'));
            locales.set(file, content);
        }
        
        // Собираем все ключи из всех файлов
        const allKeys = new Set<string>();
        for (const content of locales.values()) {
            const flat = flattenTranslations(content);
            for (const key of flat.keys()) {
                allKeys.add(key);
            }
        }
        
        let fixCount = 0;
        
        // Проверяем и исправляем структуру для каждого файла
        for (const [file, content] of locales.entries()) {
            console.log(`\nProcessing ${file}...`);
            const flat = flattenTranslations(content);
            let needsSave = false;
            
            // Добавляем отсутствующие ключи
            for (const key of allKeys) {
                if (!flat.has(key)) {
                    console.log(`Adding missing key: ${key}`);
                    setNestedValue(content, key, '');
                    needsSave = true;
                    fixCount++;
                }
            }
            
            // Проверяем на пустые значения и некорректную структуру
            for (const [key, value] of flat.entries()) {
                if (value === null || value === undefined) {
                    console.log(`Fixing null/undefined value for key: ${key}`);
                    setNestedValue(content, key, '');
                    needsSave = true;
                    fixCount++;
                }
            }
            
            // Сохраняем изменения
            if (needsSave && !dryRun) {
                writeFileSync(
                    join(localesDir, file),
                    JSON.stringify(content, null, 2),
                    'utf-8'
                );
                console.log(`Saved changes to ${file}`);
            }
        }
        
        if (fixCount > 0) {
            if (dryRun) {
                console.log(`\nWould fix ${fixCount} issues (dry run)`);
            } else {
                console.log(`\nFixed ${fixCount} issues`);
            }
        } else {
            console.log('\nNo structure issues found');
        }
        
    } catch (error) {
        console.error('Failed to fix structure:', error);
        throw error;
    }
}

async function checkQuality(locale: string, fix: boolean = false): Promise<void> {
    try {
        console.log(`Checking translation quality for ${locale}...`);
        
        const localesDir = join(process.cwd(), 'src/locales');
        const sourceFile = join(localesDir, 'en.json');
        const targetFile = join(localesDir, `${locale}.json`);
        
        if (!existsSync(sourceFile) || !existsSync(targetFile)) {
            throw new Error('Source or target file not found');
        }
        
        const source = JSON.parse(readFileSync(sourceFile, 'utf-8'));
        const target = JSON.parse(readFileSync(targetFile, 'utf-8'));
        
        const sourceFlat = flattenTranslations(source);
        const targetFlat = flattenTranslations(target);
        
        const validator = new TranslationContentValidator();
        let fixedCount = 0;
        
        for (const [key, sourceValue] of sourceFlat.entries()) {
            const targetValue = targetFlat.get(key);
            if (!targetValue) continue;
            
            const errors = validator.validateTranslation(sourceValue, targetValue);
            
            if (errors.length > 0) {
                console.log(`\nIssues found for key: ${key}`);
                console.log(`Source: "${sourceValue}"`);
                console.log(`Target: "${targetValue}"`);
                errors.forEach(error => console.log(`- ${error}`));
                
                if (fix) {
                    // Применяем автоматические исправления
                    let fixedValue = targetValue;
                    
                    // Исправляем пунктуацию
                    if (errors.includes('Missing ending punctuation')) {
                        const punct = sourceValue.match(/[.!?]$/)?.[0];
                        if (punct) {
                            fixedValue = fixedValue.replace(/[.!?]?$/, punct);
                            fixedCount++;
                        }
                    }
                    
                    // Исправляем капитализацию
                    if (errors.includes('Should start with capital letter')) {
                        fixedValue = fixedValue.charAt(0).toUpperCase() + fixedValue.slice(1);
                        fixedCount++;
                    }
                    
                    if (fixedValue !== targetValue) {
                        targetFlat.set(key, fixedValue);
                        console.log(`✓ Fixed: "${fixedValue}"`);
                    }
                }
            }
        }
        
        if (fix && fixedCount > 0) {
            // Сохраняем исправления
            const fixedContent = {};
            for (const [key, value] of targetFlat.entries()) {
                setNestedValue(fixedContent, key, value);
            }
            
            writeFileSync(targetFile, JSON.stringify(fixedContent, null, 2));
            console.log(`\nFixed ${fixedCount} issues`);
        }
        
    } catch (error) {
        console.error('Quality check failed:', error);
        throw error;
    }
}

program.parse(process.argv);