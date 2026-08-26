import { Search } from "lucide-react";

export function GlobalSearch({ orgSlug, defaultValue = "", compact = false }: { orgSlug: string; defaultValue?: string; compact?: boolean }) {
  return (
    <form className={`global-search${compact ? " compact" : ""}`} action={`/app/${orgSlug}/buscar`} method="get" role="search">
      <Search size={17} aria-hidden="true" />
      <input name="q" defaultValue={defaultValue} type="search" placeholder="Buscar obligaciones, controles o acciones…" aria-label="Buscar en la organización" />
      <button type="submit" className="search-submit">Buscar</button>
    </form>
  );
}
