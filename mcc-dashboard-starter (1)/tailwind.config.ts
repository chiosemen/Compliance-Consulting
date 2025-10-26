
import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#16a34a", accent: "#f59e0b", dark: "#0f172a" }
      },
      boxShadow: { card: "0 4px 12px rgba(0,0,0,0.08)" },
      fontFamily: { sans: ["Inter","ui-sans-serif","system-ui"] }
    }
  },
  plugins: []
};
export default config;
