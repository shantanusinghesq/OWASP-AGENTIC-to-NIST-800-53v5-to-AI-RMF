export function StatCard({ label, value, color, subtitle }: { label: string; value: string | number; color: string; subtitle?: string }) {
  return (
    <div
      className="rounded-md p-3 border"
      style={{
        backgroundColor: `${color}08`,
        borderColor: `${color}30`,
      }}
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
    </div>
  );
}
