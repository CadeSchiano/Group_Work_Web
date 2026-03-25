export default function Input({ label, error, className = "", rightElement, ...props }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-mist/80">{label}</span>
      <div className="relative">
        <input
          className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint ${rightElement ? "pr-20" : ""} ${className}`}
          {...props}
        />
        {rightElement ? (
          <div className="absolute inset-y-0 right-3 flex items-center">{rightElement}</div>
        ) : null}
      </div>
      {error ? <span className="text-sm text-coral">{error}</span> : null}
    </label>
  );
}
