export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const styles = {
    primary: "bg-accent text-ink hover:bg-amber-300",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    ghost: "bg-transparent text-mist hover:bg-white/10",
  };

  return (
    <button
      className={`rounded-2xl px-4 py-3 font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
