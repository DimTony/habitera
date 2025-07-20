const hslToHex = (h: number, s: number, l: number): string => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const generateStableGradientPair = (seed: string): [string, string] => {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use hash to generate deterministic hue
  const hue = Math.abs(hash) % 360;
  const saturation = 0.75;
  const lightnessBase = 0.55;

  const color1 = hslToHex(hue, saturation, lightnessBase);
  const color2 = hslToHex(hue, saturation, lightnessBase - 0.15);

  return [color1, color2];
};

export const getInitials = (name: string) => {
  if (!name) {
    return 'AB';
  }
  const names = name?.split(' ') || '';
  const initials = names?.[0]?.[0] + (names?.[1] ? names?.[1]?.[0] : '');
  return initials.toUpperCase();
};

export const formatUTCTo12Hour = (utcTime: string): string => {
  const date = new Date(utcTime);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'UTC', // ensure UTC context
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
