import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Tailwind 配置 - 按 PROJECT_RULES v2.0 设计系统
 * 暗黑紫调：背景 zinc-950，主色紫色，强调青色
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(240 10% 3.9%)',
        foreground: 'hsl(0 0% 98%)',
        card: 'hsl(240 10% 3.9%)',
        'card-foreground': 'hsl(0 0% 98%)',
        popover: 'hsl(240 10% 3.9%)',
        'popover-foreground': 'hsl(0 0% 98%)',
        primary: {
          DEFAULT: 'hsl(263 70% 50%)',
          foreground: 'hsl(0 0% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(240 3.7% 15.9%)',
          foreground: 'hsl(0 0% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(240 3.7% 15.9%)',
          foreground: 'hsl(240 5% 64.9%)',
        },
        accent: {
          DEFAULT: 'hsl(173 80% 40%)',
          foreground: 'hsl(0 0% 98%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 62.8% 30.6%)',
          foreground: 'hsl(0 0% 98%)',
        },
        border: 'hsl(240 3.7% 15.9%)',
        input: 'hsl(240 3.7% 15.9%)',
        ring: 'hsl(263 70% 50%)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
