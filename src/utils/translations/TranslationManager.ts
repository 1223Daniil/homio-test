import { OpenAI } from 'openai';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  TranslationError,
  ValidationRules,
  CacheOptions,
  ApiConfig,
  TranslationKey,
  TranslationValue,
  ValidationResult,
  DEFAULT_VALIDATION_RULES,
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_API_CONFIG
} from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TranslationOptions {
    baseLocale?: string;
    targetLocales?: string[];
    openAiKey?: string;
    validationRules?: Partial<ValidationRules>;
    cacheOptions?: Partial<CacheOptions>;
    apiConfig?: Partial<ApiConfig>;
}

export class TranslationManager {
    private baseLocale: string;
    private targetLocales: string[];
    private translations: Record<string, any> = {};
    private ai: OpenAI;
    private validationRules: ValidationRules;
    private cacheOptions: CacheOptions;
    private apiConfig: ApiConfig;
    private translationCache: Map<string, TranslationValue> = new Map();
    private lastApiCall: number = 0;

    constructor(options: TranslationOptions = {}) {
        this.baseLocale = options.baseLocale || 'en';
        this.targetLocales = options.targetLocales || ['ru'];
        this.validationRules = { ...DEFAULT_VALIDATION_RULES, ...options.validationRules };
        this.cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options.cacheOptions };
        this.apiConfig = { ...DEFAULT_API_CONFIG, ...options.apiConfig };

        this.ai = new OpenAI({
            apiKey: options.openAiKey || process.env.DEEPSEEK_API_KEY,
            baseURL: this.apiConfig.baseUrl
        });

        this.loadTranslations();
        this.startCacheCleanup();
    }

    private startCacheCleanup(): void {
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.translationCache.entries()) {
                if (now - value.lastUpdated.getTime() > this.cacheOptions.ttl) {
                    this.translationCache.delete(key);
                }
            }
        }, this.cacheOptions.ttl);
    }

    private async validateTranslation(key: string, value: string): Promise<ValidationResult> {
        const errors: ValidationResult['errors'] = [];

        // Check length
        if (value.length > this.validationRules.maxLength) {
            errors.push({
                key,
                error: `Translation exceeds maximum length of ${this.validationRules.maxLength} characters`
            });
        }

        // Check HTML
        if (!this.validationRules.allowHtml && /<[^>]+>/g.test(value)) {
            errors.push({
                key,
                error: 'HTML tags are not allowed in translations'
            });
        }

        // Check patterns
        for (const [patternName, pattern] of Object.entries(this.validationRules.patterns)) {
            if (key.includes(patternName) && !pattern.test(value)) {
                errors.push({
                    key,
                    error: `Value does not match ${patternName} pattern`
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private async rateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCall;
        const minInterval = 1000 / this.apiConfig.rateLimit;

        if (timeSinceLastCall < minInterval) {
            await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastCall));
        }

        this.lastApiCall = Date.now();
    }

    private async translateWithRetry(text: string, context: string = ''): Promise<string> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.apiConfig.retryAttempts; attempt++) {
            try {
                await this.rateLimit();
                const result = await this.translateText(text, context);
                const validation = await this.validateTranslation(context, result);

                if (!validation.isValid) {
                    throw new TranslationError(
                        'Translation validation failed',
                        context,
                        this.targetLocales[0],
                        { validation }
                    );
                }

                return result;
            } catch (error) {
                lastError = error as Error;
                if (attempt < this.apiConfig.retryAttempts) {
                    await new Promise(resolve => 
                        setTimeout(resolve, Math.pow(2, attempt) * 1000)
                    );
                }
            }
        }

        throw lastError || new Error('Translation failed after all retries');
    }

    private loadTranslations(): void {
        const localesDir = join(process.cwd(), 'src/locales');
        
        try {
            // Ensure locales directory exists
            if (!existsSync(localesDir)) {
                mkdirSync(localesDir, { recursive: true });
            }

            // Load or create base locale
            const baseLocalePath = join(localesDir, `${this.baseLocale}.json`);
            if (!existsSync(baseLocalePath)) {
                console.log(`Base locale file ${this.baseLocale}.json not found, creating empty`);
                writeFileSync(baseLocalePath, '{}', 'utf-8');
                this.translations[this.baseLocale] = {};
            } else {
                const baseContent = readFileSync(baseLocalePath, 'utf-8');
                this.translations[this.baseLocale] = JSON.parse(baseContent);
            }

            // Load target locales
            for (const locale of this.targetLocales) {
                try {
                    const content = readFileSync(
                        join(localesDir, `${locale}.json`),
                        'utf-8'
                    );
                    this.translations[locale] = JSON.parse(content);
                } catch (e) {
                    console.warn(`No translation file found for ${locale}, creating empty`);
                    this.translations[locale] = {};
                }
            }
        } catch (e) {
            console.error('Error loading translations:', e);
            throw e;
        }
    }

    private async translateText(text: string, context: string = ''): Promise<string> {
        const cacheKey = `${text}:${context}`;
        const cached = this.translationCache.get(cacheKey);
        
        if (cached && Date.now() - cached.lastUpdated.getTime() < this.cacheOptions.ttl) {
            return cached.value;
        }

        try {
            const prompt = this.createTranslationPrompt(text, context);
            const completion = await this.ai.chat.completions.create({
                model: 'deepseek-chat',
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are a professional translator. Translate the given text keeping the same meaning and style. Return only the translation without any additional text.' 
                    },
                    { 
                        role: 'user', 
                        content: prompt 
                    }
                ],
                temperature: 0.3,
            });

            const translation = completion.choices[0].message.content?.trim() || text;
            
            if (this.translationCache.size >= this.cacheOptions.maxSize) {
                // Remove oldest entry
                const oldestKey = this.translationCache.keys().next().value;
                this.translationCache.delete(oldestKey);
            }

            this.translationCache.set(cacheKey, {
                value: translation,
                locale: this.targetLocales[0],
                lastUpdated: new Date(),
                context: context ? { context } : undefined
            });

            return translation;
        } catch (error) {
            throw new TranslationError(
                'Translation API error',
                text,
                this.targetLocales[0],
                { originalError: error }
            );
        }
    }

    private createTranslationPrompt(text: string, context: string): string {
        let prompt = `Translate the following text from ${this.baseLocale} to ${this.targetLocales[0]}:\n\n${text}`;
        
        if (context) {
            prompt += `\n\nContext: ${context}`;
        }
        
        return prompt;
    }

    public async findMissingTranslations(): Promise<Record<string, string[]>> {
        const missing: Record<string, string[]> = {};
        
        for (const locale of this.targetLocales) {
            missing[locale] = [];
            this.findMissingKeys(
                this.translations[this.baseLocale],
                this.translations[locale],
                '',
                missing[locale]
            );
        }
        
        return missing;
    }

    private findMissingKeys(
        base: any,
        target: any,
        prefix: string,
        missing: string[]
    ): void {
        for (const key of Object.keys(base)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof base[key] === 'object' && base[key] !== null) {
                if (!target[key] || typeof target[key] !== 'object') {
                    missing.push(fullKey);
                } else {
                    this.findMissingKeys(base[key], target[key], fullKey, missing);
                }
            } else if (!target || !(key in target)) {
                missing.push(fullKey);
            }
        }
    }

    public async translateMissing(): Promise<void> {
        const missing = await this.findMissingTranslations();
        
        for (const locale of this.targetLocales) {
            console.log(`Translating missing keys for ${locale}...`);
            const keys = missing[locale];
            
            for (const key of keys) {
                const value = this.getValueByPath(this.translations[this.baseLocale], key);
                if (typeof value === 'string') {
                    const context = this.getTranslationContext(key);
                    const translation = await this.translateText(value, context);
                    this.setValueByPath(this.translations[locale], key, translation);
                    console.log(`Translated ${key}: ${value} -> ${translation}`);
                }
            }
            
            // Save translations after processing each locale
            this.saveTranslations(locale);
        }
    }

    private getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((curr, key) => curr && curr[key], obj);
    }

    private setValueByPath(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        const target = keys.reduce((curr, key) => {
            if (!curr[key]) curr[key] = {};
            return curr[key];
        }, obj);
        target[lastKey] = value;
    }

    private getTranslationContext(key: string): string {
        const parts = key.split('.');
        if (parts.length <= 1) return '';

        const parentKey = parts.slice(0, -1).join('.');
        const parentValue = this.getValueByPath(this.translations[this.baseLocale], parentKey);
        
        return JSON.stringify(parentValue);
    }

    private saveTranslations(locale: string): void {
        const localesDir = join(process.cwd(), 'src/locales');
        const filePath = join(localesDir, `${locale}.json`);
        
        try {
            writeFileSync(
                filePath,
                JSON.stringify(this.translations[locale], null, 4),
                'utf-8'
            );
            console.log(`Saved translations for ${locale}`);
        } catch (e) {
            console.error(`Error saving translations for ${locale}:`, e);
        }
    }
} 