const Input = ({ label, className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-2 block text-sm font-semibold text-ink dark:text-slate-100">{label}</span>}
    <input
      className={`min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/25 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:disabled:bg-slate-900 dark:disabled:text-slate-400 ${className}`}
      {...props}
    />
  </label>
);

export default Input;
