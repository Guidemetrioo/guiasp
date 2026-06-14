import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "#0A0A0A",
          gold: "#F59E0B",
          goldHover: "#D97706",
          text: "#FFFFFF",
          muted: "#A3A3A3",
        },
      },
    },
  },
  plugins: [],
};
export default config;
