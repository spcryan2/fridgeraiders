// the masked fridge from the logo, drawn in code so it scales and can move
const VARIANTS = {
  lime: { body: "#b8f060", detail: "#1f3d2b", mask: "#f6f9ec" },
  forest: { body: "#1f3d2b", detail: "#f6f9ec", mask: "#8cd43a" },
  tile: { body: "#1f3d2b", detail: "#8cd43a", mask: "#f6f9ec" },
};

function RaiderFridge({ variant = "lime", shifty = false, className = "" }) {
  const c = VARIANTS[variant];

  return (
    <svg viewBox="0 0 160 236" className={className} aria-hidden="true">
      <rect x="15" y="0" width="130" height="234" rx="24" fill={c.body} />
      <rect x="15" y="70" width="130" height="7" fill={c.detail} />
      <rect x="116" y="22" width="10" height="38" rx="5" fill={c.detail} />
      <rect x="116" y="176" width="10" height="38" rx="5" fill={c.detail} />
      <rect x="0" y="99" width="160" height="66" rx="33" fill={c.mask} />
      <g
        className={shifty ? "motion-safe:animate-blink" : ""}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <ellipse cx="47" cy="132" rx="19" ry="13" fill="#1f3d2b" />
        <ellipse cx="113" cy="132" rx="19" ry="13" fill="#1f3d2b" />
        <g className={shifty ? "motion-safe:animate-shifty" : ""}>
          <circle cx="52" cy="128" r="4.5" fill="#fff" />
          <circle cx="118" cy="128" r="4.5" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

export default RaiderFridge;
