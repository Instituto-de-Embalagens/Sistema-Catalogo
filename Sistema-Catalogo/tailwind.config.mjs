export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        primary: {
          DEFAULT: "var(--color-primary)",
          soft: "var(--color-primary-soft)",
          deep: "var(--color-primary-deep)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          soft: "var(--color-text-soft)",
          muted: "var(--color-text-muted)",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
};
