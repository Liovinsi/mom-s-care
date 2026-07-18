const variants = {
  primary: "bg-gold text-white shadow-[0_14px_30px_rgba(212,175,55,0.28)] hover:bg-goldDark",
  secondary: "border border-line bg-white text-ink hover:border-gold hover:text-gold",
  ghost: "bg-transparent text-ink hover:bg-paper",
  danger: "bg-danger text-white hover:bg-red-800"
};

const Button = ({ children, variant = "primary", className = "", ...props }) => (
  <button
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
