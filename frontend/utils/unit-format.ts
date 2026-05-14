export function formatMoney(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatNumber(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });
}
