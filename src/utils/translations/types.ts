export class TranslationError extends Error {
  constructor(
    message: string,
    public key: string,
    public locale: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}

export interface ValidationRules {
  maxLength: number;
  allowHtml: boolean;
  required: string[];
  patterns: {
    [key: string]: RegExp;
  };
}

export interface CacheOptions {
  maxSize: number;
  ttl: number;
}

export interface ApiConfig {
  baseUrl: string;
  retryAttempts: number;
  rateLimit: number;
  timeout: number;
}

export interface TranslationKey {
  namespace: string;
  key: string;
  context?: string;
}

export interface TranslationValue {
  value: string;
  locale: string;
  lastUpdated: Date;
  context?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    key: string;
    error: string;
    context?: Record<string, unknown>;
  }>;
}

export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  maxLength: 1000,
  allowHtml: false,
  required: ['common.error.unknown', 'common.actions.retry'],
  patterns: {
    email: /^[^@]+@[^@]+\.[^@]+$/,
    phone: /^\+?[\d\s-()]+$/,
    url: /^https?:\/\/.+/,
  }
};

export const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  maxSize: 1000,
  ttl: 3600000, // 1 hour
};

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
  retryAttempts: 3,
  rateLimit: 10,
  timeout: 5000,
}; 