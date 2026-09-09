type Props = { eyebrow: string; title: string; children?: React.ReactNode; align?: "left" | "center" };

export function SectionHeading({ eyebrow, title, children, align = "left" }: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 leading-7 text-ink/70">{children}</p>}
    </div>
  );
}
