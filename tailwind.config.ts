import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: "rgb(var(--brand) / <alpha-value>)", accent: "rgb(var(--accent) / <alpha-value>)", gold: "rgb(var(--gold) / <alpha-value>)", canvas: "rgb(var(--canvas) / <alpha-value>)", surface: "rgb(var(--surface) / <alpha-value>)", soft: "rgb(var(--soft) / <alpha-value>)", line: "rgb(var(--line) / <alpha-value>)", ink: "rgb(var(--ink) / <alpha-value>)", mute: "rgb(var(--mute) / <alpha-value>)" }, fontFamily: { sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"] } } },
  plugins: [],
};
export default config;
