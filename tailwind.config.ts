import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f5ef",
        foreground: "#201913",
        border: "#d5cabd",
        muted: "#ece4da",
        "muted-foreground": "#6a5948",
        primary: {
          DEFAULT: "#8d5f2d",
          foreground: "#fffaf3",
        },
        secondary: {
          DEFAULT: "#243746",
          foreground: "#f7fbff",
        },
        accent: {
          DEFAULT: "#dbb97f",
          foreground: "#1f1307",
        },
        destructive: {
          DEFAULT: "#b5483d",
          foreground: "#fffaf8",
        },
      },
      fontFamily: {
        sans: ["Georgia", "Cambria", "serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        legal: "0 20px 60px rgba(36, 55, 70, 0.12)",
      },
      borderRadius: {
        xl: "1rem",
      },
      backgroundImage: {
        "paper-grid":
          "linear-gradient(to right, rgba(141, 95, 45, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(141, 95, 45, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "paper-grid": "28px 28px",
      },
    },
  },
  plugins: [],
};

export default config;
