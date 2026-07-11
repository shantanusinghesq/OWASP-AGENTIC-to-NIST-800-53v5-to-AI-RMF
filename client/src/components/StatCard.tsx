export function StatCard({
  label,
  value,
  color,
  subtitle,
  onClick,
}: {
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  const interactive = !!onClick;
  return (
    <div
      className={`rounded-md p-3 border ${interactive ? "cursor-pointer transition hover:brightness-125" : ""}`}
      style={{
        backgroundColor: `${color}08`,
        borderColor: `${color}30`,
      }}
      {...(interactive
        ? {
            role: "button",
            tabIndex: 0,
            onClick,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            },
          }
        : {})}
    >
      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: `${color}` }}>
        {label}
      </div>
      <div className="text-xl font-bold" style={{ color, fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
      {subtitle && (
        <div className="mt-1" style={{ fontSize: 11, color: "#94A3B8" }}>
          {subtitle}
        </div>
      )}
      {interactive && (
        <div className="mt-1.5 text-[10px] font-semibold" style={{ color }}>
          View →
        </div>
      )}
    </div>
  );
}
