export default function ProgressBar({ value }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-mist/80">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-mint to-accent transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
