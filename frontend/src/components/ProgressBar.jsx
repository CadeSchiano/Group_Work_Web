export default function ProgressBar({ value }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-mist/80">
        <span>Progress</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-mint to-accent transition-all duration-300"
          style={{ width: safeValue ? `${safeValue}%` : "0%" }}
        />
      </div>
    </div>
  );
}
