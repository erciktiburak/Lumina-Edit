import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        success: "var(--success)",
        warn: "var(--warn)"
      },
      boxShadow: {
        lumina: "0 10px 30px rgba(0, 0, 0, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
