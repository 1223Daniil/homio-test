'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectItem, Card, CardBody } from "@heroui/react";
import { ProjectWithTranslation } from '@/types/project';
import { CurrencyCode, CURRENCIES, REGIONS, getDefaultCurrencyForRegion } from '@/utils/currency';
import { toast } from 'sonner';

interface CurrencySettingsFormProps {
    project: ProjectWithTranslation;
    onSave: (data: { currency: CurrencyCode }) => Promise<void>;
    isSaving?: boolean;
}

export function CurrencySettingsForm({
    project,
    onSave,
    isSaving
}: CurrencySettingsFormProps) {
    const t = useTranslations('Projects.currency');

    const handleCurrencyChange = async (currencyCode: string) => {
        try {
            await onSave({
                currency: currencyCode as CurrencyCode
            });
            toast.success(t('messages.updateSuccess'));
        } catch (error) {
            console.error('Currency update error:', error);
            toast.error(t('messages.updateError'));
        }
    };

    // Получаем валюту по умолчанию для региона проекта
    const defaultCurrency = project.location?.country 
        ? getDefaultCurrencyForRegion(project.location.country)
        : 'USD';

    return (
        <Card>
            <CardBody className="gap-4">
                <div>
                    <h3 className="text-lg font-medium mb-2">{t('settings.title')}</h3>
                    <p className="text-sm text-default-500 mb-4">{t('settings.description')}</p>
                </div>

                <div className="flex flex-col gap-2">
                    <Select
                        label={t('title')}
                        placeholder={t('settings.defaultByRegion')}
                        selectedKeys={[project.currency || defaultCurrency]}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        isDisabled={isSaving}
                    >
                        {Object.entries(CURRENCIES).map(([code, currency]) => (
                            <SelectItem key={code} value={code}>
                                {`${currency.symbol} ${t(`names.${code}`)} (${code})`}
                            </SelectItem>
                        ))}
                    </Select>

                    {project.location?.country && (
                        <p className="text-sm text-default-500">
                            {t('settings.defaultByRegion')}: {t(`regions.${project.location.country}`)}
                        </p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
} 