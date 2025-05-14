/**
 * Convert a number to words representation
 * @param num The number to convert
 * @returns The number in words
 */
export function numberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) {
      return '';
    }
    
    if (n < 20) {
      return units[n];
    }
    
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    }
    
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
  };
  
  if (num === 0) {
    return 'Zero';
  }
  
  // Handle negative numbers
  const prefix = num < 0 ? 'Negative ' : '';
  num = Math.abs(num);
  
  // Split into whole number and decimal parts
  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);
  
  // Convert whole part
  let result = '';
  let crore = Math.floor(wholePart / 10000000);
  let lakh = Math.floor((wholePart % 10000000) / 100000);
  let thousand = Math.floor((wholePart % 100000) / 1000);
  let remaining = wholePart % 1000;
  
  if (crore > 0) {
    result += convertLessThanOneThousand(crore) + ' Crore ';
  }
  
  if (lakh > 0) {
    result += convertLessThanOneThousand(lakh) + ' Lakh ';
  }
  
  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + ' Thousand ';
  }
  
  if (remaining > 0) {
    result += convertLessThanOneThousand(remaining);
  }
  
  // Add decimal part if exists
  if (decimalPart > 0) {
    result += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
  }
  
  return prefix + result.trim();
}

/**
 * Format currency amount in words with currency name
 * @param amount The amount to format
 * @param currencyName The currency name (default: 'Rupees')
 * @returns Formatted amount in words with currency
 */
export function amountInWords(amount: number, currencyName: string = 'Rupees'): string {
  return `${numberToWords(amount)} ${currencyName} Only`;
}
