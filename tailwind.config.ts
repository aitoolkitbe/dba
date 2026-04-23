import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef1",
          200: "#d9dae0",
          300: "#b5b7c2",
          400: "#8e91a1",
          500: "#6c6f82",
          600: "#4f5264",
          700: "#3b3d4c",
          800: "#242633",
          900: "#13141c",
          950: "#09090f",
        },
        accent: {
          50: "#fff2ed",
          100: "#ffe1d4",
          200: "#ffbea9",
          300: "#ff9273",
          400: "#ff6440",
          500: "#ff3d14",
          600: "#f02306",
          700: "#c71808",
          800: "#9e160f",
          900: "#7f1511",
        },
        winner: "#16a34a",
        taxi: "#eab308",
        investable: "#2563eb",
        ignorable: "#94a3b8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
