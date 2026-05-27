export function TruncateText(text: string, maxLength = 50) {
    if (!text) return "";

    return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
}

export const normalizePhoneNumber = (phone: string) => {
  let cleaned = phone.replace(/\s/g, '');

  // remove leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // convert 07xxxxxxxx -> 2547xxxxxxxx
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  }

  // prevent double 254
  if (cleaned.startsWith('254254')) {
    cleaned = cleaned.slice(3);
  }

  return cleaned;
};

export function formatNumber(num:number) {
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }

  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }

  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  return num?.toString();
}

