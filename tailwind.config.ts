import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        moss: "#255b4d",
        sand: "#f5f1e8",
        coral: "#d9755b",
        mist: "#e7f0eb"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-lora)", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
