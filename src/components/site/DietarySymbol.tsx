import { Leaf, Sprout, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface DietarySymbolProps {
  type: "vegan" | "vegetarian" | "spicy";
  className?: string;
  hideText?: boolean;
}

export const DietarySymbol = ({ type, className, hideText }: DietarySymbolProps) => {
  if (type === "vegan") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[0.65rem] font-medium tracking-wider uppercase opacity-70", className)}>
        <Leaf className="w-3 h-3 text-green-600" />
        {!hideText && <span>vegan</span>}
      </span>
    );
  }

  if (type === "vegetarian") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[0.65rem] font-medium tracking-wider uppercase opacity-70", className)}>
        <Sprout className="w-3 h-3 text-green-500" />
        {!hideText && <span>vegetarisch</span>}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-[0.65rem] font-medium tracking-wider uppercase opacity-70", className)}>
      <Flame className="w-3 h-3 text-orange-600" />
      {!hideText && <span>scharf</span>}
    </span>
  );
};
