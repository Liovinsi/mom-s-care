const Card = ({ children, className = "" }) => (
  <div className={`rounded-[18px] border border-line bg-white p-5 shadow-soft transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-paper hover:shadow-luxury dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 ${className}`}>{children}</div>
);

export default Card;
