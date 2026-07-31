const variants = {
  primary: "border-0 bg-brand text-white shadow-[0_12px_24px_rgba(221,94,103,0.25)] hover:bg-brandDark hover:shadow-[0_18px_34px_rgba(209,34,51,0.28)]",
  secondary: "border border-brand bg-white text-brand shadow-sm hover:border-brandDark hover:bg-paper hover:text-brandDark",
  ghost: "bg-transparent text-ink hover:bg-paper",
  danger: "border-0 bg-danger text-white shadow-[0_12px_24px_rgba(221,94,103,0.25)] hover:bg-brandDark"
};

const Button = ({ children, variant = "primary", className = "", ...props }) => (
  <button
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 py-2.5 text-sm font-semibold transition duration-[250ms] ease-in-out hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
