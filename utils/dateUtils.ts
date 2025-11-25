
/**
 * Utility for handling dates strictly in 'YYYY-MM-DD' format.
 * avoiding timezone shifts caused by JavaScript's Date object defaults.
 */

// Regex to validate YYYY-MM-DD
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns the current local date in YYYY-MM-DD format.
 * Uses the user's system clock but strips time/timezone info immediately.
 * FIX: Builds string manually to avoid toISOString() UTC conversion.
 */
export const getLocalDate = (dateInput?: string | number | Date): string => {
  let d: Date;

  if (!dateInput) {
    d = new Date();
  } else if (typeof dateInput === 'string') {
    // If it matches YYYY-MM-DD, trust it directly.
    if (ISO_DATE_REGEX.test(dateInput)) return dateInput;
    // Handle ISO strings with time
    d = new Date(dateInput);
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) {
      d = new Date(); // Fallback safety
  }

  // MANUAL CONSTRUCTION to ensure LOCAL TIME is respected
  // This prevents the "Yesterday Bug" caused by UTC conversion
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a timestamp or date string specifically for HTML5 <input type="date" />
 */
export const formatToInputDate = (input: number | string | Date): string => {
  return getLocalDate(input);
};

/**
 * Formats a timestamp to HH:MM (24h format)
 */
export const formatTime = (timestamp: number | string): string => {
  if (!timestamp) return '--:--';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '--:--';
  
  return d.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

/**
 * Robust string comparison for dates
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};
