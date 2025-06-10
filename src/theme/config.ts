import { nextui } from "@heroui/react";

const config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        content1: "var(--content1)",
        content2: "var(--content2)",
        content3: "var(--content3)",
        content4: "var(--content4)",
        divider: "var(--divider)",
        overlay: "var(--overlay)",
        focus: "var(--focus)",
        default: {
          50: "var(--default-50)",
          100: "var(--default-100)",
          200: "var(--default-200)",
          300: "var(--default-300)",
          400: "var(--default-400)",
          500: "var(--default-500)",
          600: "var(--default-600)",
          700: "var(--default-700)",
          800: "var(--default-800)",
          900: "var(--default-900)"
        },
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)"
        }
      }
    }
  },
  plugins: [nextui()]
};

export default config;
