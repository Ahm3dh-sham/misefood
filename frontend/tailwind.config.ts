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
        heading: [
          "Switzer",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        switzer: [
          "Switzer",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        obsidian: "#0C0D0E",
        charcoal: "#131517",
        slateCard: "#181B1E",
        saffron: "#F59E0B",
        terracotta: "#EA580C",
        sage: "#10B981",
        parchment: "#F8FAFC",
      },
      transitionTimingFunction: {
        "emil-out": "cubic-bezier(0.23, 1, 0.32, 1)",
        "emil-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        "emil-drawer": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
