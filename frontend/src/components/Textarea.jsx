export default function Textarea({ label, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-mist/80">{label}</span>
      <textarea
        className={`min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint ${className}`}
        {...props}
      />
    </label>
  );
}
