export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-panel/70 p-6 shadow-glow backdrop-blur ${className}`}>
      {children}
    </div>
  );
}
