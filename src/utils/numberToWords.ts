export const numberToWordsRu = (amount: number, currency: string = 'KZT'): string => {
  if (amount === 0) return `Ноль ${getCurrencyName(currency)}`;

  const units = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const unitsM = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

  const getHundreds = (num: number, isFemale: boolean = false) => {
    let result = '';
    const h = Math.floor(num / 100);
    const remainder = num % 100;
    
    if (h > 0) result += hundreds[h] + ' ';
    
    if (remainder > 0 && remainder < 10) {
      result += (isFemale ? units[remainder] : unitsM[remainder]) + ' ';
    } else if (remainder >= 10 && remainder < 20) {
      result += teens[remainder - 10] + ' ';
    } else if (remainder >= 20) {
      const t = Math.floor(remainder / 10);
      const u = remainder % 10;
      result += tens[t] + ' ';
      if (u > 0) result += (isFemale ? units[u] : unitsM[u]) + ' ';
    }
    return result.trim();
  };

  let numStr = Math.floor(Math.abs(amount)).toString();
  let parts = [];
  
  while (numStr.length > 0) {
    parts.unshift(parseInt(numStr.slice(-3) || '0'));
    numStr = numStr.slice(0, -3);
  }

  let words = [];
  const forms = [
    ['', '', '', true], // units (female for thousands, male for millions?) wait, actually depends on currency gender. KZT (тенге - мужской), RUB (рубль - муж), USD (доллар - муж). Let's assume male for base currency.
    ['тысяча', 'тысячи', 'тысяч', true], // thousands are female
    ['миллион', 'миллиона', 'миллионов', false],
    ['миллиард', 'миллиарда', 'миллиардов', false]
  ];

  for (let i = 0; i < parts.length; i++) {
    const val = parts[i];
    if (val === 0) continue;
    
    const power = parts.length - 1 - i;
    const form = forms[power];
    
    const str = getHundreds(val, form[3] as boolean);
    if (str) {
      words.push(str);
      
      if (power > 0) {
        const lastDigit = val % 10;
        const lastTwoDigits = val % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
          words.push(form[2]);
        } else if (lastDigit === 1) {
          words.push(form[0]);
        } else if (lastDigit >= 2 && lastDigit <= 4) {
          words.push(form[1]);
        } else {
          words.push(form[2]);
        }
      }
    }
  }

  // Handle currency
  const lastDigit = Math.floor(amount) % 10;
  const lastTwo = Math.floor(amount) % 100;
  
  let currName = '';
  if (currency === 'KZT') {
    currName = 'тенге'; // doesn't decline
  } else if (currency === 'RUB') {
    if (lastTwo >= 11 && lastTwo <= 19) currName = 'рублей';
    else if (lastDigit === 1) currName = 'рубль';
    else if (lastDigit >= 2 && lastDigit <= 4) currName = 'рубля';
    else currName = 'рублей';
  } else if (currency === 'USD') {
    if (lastTwo >= 11 && lastTwo <= 19) currName = 'долларов';
    else if (lastDigit === 1) currName = 'доллар';
    else if (lastDigit >= 2 && lastDigit <= 4) currName = 'доллара';
    else currName = 'долларов';
  }

  const res = (words.join(' ') + ' ' + currName).trim();
  // Capitalize first letter
  return res.charAt(0).toUpperCase() + res.slice(1);
};

const getCurrencyName = (curr: string) => {
  if (curr === 'KZT') return 'тенге';
  if (curr === 'RUB') return 'рублей';
  if (curr === 'USD') return 'долларов';
  return curr;
};
