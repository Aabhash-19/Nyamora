import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nyamora: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        surface: {
          dark: "#0b0b10",
          "dark-card": "#13131c",
          "dark-border": "#212130",
          "dark-muted": "#1a1a26",
          light: "#f8f9fa",
          "light-card": "#ffffff",
          "light-border": "#e5e7eb",
          "light-muted": "#f1f3f5",
        },
        accent: {
          violet: "#8b5cf6",
          indigo: "#6366f1",
          fuchsia: "#d946ef",
          pink: "#ec4899",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(168, 85, 247, 0.25)',
        'glow-lg': '0 0 35px -5px rgba(168, 85, 247, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;
