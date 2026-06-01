import { Loader2 } from "lucide-react";

const ButtonLoader = ({ text = "Processing...", className = "" }) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 size={18} className="animate-spin" />
      <span>{text}</span>
    </div>
  );
};

export default ButtonLoader;
