import { ValidationRules, ValidationResult, TranslationError } from './types';

export class TranslationValidator {
  constructor(private rules: ValidationRules) {}

  /**
   * Проверяет все переводы в объекте
   */
  validateTranslations(translations: Record<string, any>, prefix = ''): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    for (const [key, value] of Object.entries(translations)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        const nestedResult = this.validateTranslations(value, fullKey);
        errors.push(...nestedResult.errors);
      } else if (typeof value === 'string') {
        const validation = this.validateTranslation(fullKey, value);
        if (!validation.isValid) {
          errors.push(...validation.errors);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Проверяет отдельный перевод
   */
  validateTranslation(key: string, value: string): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    // Проверка обязательных ключей
    if (this.rules.required.includes(key) && !value) {
      errors.push({
        key,
        error: 'Required translation is missing'
      });
    }

    // Проверка длины
    if (value.length > this.rules.maxLength) {
      errors.push({
        key,
        error: `Translation exceeds maximum length of ${this.rules.maxLength} characters`
      });
    }

    // Проверка HTML
    if (!this.rules.allowHtml && /<[^>]+>/g.test(value)) {
      errors.push({
        key,
        error: 'HTML tags are not allowed in translations'
      });
    }

    // Проверка паттернов
    for (const [patternName, pattern] of Object.entries(this.rules.patterns)) {
      if (key.includes(patternName) && !pattern.test(value)) {
        errors.push({
          key,
          error: `Value does not match ${patternName} pattern`
        });
      }
    }

    // Проверка интерполяции
    const interpolationPattern = /\{([^}]+)\}/g;
    const matches = value.match(interpolationPattern) || [];
    const uniqueVariables = new Set(matches.map(m => m.slice(1, -1)));

    // Проверка неиспользуемых переменных
    const unusedVariables = Array.from(uniqueVariables).filter(variable => 
      !value.includes(`{${variable}}`)
    );

    if (unusedVariables.length > 0) {
      errors.push({
        key,
        error: `Unused interpolation variables: ${unusedVariables.join(', ')}`
      });
    }

    // Проверка консистентности кавычек
    const singleQuotes = (value.match(/'/g) || []).length;
    const doubleQuotes = (value.match(/"/g) || []).length;

    if (singleQuotes > 0 && doubleQuotes > 0) {
      errors.push({
        key,
        error: 'Mixed quote styles detected'
      });
    }

    // Проверка пробелов
    if (value.startsWith(' ') || value.endsWith(' ')) {
      errors.push({
        key,
        error: 'Translation contains leading or trailing spaces'
      });
    }

    // Проверка множественных пробелов
    if (/\s{2,}/.test(value)) {
      errors.push({
        key,
        error: 'Translation contains multiple consecutive spaces'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Проверяет консистентность между локалями
   */
  validateLocaleConsistency(
    baseTranslations: Record<string, any>,
    targetTranslations: Record<string, any>
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const baseKeys = this.getAllKeys(baseTranslations);
    const targetKeys = this.getAllKeys(targetTranslations);

    // Проверка отсутствующих ключей
    const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));
    if (missingKeys.length > 0) {
      errors.push({
        key: 'missing_keys',
        error: `Missing translations for keys: ${missingKeys.join(', ')}`
      });
    }

    // Проверка лишних ключей
    const extraKeys = targetKeys.filter(key => !baseKeys.includes(key));
    if (extraKeys.length > 0) {
      errors.push({
        key: 'extra_keys',
        error: `Extra translations found for keys: ${extraKeys.join(', ')}`
      });
    }

    // Проверка соответствия переменных
    for (const key of baseKeys) {
      const baseValue = this.getValueByPath(baseTranslations, key);
      const targetValue = this.getValueByPath(targetTranslations, key);

      if (typeof baseValue === 'string' && typeof targetValue === 'string') {
        const baseVars = this.extractVariables(baseValue);
        const targetVars = this.extractVariables(targetValue);

        const missingVars = baseVars.filter(v => !targetVars.includes(v));
        const extraVars = targetVars.filter(v => !baseVars.includes(v));

        if (missingVars.length > 0 || extraVars.length > 0) {
          errors.push({
            key,
            error: 'Interpolation variables mismatch',
            context: { missingVars, extraVars }
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        keys.push(...this.getAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  private getValueByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((curr, key) => curr && curr[key], obj);
  }

  private extractVariables(text: string): string[] {
    const matches = text.match(/\{([^}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1));
  }
} 