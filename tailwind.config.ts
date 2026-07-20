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
        "sivac-bg-primary": "var(--sivac-bg-primary)",
        "sivac-bg-secondary": "var(--sivac-bg-secondary)",
        "sivac-bg-surface": "var(--sivac-bg-surface)",
        "sivac-bg-card": "var(--sivac-bg-card)",
        "sivac-bg-input": "var(--sivac-bg-input)",
        "sivac-bg-input-admin": "var(--sivac-bg-input-admin)",
        "sivac-bg-toggle": "var(--sivac-bg-toggle)",
        // Borders
        "sivac-border": "var(--sivac-border)",
        "sivac-border-card": "var(--sivac-border-card)",
        "sivac-border-glass": "var(--sivac-border-glass)",
        // Text
        "sivac-heading": "var(--sivac-heading)",
        "sivac-body": "var(--sivac-body)",
        "sivac-light": "var(--sivac-light)",
        "sivac-muted": "var(--sivac-muted)",
        "sivac-dim": "var(--sivac-dim)",
        "sivac-data": "var(--sivac-data)",
        // Accents
        "sivac-blue": "var(--sivac-blue)",
        "sivac-indigo": "var(--sivac-indigo)",
        "sivac-indigo-light": "var(--sivac-indigo-light)",
        "sivac-surface": "var(--sivac-surface)",
        "sivac-green": "var(--sivac-green)",
        "sivac-green-soft": "var(--sivac-green-soft)",
        "sivac-green-light": "var(--sivac-green-light)",
        "sivac-yellow": "var(--sivac-yellow)",
        "sivac-yellow-soft": "var(--sivac-yellow-soft)",
        "sivac-red": "var(--sivac-red)",
        "sivac-red-soft": "var(--sivac-red-soft)",
        "sivac-red-light": "var(--sivac-red-light)",
        "sivac-blue-light": "var(--sivac-blue-light)",
        "sivac-blue-pale": "var(--sivac-blue-pale)",
        "sivac-blue-pastel": "var(--sivac-blue-pastel)",
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
