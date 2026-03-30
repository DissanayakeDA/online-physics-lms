'use client';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Keep the hook so existing imports don't break – always returns light
export const useTheme = () => ({ theme: 'light' as const, toggle: () => {} });
