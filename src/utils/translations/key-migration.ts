import { promises as fs } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface KeyMapping {
    oldKey: string;
    newKey: string;
}

interface MigrationResult {
    file: string;
    replacements: Array<{
        oldKey: string;
        newKey: string;
        line: number;
    }>;
}

export class TranslationKeyMigrator {
    private readonly cwd: string;
    private readonly mappings: KeyMapping[] = [];
    private readonly dryRun: boolean;

    constructor(cwd: string, dryRun = true) {
        this.cwd = cwd;
        this.dryRun = dryRun;
    }

    /**
     * Добавить маппинг для миграции ключа
     */
    addMapping(oldKey: string, newKey: string) {
        this.mappings.push({ oldKey, newKey });
    }

    /**
     * Автоматически генерировать маппинги на основе правил
     */
    async generateMappings(rules: Array<{
        pattern: RegExp;
        replacement: (match: string, ...args: any[]) => string;
    }>) {
        const localeFile = join(this.cwd, 'src/locales/en.json');
        const content = JSON.parse(await fs.readFile(localeFile, 'utf-8'));
        
        const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
            return Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
                const prefixedKey = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    Object.assign(acc, flattenObject(obj[key], prefixedKey));
                } else {
                    acc[prefixedKey] = obj[key];
                }
                return acc;
            }, {});
        };

        const keys = Object.keys(flattenObject(content));
        const processedKeys = new Set<string>();
        
        // Рекурсивное применение правил
        const applyRules = (key: string): string => {
            let newKey = key;
            let hasChanges = true;
            
            while (hasChanges) {
                hasChanges = false;
                for (const rule of rules) {
                    if (rule.pattern.test(newKey)) {
                        const result = newKey.replace(rule.pattern, rule.replacement);
                        if (result !== newKey) {
                            newKey = result;
                            hasChanges = true;
                        }
                    }
                }
            }
            
            return newKey;
        };
        
        for (const key of keys) {
            if (!processedKeys.has(key)) {
                const newKey = applyRules(key);
                if (newKey !== key) {
                    this.addMapping(key, newKey);
                }
                processedKeys.add(key);
            }
        }
    }

    /**
     * Найти все файлы, где используются ключи переводов
     */
    private async findFiles(): Promise<string[]> {
        const files = await glob('src/**/*.{ts,tsx}', {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
            cwd: this.cwd
        });
        return files;
    }

    /**
     * Ensure proper structure in locale files
     */
    public async ensureStructure(content: any): Promise<any> {
        const BASE_STRUCTURE = {
            Common: {
                actions: {},
                labels: {},
                messages: {
                    success: {},
                    error: {}
                },
                validation: {},
                status: {},
                types: {}
            },
            Forms: {
                fields: {}
            },
            Projects: {
                sections: {},
                types: {},
                status: {}
            },
            Location: {
                fields: {}
            },
            Auth: {
                actions: {},
                messages: {}
            }
        };

        // Helper to ensure object has required structure
        const ensureObjectStructure = (obj: any, structure: any): any => {
            const result = { ...obj };
            
            for (const [key, value] of Object.entries(structure)) {
                if (typeof value === 'object' && value !== null) {
                    result[key] = result[key] || {};
                    result[key] = ensureObjectStructure(result[key], value);
                } else if (!(key in result)) {
                    result[key] = value;
                }
            }
            
            return result;
        };

        return ensureObjectStructure(content, BASE_STRUCTURE);
    }

    /**
     * Update locale file with new keys
     */
    private async updateLocaleFile(locale: string): Promise<void> {
        const filePath = join(this.cwd, 'src/locales', `${locale}.json`);
        const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        // Ensure proper structure
        const structuredContent = await this.ensureStructure(content);

        const updateKeys = (obj: any): any => {
            const newObj: any = {};
            
            for (const [key, value] of Object.entries(obj)) {
                let newKey = key;
                for (const mapping of this.mappings) {
                    if (mapping.oldKey === key) {
                        newKey = mapping.newKey;
                        break;
                    }
                }
                
                if (typeof value === 'object' && value !== null) {
                    newObj[newKey] = updateKeys(value);
                } else {
                    newObj[newKey] = value;
                }
            }
            
            return newObj;
        };

        const updatedContent = updateKeys(structuredContent);

        if (!this.dryRun) {
            await fs.writeFile(
                filePath,
                JSON.stringify(updatedContent, null, 2)
            );
        }
    }

    /**
     * Обновить использование ключей в коде
     */
    private async updateSourceFile(file: string): Promise<MigrationResult> {
        const content = await fs.readFile(join(this.cwd, file), 'utf-8');
        const lines = content.split('\n');
        const replacements: MigrationResult['replacements'] = [];

        let updatedContent = content;
        for (const mapping of this.mappings) {
            // Расширенный список паттернов
            const patterns = [
                // Базовые паттерны
                `'{mapping.oldKey}'`,
                `"{mapping.oldKey}"`,
                `\`${mapping.oldKey}\``,
                // Функции перевода
                `t('{mapping.oldKey}')`,
                `t("{mapping.oldKey}")`,
                `useTranslation('{mapping.oldKey}')`,
                `useTranslation("{mapping.oldKey}")`,
                `translate('{mapping.oldKey}')`,
                `translate("{mapping.oldKey}")`,
                `i18n.t('{mapping.oldKey}')`,
                `i18n.t("{mapping.oldKey}")`,
                // Компоненты перевода
                `<Trans i18nKey="{mapping.oldKey}"`,
                `<Trans i18nKey='{mapping.oldKey}'`,
                // Динамические ключи
                `\${{mapping.oldKey}}`,
                `{{mapping.oldKey}}`,
                // Объекты конфигурации
                `key: '{mapping.oldKey}'`,
                `key: "{mapping.oldKey}"`,
                `i18nKey: '{mapping.oldKey}'`,
                `i18nKey: "{mapping.oldKey}"`,
            ];

            for (const pattern of patterns) {
                if (updatedContent.includes(pattern)) {
                    const lineNumber = lines.findIndex(line => line.includes(pattern));
                    if (lineNumber !== -1) {
                        replacements.push({
                            oldKey: mapping.oldKey,
                            newKey: mapping.newKey,
                            line: lineNumber + 1
                        });
                    }

                    const newPattern = pattern.replace(mapping.oldKey, mapping.newKey);
                    updatedContent = updatedContent.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPattern);
                }
            }
        }

        if (!this.dryRun && replacements.length > 0) {
            // Сохраняем бэкап
            await fs.writeFile(
                `${join(this.cwd, file)}.backup-${Date.now()}`,
                content
            );
            // Сохраняем обновленный файл
            await fs.writeFile(
                join(this.cwd, file),
                updatedContent
            );
        }

        return {
            file,
            replacements
        };
    }

    /**
     * Запустить миграцию
     */
    async migrate(): Promise<MigrationResult[]> {
        console.log(`Starting migration (${this.dryRun ? 'dry run' : 'real run'})...`);
        
        // Обновляем файлы локализации
        const locales = ['en', 'ru'];
        for (const locale of locales) {
            console.log(`Updating ${locale}.json...`);
            await this.updateLocaleFile(locale);
        }

        // Обновляем исходные файлы
        const files = await this.findFiles();
        console.log(`Found ${files.length} source files to process`);

        const results: MigrationResult[] = [];
        for (const file of files) {
            const result = await this.updateSourceFile(file);
            if (result.replacements.length > 0) {
                results.push(result);
            }
        }

        // Генерируем отчет
        let report = '# Translation Keys Migration Report\n\n';
        report += `Total files processed: ${files.length}\n`;
        report += `Files with replacements: ${results.length}\n\n`;

        for (const result of results) {
            report += `## ${result.file}\n\n`;
            for (const replacement of result.replacements) {
                report += `- Line ${replacement.line}: ${replacement.oldKey} -> ${replacement.newKey}\n`;
            }
            report += '\n';
        }

        await fs.writeFile(
            join(this.cwd, 'translation-migration-report.md'),
            report
        );

        return results;
    }
} 