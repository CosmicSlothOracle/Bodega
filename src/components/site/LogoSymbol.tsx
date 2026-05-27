import Image from "next/image";

interface LogoSymbolProps {
  className?: string;
}

export function LogoSymbol({ className }: LogoSymbolProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/assets/logo_rot.png"
        alt="Bodega Logo Symbol"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
