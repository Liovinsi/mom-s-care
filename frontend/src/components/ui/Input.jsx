const Input = ({ label, className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>}
    <input
      className={`min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/25 ${className}`}
      {...props}
    />
  </label>
);

export default Input;
