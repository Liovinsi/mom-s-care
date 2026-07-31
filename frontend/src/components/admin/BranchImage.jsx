import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";

const BranchImage = ({ src, alt, className = "", fallbackClassName = "", label = "No Image Available" }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`grid place-items-center rounded-lg border border-line bg-brand/10 text-center text-brand ${fallbackClassName || className}`}>
        <div className="px-2">
          <Building2 className="mx-auto h-5 w-5" />
          <p className="mt-1 text-[10px] font-bold leading-tight text-ink">{label}</p>
        </div>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
};

export default BranchImage;
