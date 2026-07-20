export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompactINR = (amount: number) => {
  const absAmount = Math.abs(amount);
  let formatted = '';
  let suffix = '';

  if (absAmount >= 10000000) {
    // 1 Crore = 10,000,000
    formatted = (amount / 10000000).toFixed(2);
    suffix = 'Cr';
  } else if (absAmount >= 100000) {
    // 1 Lakh = 100,000
    formatted = (amount / 100000).toFixed(2);
    suffix = 'L';
  } else if (absAmount >= 1000) {
    // Thousand
    formatted = (amount / 1000).toFixed(1);
    suffix = 'K';
  } else {
    formatted = amount.toString();
  }

  // Clean trailing decimal zeroes (e.g. 12.00 -> 12, 1.80 -> 1.8)
  if (formatted.includes('.')) {
    formatted = formatted.replace(/\.?0+$/, '');
  }

  return `₹${formatted}${suffix}`;
};
