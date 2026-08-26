import Link from "next/link";
import { Search } from "lucide-react";
import { GlobalSearch } from "@/components/portal/global-search";
import { StatusBadge } from "@/components/portal/status-badge";
import { getOrganizationContext } from "@/lib/portal";
import { searchOrganizationData } from "@/lib/data/portal-data";

export default async function SearchPage({ params, searchParams }: { params: Promise<{ orgSlug: string }>; searchParams: Promise<{ q?: string }> }) {
  const { orgSlug } = await params;
  const { q = "" } = await searchParams;
  const { organization } = await getOrganizationContext(orgSlug);
  const results = await searchOrganizationData(organization.id, q);
  const total = results.obligations.length + results.controls.length + results.actions.length;

  return (
    <div className="content">
      <div className="page-head"><div><span className="eyebrow">Búsqueda global</span><h1>Resultados</h1><p>La búsqueda se limita a {organization.name} y respeta los permisos de la sesión.</p></div></div>
      <GlobalSearch orgSlug={orgSlug} defaultValue={q} />
      <div className="search-summary">{q ? <><strong>{total}</strong> resultados para “{q}”</> : "Escribe un término para buscar."}</div>
      <div className="search-result-grid">
        <section className="card"><div className="card-head"><div><h2>Obligaciones</h2><p>{results.obligations.length} coincidencias</p></div></div><div className="card-body search-list">{results.obligations.map((item: any) => <Link href={`/app/${orgSlug}/cumplimiento`} key={item.id} className="search-result"><div><span className="result-type">{item.code}</span><strong>{item.title}</strong><p>{item.description || "Sin descripción"}</p></div><StatusBadge value={item.status} /></Link>)}</div></section>
        <section className="card"><div className="card-head"><div><h2>Controles</h2><p>{results.controls.length} coincidencias</p></div></div><div className="card-body search-list">{results.controls.map((item: any) => <Link href={`/app/${orgSlug}/seguridad`} key={item.id} className="search-result"><div><span className="result-type">{item.code}</span><strong>{item.title}</strong><p>{item.description || "Sin descripción"}</p></div><StatusBadge value={item.status} /></Link>)}</div></section>
        <section className="card"><div className="card-head"><div><h2>Acciones</h2><p>{results.actions.length} coincidencias</p></div></div><div className="card-body search-list">{results.actions.map((item: any) => <Link href={`/app/${orgSlug}/acciones`} key={item.id} className="search-result"><div><span className="result-type">Acción</span><strong>{item.title}</strong><p>{item.description || "Sin descripción"}</p></div><StatusBadge value={item.status} /></Link>)}</div></section>
      </div>
      {!q ? <div className="empty-state"><Search size={28} /><h2>Buscar dentro del cliente</h2><p>Obligaciones, controles y acciones se consultan sin salir del contexto de la organización.</p></div> : null}
    </div>
  );
}
