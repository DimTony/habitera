type UserType = 'user' | 'agent' | null;

const colorPalettes = {
  user: {
    primary: '#678B83', // Green shade
    secondary: '#A7C4BC', // Light green
    accent: '#424B54', // Dark gray
    background: '#F4F7F6', // Light gray-green
    text: '#333333', // Dark text
  },
  agent: {
    primary: '#3E5C76', // Blue shade
    secondary: '#748CAB', // Light blue
    accent: '#F1AB86', // Orange accent
    background: '#F7F9FC', // Light blue-gray
    text: '#333333', // Dark text
  },
  // Fallback/default palette (used when userType is null)
  default: {
    primary: '#678B83',
    secondary: '#A7C4BC',
    accent: '#424B54',
    background: '#F4F7F6',
    text: '#333333',
  },
};

export const getThemeColors = (userType: UserType) => {
  return colorPalettes[userType || 'default'];
};

export const createThemeColors = (userType: UserType) => {
  const palette = getThemeColors(userType);

  return {
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    backgroundColor: palette.background,
    textColor: palette.text,

    bgColor: (opacity: number) => `rgba(${hexToRgb(palette.primary)}, ${opacity})`,
    accentBgColor: (opacity: number) => `rgba(${hexToRgb(palette.accent)}, ${opacity})`,
  };
};

function hexToRgb(hex: string): string {
  hex = hex.replace(/^#/, '');

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
}

// Export a default themeColors for backward compatibility
// This will be deprecated once the dynamic theme is fully implemented
export const themeColors = {
  primaryUser: '#678B83',
  bgColor: (opacity: any) => `rgba(103, 139, 131, ${opacity})`,
};
