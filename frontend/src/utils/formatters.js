/**
 * Indian Rupee and Financial Number Formatters
 * Formats numbers into standard Indian numbering system (Lakhs and Crores)
 * e.g. 1892294 -> ₹18,92,294
 */

export const formatINR = (amount, includeSymbol = true, decimalPlaces = 0) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? '₹0' : '0';
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = absNum.toLocaleString('en-IN', {
    maximumFractionDigits: decimalPlaces,
    minimumFractionDigits: decimalPlaces,
  });

  const prefix = isNegative ? '-' : '';
  const symbol = includeSymbol ? '₹' : '';

  return `${prefix}${symbol}${formatted}`;
};

export const formatReturnINR = (amount, includeSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const num = Number(amount);
  const sign = num > 0 ? '+' : num < 0 ? '-' : '';
  const absFormatted = Math.abs(num).toLocaleString('en-IN');
  const symbol = includeSymbol ? '₹' : '';

  return `${sign}${symbol}${absFormatted}`;
};

export const formatPercent = (percent, withSign = true, decimalPlaces = 1) => {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '0.0%';
  }

  const num = Number(percent);
  const sign = withSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimalPlaces)}%`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateInput;
  }
};

