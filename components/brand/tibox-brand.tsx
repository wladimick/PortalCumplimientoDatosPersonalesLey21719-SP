export function TiboxBrand({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo-lockup${light ? " is-light" : ""}`} aria-label="TIBOX Compliance">
      <span className="logo-mark" aria-hidden="true" />
      <span>TIBOX <span style={{ fontWeight: 600, opacity: .72 }}>Compliance</span></span>
    </div>
  );
}
