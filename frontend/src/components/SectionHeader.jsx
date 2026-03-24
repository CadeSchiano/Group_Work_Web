export default function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-mint/80">{eyebrow}</p>
        <h2 className="font-display text-3xl text-white">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-mist/70">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
