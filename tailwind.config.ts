import type { Config } from "tailwindcss";

// Bright enterprise palette — Fluent/Fiori inspired. Primary blue drives
// interactive elements; TUHH teal (brand.teal) is retained as the
// institutional accent color extracted from the thesis presentation theme.
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0B5FFF",
          blueDark: "#0A4FD6",
          blueLight: "#EAF1FF",
          teal: "#2DC6D6",
          tealDark: "#189AA8",
          tealLight: "#E8FAFC",
          navy: "#0F2A4A",
        },
        surface: {
          base: "#F4F6FA",       // page background
          panel: "#FFFFFF",      // card background
          panelAlt: "#F7F9FC",   // subtle inset background
          border: "#E5E9F0",     // hairline border
          borderLight: "#D8DEE8",
        },
        ink: {
          900: "#151B26",
          700: "#333D4D",
          500: "#5B6472",
          400: "#8A93A3",
          300: "#B4BBC7",
        },
        status: {
          healthy: "#1FA97A",
          warning: "#DB9200",
          critical: "#E5484D",
          info: "#0B5FFF",
          neutral: "#8A93A3",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glass: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
        card: "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)",
        lifted: "0 8px 24px rgba(16,24,40,0.08), 0 2px 6px rgba(16,24,40,0.05)",
        glow: "0 0 0 4px rgba(11,95,255,0.10)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        pulseSlow: "pulseSlow 2.4s ease-in-out infinite",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
