import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        "10": ["10px", { lineHeight: "14px" }],
        "11": ["11px", { lineHeight: "15px" }],
        "12": ["12px", { lineHeight: "16px" }],
        "13": ["13px", { lineHeight: "18px" }],
        "13.5": ["13.5px", { lineHeight: "19px" }],
        "14": ["14px", { lineHeight: "20px" }],
        "15": ["15px", { lineHeight: "22px" }],
        "16": ["16px", { lineHeight: "24px" }],
        "18": ["18px", { lineHeight: "26px" }],
        "20": ["20px", { lineHeight: "28px" }],
        "22": ["22px", { lineHeight: "30px" }],
        "24": ["24px", { lineHeight: "32px" }],
        "28": ["28px", { lineHeight: "38px" }],
        "32": ["32px", { lineHeight: "42px" }],
        "36": ["36px", { lineHeight: "46px" }],
        "40": ["40px", { lineHeight: "50px" }],
        "48": ["48px", { lineHeight: "58px" }],
      },
      colors: {
        // Backgrounds
        "sivac-bg-primary": "#0d141d",
        "sivac-bg-secondary": "#151c25",
        "sivac-bg-surface": "#192029",
        "sivac-bg-card": "#1f2937",
        "sivac-bg-input": "#080f17",
        "sivac-bg-input-admin": "#111827",
        "sivac-bg-toggle": "#232a34",
        // Borders
        "sivac-border": "#434655",
        "sivac-border-card": "#374151",
        "sivac-border-glass": "rgba(67, 70, 85, 0.25)",
        // Text
        "sivac-heading": "#dce3f0",
        "sivac-body": "#c3c6d7",
        "sivac-light": "#f3f4f6",
        "sivac-muted": "#9ca3af",
        "sivac-dim": "#6b7280",
        "sivac-data": "#d1d5db",
        // Accents
        "sivac-blue": "#2563eb",
        "sivac-indigo": "#b4c5ff",
        "sivac-indigo-light": "#dbe1ff",
        "sivac-surface": "#eeefff",
        "sivac-green": "#22c55e",
        "sivac-green-soft": "#4edea3",
        "sivac-green-light": "#4ade80",
        "sivac-yellow": "#eab308",
        "sivac-yellow-soft": "#ffb95f",
        "sivac-red": "#ef4444",
        "sivac-red-soft": "#ffb4ab",
        "sivac-red-light": "#f87171",
        "sivac-blue-light": "#60a5fa",
        "sivac-blue-pale": "#93c5fd",
        "sivac-blue-pastel": "#bfdbfe",
      },
      spacing: {
        "280": "280px",
      },
      letterSpacing: {
        "wide-06": "0.6px",
        "wide-14": "1.4px",
      },
      backdropBlur: {
        glass: "10.5px",
      },
    },
  },
  plugins: [],
};

export default config;
