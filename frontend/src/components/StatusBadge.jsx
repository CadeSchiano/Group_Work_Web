const classes = {
  TODO: "bg-white/10 text-mist",
  IN_PROGRESS: "bg-sky-500/20 text-sky-200",
  DONE: "bg-emerald-500/20 text-emerald-200",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status] || classes.TODO}`}>
      {status.replace("_", " ")}
    </span>
  );
}
