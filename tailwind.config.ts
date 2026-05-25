import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "pulse-border": {
          "0%, 100%": { boxShadow: "0 0 0 2px rgba(255,255,255,0.9)" },
          "50%": { boxShadow: "0 0 0 5px rgba(255,255,255,0.5)" },
        },
      },
      animation: {
        shake: "shake 0.3s ease-in-out",
        "pulse-border": "pulse-border 0.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
