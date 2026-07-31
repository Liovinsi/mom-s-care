const SectionHeader = ({ eyebrow, title, description, align = "center", className = "" }) => {
  const centered = align === "center";

  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-secondary">{description}</p>}
    </div>
  );
};

export default SectionHeader;
