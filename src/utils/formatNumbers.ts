// Presentation-only formatting: keep stored amounts as numeric values.
export const formatMoney = (value: number | string, digits = 2): string => {
  const parsed = typeof value === 'number' ? value : Number(value.replace(/,/g, ''));
  const number = Number.isFinite(parsed) ? parsed : 0;
  return number.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const formatCount = (value: number): string =>
  value.toLocaleString('en-US', { maximumFractionDigits: 0 });

// Preserve a typed trailing decimal point and fractional digits.
export const formatAmountInput = (value: string): string => {
  const clean = value.replace(/,/g, '');
  const [integer, fraction, ...extra] = clean.split('.');
  if (extra.length || !/^\d*$/.test(integer) || (fraction !== undefined && !/^\d*$/.test(fraction))) {
    return value;
  }
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === undefined ? grouped : grouped + '.' + fraction;
};
