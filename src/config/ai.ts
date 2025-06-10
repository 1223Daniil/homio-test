import { AIConfig } from '@/lib/ai/types';

export const aiConfig: AIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: 'https://api.openai.com/v1',
  maxTokens: 2048,
  temperature: 0.3,
  embeddingModel: 'text-embedding-ada-002',
  chatModel: 'GPT-4o-mini'
};

export const aiAssistantConfig = {
  maxHistoryMessages: 50,
  defaultContext: {
    organization: 'default',
    project: 'default'
  },
  quickActions: {
    'search-projects': {
      description: 'Умный поиск проектов',
      requiredParams: ['query'],
      prompts: [
        'Найди проекты, которые соответствуют запросу: {query}',
        'Покажи проекты по критериям: {query}',
        'Подбери варианты по описанию: {query}'
      ]
    },
    'analyze-sales': {
      description: 'Анализ продаж и эффективности',
      requiredParams: ['period', 'projectId'],
      prompts: [
        'Проанализируй продажи за {period}',
        'Покажи эффективность продаж по проекту {projectId}',
        'Сравни показатели с предыдущим периодом'
      ]
    },
    'market-research': {
      description: 'Анализ рынка и конкурентов',
      requiredParams: ['location', 'propertyType'],
      prompts: [
        'Проведи анализ рынка в локации {location}',
        'Сравни цены конкурентов для {propertyType}',
        'Предложи стратегию позиционирования'
      ]
    },
    'client-matching': {
      description: 'Подбор проектов под запрос клиента',
      requiredParams: ['budget', 'preferences'],
      prompts: [
        'Подбери проекты по бюджету {budget}',
        'Найди варианты с учетом предпочтений: {preferences}',
        'Сформируй персонализированную подборку'
      ]
    }
  }
};

// Log HeyGen configuration during initialization
console.log('HeyGen Configuration:', {
  apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY ? 'Present' : 'Missing',
  avatarId: process.env.NEXT_PUBLIC_HEYGEN_DEFAULT_AVATAR_ID,
  voiceId: process.env.NEXT_PUBLIC_HEYGEN_DEFAULT_VOICE_ID
});

export const heygenConfig = {
  defaultAvatar: {
    avatar_id: process.env.NEXT_PUBLIC_HEYGEN_DEFAULT_AVATAR_ID || '',
    voice_id: process.env.NEXT_PUBLIC_HEYGEN_DEFAULT_VOICE_ID || '',
    dimension: {
      width: 1920,
      height: 1080
    },
    background: {
      type: 'color',
      value: '#f6f6fc'
    }
  },
  apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY || '',
  baseUrl: process.env.NODE_ENV === 'production' ? '/api/ai/avatar' : '/api/ai/avatar',
  serverBaseUrl: 'https://api.heygen.com/v1',
  version: 'v2',
} as const;