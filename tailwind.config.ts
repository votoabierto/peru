import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "votoclaro-gold": "#C9A84C",
        "votoclaro-gold-light": "#DFC068",
        "votoclaro-gold-dark": "#A8873A",
        "votoclaro-base": "#0A0A0A",
        "votoclaro-surface": "#141414",
        "votoclaro-surface-2": "#1E1E1E",
        "votoclaro-text": "#F5F5F5",
        "votoclaro-text-muted": "#A0A0A0",
        "votoclaro-border": "#2A2A2A",
        "votoclaro-alert": "#C0392B",
        "votoclaro-success": "#27AE60",
        "votoclaro-warning": "#E67E22",
        "votoclaro-info": "#2980B9",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
