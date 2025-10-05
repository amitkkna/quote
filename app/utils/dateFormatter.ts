/**
 * Formats a date string from YYYY-MM-DD to DD-MM-YYYY format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string in DD-MM-YYYY format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Check if the date is already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    // Assuming input is in YYYY-MM-DD format
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Converts a date from DD-MM-YYYY to YYYY-MM-DD format for HTML date inputs
 * @param dateString - Date string in DD-MM-YYYY format
 * @returns Date string in YYYY-MM-DD format
 */
export const parseDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Check if the date is already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    // Assuming input is in DD-MM-YYYY format
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error parsing date:', error);
    return dateString;
  }
};
