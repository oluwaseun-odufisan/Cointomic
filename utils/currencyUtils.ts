import { create } from 'zustand';

// Conversion rate: 1 EUR = 1,600 NGN (adjustable)
const EUR_TO_NGN_RATE = 1600;

// Utility to format and convert prices
export const formatCurrency = (
    amount: number,
    currency: 'EUR' | 'NGN',
    isPrimary: boolean = true
): { value: string; symbol: string } => {
    if (currency === 'NGN') {
        const ngnAmount = amount * EUR_TO_NGN_RATE;
        return {
            value: ngnAmount.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
            symbol: '₦',
        };
    }
    return {
        value: amount.toLocaleString('en-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }),
        symbol: '€',
    };
};

// Zustand store for currency preference
interface CurrencyState {
    primaryCurrency: 'EUR' | 'NGN';
    setPrimaryCurrency: (currency: 'EUR' | 'NGN') => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
    primaryCurrency: 'EUR',
    setPrimaryCurrency: (currency) => set({ primaryCurrency: currency }),
}));