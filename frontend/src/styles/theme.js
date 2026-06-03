// Central design tokens for the VesikaArt frontend.
// Consumed via styled-components' ThemeProvider (access with props.theme)
// and can also be imported directly where a raw value is needed.

const theme = {
  colors: {
    primary: '#667eea',
    primaryDark: '#764ba2',
    text: '#1f2937',
    textSecondary: '#374151',
    muted: '#6b7280',
    border: '#e5e7eb',
    surface: '#f8fafc',
    surfaceAlt: '#f9fafb',
    white: '#ffffff',
    success: '#10b981',
    successDark: '#059669',
    danger: '#ef4444',
    dangerDark: '#dc2626',
    warning: '#f59e0b',
    warningDark: '#d97706',
    link: '#3b82f6',
  },

  gradients: {
    brand: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 45%, #ec4899 100%)',
    page: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    success: 'linear-gradient(135deg, #10b981, #059669)',
    danger: 'linear-gradient(135deg, #ef4444, #dc2626)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
    aurora:
      'radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,0.45), transparent 60%), radial-gradient(900px 600px at 110% 10%, rgba(236,72,153,0.4), transparent 55%), radial-gradient(900px 700px at 50% 120%, rgba(34,211,238,0.35), transparent 55%), #0b0e1f',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
  },

  glass: {
    bg: 'rgba(255, 255, 255, 0.08)',
    bgStrong: 'rgba(255, 255, 255, 0.14)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    blur: 'blur(18px)',
  },

  radii: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    xxl: '24px',
    pill: '999px',
  },

  shadows: {
    sm: '0 8px 24px rgba(8, 11, 31, 0.18)',
    md: '0 18px 40px rgba(8, 11, 31, 0.28)',
    lg: '0 30px 70px rgba(8, 11, 31, 0.40)',
    brand: '0 12px 34px rgba(124, 92, 255, 0.45)',
    glow: '0 0 0 1px rgba(255,255,255,0.10), 0 20px 50px rgba(124, 92, 255, 0.35)',
    focusRing: '0 0 0 3px rgba(139, 92, 246, 0.30)',
  },

  fonts: {
    body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },

  layout: {
    maxWidth: '1200px',
  },

  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
  },
};

export default theme;
