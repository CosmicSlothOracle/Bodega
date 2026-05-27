interface TopbarProps {
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, eyebrow, actions }: TopbarProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        {eyebrow ? (
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-bloom-ochre/90 mb-2">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl sm:text-4xl text-bloom-cream">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  );
}
