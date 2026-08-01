import expressions from 'angular-expressions';

import { format as formatFns, parseISO } from 'date-fns';

function formatDate(dateStr: string | Date, formatStr: string): string {
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '';
    
    // Map specific legacy format strings exactly
    let mappedFormat = formatStr;
    if (mappedFormat === 'd.m.Y') mappedFormat = 'dd.MM.yyyy';
    else if (mappedFormat === 'H:i:s') mappedFormat = 'HH:mm:ss';
    
    return formatFns(d, mappedFormat);
  } catch (e) {
    return String(dateStr);
  }
}

// Register filters for angular-expressions
export function registerFilters() {
  expressions.filters.date = function(input, format) {
    if (!input) return input;
    return formatDate(input, format || 'd.m.Y');
  };

  expressions.filters.time = function(input, format) {
    if (!input) return input;
    return formatDate(input, format || 'H:i:s');
  };

  expressions.filters.list = function(input: any[], separatorType: number | string) {
    if (!Array.isArray(input)) return input;
    const type = String(separatorType);
    if (type === '1') return input.join(', ');
    if (type === '2') return input.join(' ');
    if (type === '3') return input.join('\n');
    return input.join(', ');
  };

  // Simple number to words in Russian (very basic stub, would need a library for production)
  expressions.filters.money = function(input: number, mode: string) {
    if (typeof input !== 'number') return input;
    if (mode === 'words') {
       // Ideally we use a library like 'written-number' or custom Russian money converter.
       // For MVP, we just add the currency sign and formatted number.
       return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT' }).format(input);
    }
    return new Intl.NumberFormat('ru-RU').format(input);
  };
}
