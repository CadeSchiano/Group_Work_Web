export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-mist/80">{label}</span>
      <input
        className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint ${className}`}
        {...props}
      />
      {error ? <span className="text-sm text-coral">{error}</span> : null}
    </label>
  );
}
