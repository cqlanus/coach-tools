/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // LGLL brand
        navy:  { DEFAULT: "#1B3A6B", light: "#2E5FA3", dark: "#122850" },
        red:   { DEFAULT: "#C8102E", light: "#E63048", dark: "#9E0C24" },
        cream: { DEFAULT: "#F0EAD6", dark: "#D6CEBC" },
        // Semantic field colors (defense tool)
        field: {
          grass:  "#0f2417",
          mid:    "#163620",
          light:  "#1e4a2a",
          dirt:   "#8b5e3c",
        },
        assignment: {
          ball:   "#3b82f6",
          cover:  "#22c55e",
          backup: "#f59e0b",
          cut:    "#a78bfa",
          hold:   "#4b5563",
        },
      },
      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
