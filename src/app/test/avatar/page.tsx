import { StreamingAvatarTest } from '@/components/ai/StreamingAvatarTest';
import { useTranslations } from 'next-intl';

export default function TestAvatarPage() {
  const t = useTranslations('AI.Streaming');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <StreamingAvatarTest />
    </div>
  );
} 