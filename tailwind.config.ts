import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b9d1ff",
          300: "#8fb4ff",
          400: "#5f8fff",
          500: "#3a6cf0",
          600: "#2a4fd6",
          700: "#243fac",
          800: "#213789",
          900: "#20336f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
