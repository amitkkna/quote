/**
 * Format a number with Indian style comma separators (e.g., 25,000.00)
 * @param num The number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string with Indian style comma separators
 */
export const formatIndianNumber = (num: number | string | undefined | null, decimals: number = 2): string => {
  // Handle undefined, null, or empty string
  if (num === undefined || num === null || num === "") {
    return "";
  }

  // Convert to number if it's a string
  const numValue = typeof num === "string" ? parseFloat(num) : num;

  // Handle NaN
  if (isNaN(numValue)) {
    return "";
  }

  // Format with fixed decimal places
  const fixedNum = numValue.toFixed(decimals);

  // Split into whole and decimal parts
  const parts = fixedNum.split(".");
  const wholePart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : "";

  // Format the whole part with Indian style commas
  // First, get the last 3 digits
  const lastThree = wholePart.length > 3 ? wholePart.substring(wholePart.length - 3) : wholePart;

  // Then, get the remaining digits and format them with commas after every 2 digits
  const remaining = wholePart.length > 3 ? wholePart.substring(0, wholePart.length - 3) : "";

  // Add commas after every 2 digits in the remaining part
  let formattedRemaining = "";
  for (let i = remaining.length - 1, count = 0; i >= 0; i--, count++) {
    formattedRemaining = remaining.charAt(i) + formattedRemaining;
    if (count % 2 === 1 && i > 0) {
      formattedRemaining = "," + formattedRemaining;
    }
  }

  // Combine the parts
  const formattedWholePart = formattedRemaining
    ? formattedRemaining + "," + lastThree
    : lastThree;

  // Return the formatted number with decimal part if needed
  return decimalPart
    ? formattedWholePart + "." + decimalPart
    : formattedWholePart;
};

/**
 * Format a number as currency with Indian style comma separators
 * @param num The number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "25,000.00")
 */
export const formatCurrency = (num: number | string | undefined | null, decimals: number = 2): string => {
  return formatIndianNumber(num, decimals);
};
