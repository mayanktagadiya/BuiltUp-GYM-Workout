import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        border: "var(--border)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        accent: {
          DEFAULT: "var(--accent)",
          bg: "var(--accent-bg)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--bg)",
        },
        secondary: {
          DEFAULT: "var(--surface-hover)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-secondary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--text-primary)",
        },
        input: "var(--border)",
        ring: "var(--accent)",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "label-xs": ["10px", { letterSpacing: "0.05em", lineHeight: "1.4" }],
        "label-sm": ["11px", { letterSpacing: "0.04em", lineHeight: "1.4" }],
        body: ["14px", { lineHeight: "1.5" }],
        "body-lg": ["15px", { lineHeight: "1.5" }],
        h3: ["18px", { lineHeight: "1.3", fontWeight: "500" }],
        h2: ["22px", { lineHeight: "1.3", fontWeight: "500" }],
        h1: ["26px", { lineHeight: "1.2", fontWeight: "500" }],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
