"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Columns3, Download, Search, X } from "lucide-react";
import { StatusBadge, statusLabel } from "@/components/portal/status-badge";

export type DataColumn = {
  key: string;
  label: string;
  defaultVisible?: boolean;
  sortable?: boolean;
  kind?: "text" | "badge" | "date" | "multiline";
  secondaryKey?: string;
};

type Row = Record<string, string | number | null | undefined>;

function text(value: unknown) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function date(value: unknown) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CL").format(new Date(`${String(value).slice(0, 10)}T12:00:00`));
}

function safeCsvCell(value: unknown) {
  const raw = text(value);
  return /^\s*[=+\-@]/.test(raw) ? `'${raw}` : raw;
}

export function DataTable({
  id,
  columns,
  rows,
  searchPlaceholder = "Filtrar tabla…",
  filterKey,
  filterLabel = "Estado",
}: {
  id: string;
  columns: DataColumn[];
  rows: Row[];
  searchPlaceholder?: string;
  filterKey?: string;
  filterLabel?: string;
}) {
  const defaultKeys = columns.filter((column) => column.defaultVisible !== false).map((column) => column.key);
  const [visible, setVisible] = useState<string[]>(defaultKeys);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState(columns.find((column) => column.sortable !== false)?.key || columns[0]?.key || "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const raw = localStorage.getItem(`tbx-table-columns:${id}`);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as string[];
      const valid = saved.filter((key) => columns.some((column) => column.key === key));
      if (valid.length) setVisible(valid);
    } catch {
      // Si la preferencia quedó corrupta, mantenemos las columnas por defecto.
    }
  }, [id, columns]);

  const setColumns = (next: string[]) => {
    setVisible(next);
    localStorage.setItem(`tbx-table-columns:${id}`, JSON.stringify(next));
  };

  const filterOptions = useMemo(
    () => !filterKey ? [] : Array.from(new Set(rows.map((row) => text(row[filterKey])).filter((value) => value !== "—"))).sort(),
    [rows, filterKey],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    const list = rows.filter((row) => {
      const matchesText = !needle || Object.values(row).some((value) => text(value).toLocaleLowerCase("es").includes(needle));
      const matchesFilter = !filterKey || filter === "all" || text(row[filterKey]) === filter;
      return matchesText && matchesFilter;
    });

    return [...list].sort((a, b) => {
      const left = text(a[sortKey]).toLocaleLowerCase("es");
      const right = text(b[sortKey]).toLocaleLowerCase("es");
      const result = left.localeCompare(right, "es", { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
  }, [rows, query, filterKey, filter, sortKey, sortDirection]);

  const activeColumns = columns.filter((column) => visible.includes(column.key));

  const sortBy = (key: string) => {
    if (sortKey === key) setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const exportCsv = () => {
    const header = activeColumns.map((column) => column.label);
    const body = filtered.map((row) => activeColumns.map((column) => safeCsvCell(row[column.key])));
    const csv = [header, ...body]
      .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${id}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="smart-table">
      <div className="table-toolbar">
        <label className="table-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Limpiar filtro"><X size={15} /></button> : null}
        </label>
        {filterKey ? (
          <label className="table-filter">
            <span>{filterLabel}</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">Todos</option>
              {filterOptions.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}
            </select>
          </label>
        ) : null}
        <details className="column-menu">
          <summary className="btn btn-secondary"><Columns3 size={17} /> Columnas</summary>
          <div className="column-popover">
            <strong>Mostrar columnas</strong>
            {columns.map((column) => (
              <label key={column.key}>
                <input
                  type="checkbox"
                  checked={visible.includes(column.key)}
                  onChange={(event) => {
                    const next = event.target.checked ? [...visible, column.key] : visible.filter((key) => key !== column.key);
                    if (next.length) setColumns(next);
                  }}
                /> {column.label}
              </label>
            ))}
            <button type="button" className="text-button" onClick={() => setColumns(defaultKeys)}>Restablecer</button>
          </div>
        </details>
        <button type="button" className="btn btn-secondary" onClick={exportCsv}><Download size={17} /> Exportar CSV</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {activeColumns.map((column) => (
                <th key={column.key}>
                  {column.sortable === false ? column.label : (
                    <button type="button" className="th-sort" onClick={() => sortBy(column.key)}>
                      {column.label}
                      {sortKey === column.key ? (sortDirection === "asc" ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />) : null}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((row, index) => (
              <tr key={String(row.id || index)}>
                {activeColumns.map((column) => {
                  const value = row[column.key];
                  if (column.kind === "badge") return <td key={column.key}><StatusBadge value={text(value)} /></td>;
                  if (column.kind === "date") return <td key={column.key} className="small muted">{date(value)}</td>;
                  if (column.kind === "multiline") {
                    return <td key={column.key}><div className="table-title">{text(value)}</div>{column.secondaryKey && row[column.secondaryKey] ? <div className="table-sub">{text(row[column.secondaryKey])}</div> : null}</td>;
                  }
                  return <td key={column.key}>{text(value)}</td>;
                })}
              </tr>
            )) : (
              <tr><td colSpan={activeColumns.length}><div className="table-empty">No hay resultados para los filtros actuales.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer"><span>{filtered.length} de {rows.length} registros</span><span>Las columnas visibles se guardan en este navegador.</span></div>
    </div>
  );
}
