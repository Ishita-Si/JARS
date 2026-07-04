import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08080b",
        "bg-2": "#0c0c11",
        surface: "#111116",
        "surface-2": "#17171f",
        border: {
          DEFAULT: "#232330",
          soft: "#1a1a22",
        },
        ink: {
          DEFAULT: "#e9e9ef",
          dim: "#8d8d9c",
          faint: "#57575f",
        },
        indigo: {
          DEFAULT: "#6d63ff",
          soft: "rgba(109,99,255,0.14)",
        },
        purple: "#a578ff",
        cyan: "#4fd6e8",
        emerald: "#35d399",
        amber: "#f2b544",
        coral: "#f2555f",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        lg: "9px",
      },
    },
  },
  plugins: [],
};
export default config;
