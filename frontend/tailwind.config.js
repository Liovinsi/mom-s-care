export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E1E24",
        gold: "#D4AF37",
        goldDark: "#C39A2C",
        paper: "#F8F8F8",
        line: "#E5E5E5",
        muted: "#777777",
        secondary: "#555555",
        success: "#2E7D32",
        warning: "#F9A825",
        danger: "#C62828",
        mint: "#D4AF37",
        coral: "#C62828"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(30, 30, 36, 0.08)",
        luxury: "0 24px 70px rgba(30, 30, 36, 0.12)"
      }
    }
  },
  plugins: []
};
