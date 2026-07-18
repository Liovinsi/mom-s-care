const Card = ({ children, className = "" }) => (
  <div className={`rounded-[18px] border border-line bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-luxury ${className}`}>{children}</div>
);

export default Card;
