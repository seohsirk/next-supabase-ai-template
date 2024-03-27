export function isBrowser() {
  return typeof window !== 'undefined';
}

export function formatCurrency(currencyCode: string, value: string | number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(value));
}
