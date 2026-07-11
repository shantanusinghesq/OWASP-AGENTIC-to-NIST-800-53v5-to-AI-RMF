import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function HeatCell({ count, max, riskId, riskName, familyCode }: { count: number; max: number; riskId: string; riskName: string; familyCode: string }) {
  const intensity = max > 0 ? count / max : 0;
  const bg =
    count === 0
      ? "rgba(15,23,42,0.5)"
      : intensity > 0.7
        ? "#1E40AF"
        : intensity > 0.4
          ? "#3B82F6"
          : "#3B82F640";
  const textColor = count === 0 ? "#334155" : intensity > 0.4 ? "white" : "#93C5FD";

  // Control family descriptions
  const familyDescriptions: Record<string, string> = {
    AC: "Access Control: Manages user access, permissions, and authentication to protect systems and data from unauthorized use.",
    AU: "Audit & Accountability: Tracks and logs system activities to enable detection of unauthorized actions and accountability.",
    CA: "Assessment & Authorization: Evaluates security controls and authorizes systems for operation based on risk assessment.",
    CM: "Configuration Management: Controls system configuration changes to maintain baseline integrity and prevent unauthorized modifications.",
    CP: "Contingency Planning: Prepares for disruptions through backup, recovery, and continuity procedures.",
    IA: "Identification & Authentication: Verifies user and system identities through credentials and multi-factor authentication.",
    IR: "Incident Response: Detects, responds to, and recovers from security incidents and breaches.",
    MP: "Media Protection: Protects physical and digital media containing sensitive information from unauthorized access.",
    PE: "Physical & Environmental: Secures physical facilities, equipment, and environmental controls against threats.",
    PL: "Planning: Develops security strategies, policies, and plans aligned with organizational objectives.",
    PM: "Program Management: Oversees security program governance, resource allocation, and compliance.",
    RA: "Risk Assessment: Identifies, analyzes, and evaluates security risks to inform mitigation strategies.",
    SA: "System & Services Acquisition: Ensures security requirements are met in procurement and development of systems and services.",
    SC: "System & Comms Protection: Protects system boundaries and communications channels from unauthorized access and interference.",
    SI: "System & Info Integrity: Maintains system and information integrity through monitoring, validation, and protection mechanisms.",
    SR: "Supply Chain Risk Mgmt: Manages risks from suppliers, vendors, and third-party dependencies.",
  };

  const cell = (
    <td
      className="text-center border border-slate-700/50 transition-all duration-150 hover:brightness-125 cursor-help"
      style={{
        backgroundColor: bg,
        color: textColor,
        padding: "6px 4px",
        fontSize: 11,
        fontWeight: count > 0 ? 700 : 400,
        fontFamily: count > 0 ? "var(--font-mono)" : "inherit",
        minWidth: 36,
      }}
      aria-label={count > 0 ? `${riskId} ${riskName} × ${familyCode}: ${count} controls mapped` : `${riskId} ${riskName} × ${familyCode}: no controls mapped`}
    >
      {count || ""}
    </td>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {cell}
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs font-normal w-80 bg-slate-900 border border-slate-700 text-slate-100">
        <div className="space-y-2 p-2">
          <div className="font-mono font-semibold">{riskId} × {familyCode}</div>
          <div className="text-slate-300 leading-relaxed whitespace-normal">{riskName}</div>
          <div className="text-slate-400 text-[10px]">{familyDescriptions[familyCode]}</div>
          {count > 0 && <div className="text-slate-300 font-semibold pt-1">{count} controls mapped</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
