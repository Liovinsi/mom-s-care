export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1F2937",
        brand: "#DD5E67",
        brandDark: "#D12233",
        paper: "#FFF4F6",
        line: "#F2D6DA",
        muted: "#777777",
        secondary: "#555555",
        success: "#DD5E67",
        warning: "#D12233",
        danger: "#D12233",
        mint: "#DD5E67",
        coral: "#D12233"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 41, 55, 0.08)",
        luxury: "0 24px 70px rgba(31, 41, 55, 0.12)"
      }
    }
  },
  plugins: []
};
