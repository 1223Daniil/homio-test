export type CurrencyCode = 'THB' | 'IDR' | 'AED' | 'VND' | 'MYR' | 'SGD' | 'USD' | 'EUR';

export interface Currency {
    code: CurrencyCode;
    symbol: string;
    name: string;
}

export interface Region {
    code: string;
    name: string;
    defaultCurrency: CurrencyCode;
}

export const REGIONS: Region[] = [
    { code: 'TH', name: 'Thailand', defaultCurrency: 'THB' },
    { code: 'ID', name: 'Indonesia', defaultCurrency: 'IDR' },
    { code: 'AE', name: 'UAE', defaultCurrency: 'AED' },
    { code: 'VN', name: 'Vietnam', defaultCurrency: 'VND' },
    { code: 'MY', name: 'Malaysia', defaultCurrency: 'MYR' },
    { code: 'SG', name: 'Singapore', defaultCurrency: 'SGD' }
];

export const CURRENCIES: { [key in CurrencyCode]: Currency } = {
    THB: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
    MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' }
};

export function getDefaultCurrencyForRegion(countryCode: string): CurrencyCode {
    const region = REGIONS.find(r => r.code === countryCode.toUpperCase());
    return region?.defaultCurrency || 'USD';
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
    const currency = CURRENCIES[currencyCode];
    
    // Форматирование в зависимости от валюты
    switch (currencyCode) {
        case 'IDR':
        case 'VND':
            // Для валют с большими числами не используем десятичные
            return `${currency.symbol} ${Math.round(amount).toLocaleString()}`;
        default:
            // Для остальных валют используем 2 десятичных знака
            return `${currency.symbol} ${amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
    }
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
    return CURRENCIES[currencyCode]?.symbol || currencyCode;
}

export function getCurrencyName(currencyCode: CurrencyCode): string {
    return CURRENCIES[currencyCode]?.name || currencyCode;
}

// Конвертация между валютами (заглушка - в реальном приложении здесь будет API для получения курсов)
export async function convertCurrency(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
): Promise<number> {
    // TODO: Implement real currency conversion using exchange rates API
    return amount;
} 