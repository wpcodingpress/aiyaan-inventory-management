import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3525cd",
        "primary-container": "#4f46e5",
        "on-primary": "#ffffff",
        "on-primary-container": "#dad7ff",
        "inverse-primary": "#c3c0ff",

        secondary: "#565e74",
        "secondary-container": "#dae2fd",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#5c647a",

        surface: "#fcf8ff",
        "surface-dim": "#dcd8e5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f2ff",
        "surface-container": "#f0ecf9",
        "surface-container-high": "#eae6f4",
        "surface-container-highest": "#e4e1ee",
        "surface-bright": "#fcf8ff",
        "on-surface": "#1b1b24",
        "on-surface-variant": "#464555",
        "surface-variant": "#e4e1ee",

        outline: "#777587",
        "outline-variant": "#c7c4d8",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "inverse-surface": "#302f39",
        "inverse-on-surface": "#f3effc",

        tertiary: "#7e3000",
        "tertiary-container": "#a44100",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffd2be",

        background: "#fcf8ff",
        "on-background": "#1b1b24",
      },
      fontFamily: {
        "display-lg": ["Hanken Grotesk", "sans-serif"],
        "display-md": ["Hanken Grotesk", "sans-serif"],
        "headline-sm": ["Hanken Grotesk", "sans-serif"],
        "title-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "sans-serif"],
        "data-mono": ["Plus Jakarta Sans", "sans-serif"],
        "label-caps": ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        gutter: "20px",
        "sidebar-width": "260px",
        "container-max": "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
