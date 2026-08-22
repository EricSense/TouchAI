const preview = [
  { name: "Billion Universe", type: "Business", x: "18%", y: "28%", color: "#c9a96a" },
  { name: "Education Platform", type: "Project", x: "58%", y: "18%", color: "#6b9bd1" },
  { name: "AI Research", type: "Idea", x: "68%", y: "58%", color: "#a78bce" },
  { name: "HAI", type: "Project", x: "22%", y: "68%", color: "#6b9bd1" },
  { name: "Systems Design", type: "Skill", x: "44%", y: "46%", color: "#5eb3b3" },
];

export function LandingPreview() {
  return (
    <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-line bg-void-2">
      <div className="absolute inset-0 grid-fade opacity-80" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 80" preserveAspectRatio="none">
        <line x1="28" y1="32" x2="48" y2="48" stroke="rgba(201,169,106,0.28)" strokeWidth="0.4" />
        <line x1="48" y1="48" x2="66" y2="24" stroke="rgba(201,169,106,0.22)" strokeWidth="0.4" />
        <line x1="48" y1="48" x2="74" y2="60" stroke="rgba(201,169,106,0.22)" strokeWidth="0.4" />
        <line x1="28" y1="32" x2="30" y2="68" stroke="rgba(201,169,106,0.2)" strokeWidth="0.4" />
      </svg>
      {preview.map((node) => (
        <div
          key={node.name}
          className="absolute w-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/8 bg-[#12151d]/90 px-3 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          style={{ left: node.x, top: node.y }}
        >
          <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: node.color }}>
            {node.type}
          </p>
          <p className="mt-1 text-sm text-cream">{node.name}</p>
        </div>
      ))}
    </div>
  );
}
