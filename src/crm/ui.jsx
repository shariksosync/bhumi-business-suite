import { useState, useMemo } from "react";
import { useStore } from "./store.jsx";
import { fmtDate, inr0, exportCSV, nextId } from "./utils.js";

export const cx = (...a) => a.filter(Boolean).join(" ");

const P = {
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  leads: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  visit: "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  call: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z",
  quote: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  invoice: "M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2zM8 8h8M8 12h8M8 16h5",
  expense: "M20 7H5a2 2 0 0 1 0-4h13v4M3 5v14a2 2 0 0 0 2 2h15V7M16 14h.01",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  salary: "M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10",
  task: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  chart: "M3 3v18h18M7 16v-4M12 16V8M17 16v-7",
  pie: "M21.2 15.9A10 10 0 1 1 8 2.8M22 12A10 10 0 0 0 12 2v10z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  plus: "M12 5v14M5 12h14", edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z", trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  eyeoff: "M17.9 17.9A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.2 3.2M1 1l22 22",
  print: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  x: "M18 6 6 18M6 6l12 12", chevron: "M9 18l6-6-6-6", down: "M6 9l6 6 6-6", menu: "M3 6h18M3 12h18M3 18h18", back: "M15 18l-6-6 6-6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3", check: "M20 6 9 17l-5-5", card: "M2 5h20v14H2zM2 10h20",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  convert: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3", dot: "M12 12h.01",
};
export function Icon({ n, s = 18, className, sw = 1.7 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#0B1F44" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={cx("shrink-0", className)} aria-hidden="true">
      <path d={P[n] || P.dot} />
    </svg>
  );
}

export function Btn({ v = "secondary", icon, children, className, sm, ...p }) {
  return (
    <button type="button" className={cx("btn", v === "primary" && "btn-primary", v === "ghost" && "btn-ghost", sm && "btn-sm", className)} {...p}>
      {icon && <Icon n={icon} s={sm ? 14 : 16} />}{children}
    </button>
  );
}
export function IconBtn({ n, title, ...p }) {
  return <button type="button" className="btn btn-icon" title={title} aria-label={title} {...p}><Icon n={n} s={16} /></button>;
}

const FILLED = new Set(["Converted", "Paid", "Completed", "Approved", "Accepted", "Present", "Active", "Urgent"]);
export function Badge({ children }) {
  return <span className="badge"><span className={FILLED.has(children) ? "dot" : "dot-o"} />{children}</span>;
}

export function Modal({ title, onClose, children, footer, wide, xl }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8 no-print" style={{ background: "rgb(0 0 0 / 0.35)" }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx("w-full rounded-xl border border-navy bg-white", xl ? "max-w-6xl" : wide ? "max-w-4xl" : "max-w-xl")} style={{ boxShadow: "var(--shadow-pop)" }}>
        <div className="flex items-center justify-between border-b border-navy px-6 py-4">
          <h3 className="text-[16px] font-bold">{title}</h3>
          <IconBtn n="x" title="Close" onClick={onClose} />
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-6 py-4" style={{ borderColor: "var(--line)" }}>{footer}</div>}
      </div>
    </div>
  );
}

export function PrintModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgb(0 0 0 / 0.45)" }}>
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-navy bg-white px-6 py-3">
        <div className="font-bold">{title}</div>
        <div className="flex gap-2">
          <Btn v="primary" icon="print" onClick={() => window.print()}>Print / Save PDF</Btn>
          <Btn icon="x" onClick={onClose}>Close</Btn>
        </div>
      </div>
      <div className="py-8"><div id="print-area"><div className="a4 border border-navy" style={{ boxShadow: "var(--shadow-pop)" }}>{children}</div></div></div>
    </div>
  );
}

export function Confirm({ text, onYes, onClose }) {
  return (
    <Modal title="Please confirm" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn v="primary" icon="trash" onClick={() => { onYes(); onClose(); }}>Delete</Btn></>}>
      <p>{text}</p>
    </Modal>
  );
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-[22px] font-bold tracking-tight">{title}</h1>{sub && <p className="mt-1 text-[13.5px]">{sub}</p>}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Stat({ label, value, icon, hint }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="absolute left-0 top-0 h-full w-1 bg-navy" />
      <div className="flex items-start justify-between">
        <div className="text-[12px] font-semibold uppercase tracking-wider">{label}</div>
        {icon && <span className="grid h-9 w-9 place-items-center rounded-lg border border-navy"><Icon n={icon} s={17} /></span>}
      </div>
      <div className="mt-2 text-[24px] font-bold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-[12px]">{hint}</div>}
    </div>
  );
}

export function Card({ title, action, children, className, pad = true }) {
  return (
    <section className={cx("card", className)}>
      {title && <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--line)" }}><h2 className="text-[14.5px] font-bold">{title}</h2>{action}</div>}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Empty({ text = "No records found", sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-navy"><Icon n="folder" s={20} /></span>
      <div className="font-semibold">{text}</div>{sub && <div className="mt-1 text-[13px]">{sub}</div>}
    </div>
  );
}

export function Table({ columns, rows, actions, onRow, empty, pageSize = 10 }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const p = Math.min(page, pages - 1);
  const slice = rows.slice(p * pageSize, p * pageSize + pageSize);
  if (!rows.length) return <Empty text={empty || "No records found"} sub="Try adjusting your search or filters." />;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr>{columns.map((c) => <th key={c.k || c.label} className={c.right ? "text-right" : ""}>{c.label}</th>)}{actions && <th className="text-right">Actions</th>}</tr></thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={r.id || i} className={onRow ? "cursor-pointer" : ""} onClick={() => onRow && onRow(r)}>
                {columns.map((c) => <td key={c.k || c.label} className={cx(c.right && "text-right", c.bold && "font-semibold", "whitespace-nowrap")}>{c.render ? c.render(r) : c.type === "date" ? fmtDate(r[c.k]) : c.type === "money" ? inr0(r[c.k]) : r[c.k] ?? "—"}</td>)}
                {actions && <td className="text-right" onClick={(e) => e.stopPropagation()}><div className="inline-flex gap-1">{actions(r)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3 text-[13px]" style={{ borderColor: "var(--line)" }}>
          <span>Showing {p * pageSize + 1}–{Math.min(rows.length, (p + 1) * pageSize)} of {rows.length}</span>
          <div className="flex gap-1"><Btn sm disabled={p === 0} onClick={() => setPage(p - 1)}>Previous</Btn><Btn sm disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Next</Btn></div>
        </div>
      )}
    </div>
  );
}

export function BarChart({ data, height = 190, fmt = inr0 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end">
            <div className="mb-1 text-[10.5px] font-semibold opacity-0 transition group-hover:opacity-100">{fmt(d.value)}</div>
            <div className="w-full max-w-[44px] rounded-t-md border border-navy bg-navy transition-all" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 border-t border-navy pt-2">{data.map((d) => <div key={d.label} className="flex-1 truncate text-center text-[11px] font-medium">{d.label}</div>)}</div>
    </div>
  );
}
export function HBars({ data, fmt = inr0 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <Empty text="No data for this period" />;
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-[12.5px]"><span className="truncate font-medium">{d.label}</span><span className="font-semibold">{fmt(d.value)}</span></div>
          <div className="h-2.5 rounded-full border border-navy bg-white"><div className="h-full rounded-full bg-navy" style={{ width: `${(d.value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return <div className="flex flex-wrap gap-1">{tabs.map((t) => <button key={t} type="button" className="tab" data-on={value === t ? "1" : "0"} onClick={() => onChange(t)}>{t}</button>)}</div>;
}

export function SearchBox({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="relative w-full sm:w-72">
      <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon n="search" s={16} /></span>
      <input className="inp pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

/* ---------- Generic form ---------- */
export function Field({ f, value, onChange, db }) {
  const opts = typeof f.options === "function" ? f.options(db) : f.options || [];
  const norm = opts.map((o) => (typeof o === "object" ? o : { v: o, l: o }));
  let el;
  if (f.type === "select") el = <select className="inp" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={f.disabled}><option value="">Select…</option>{norm.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>;
  else if (f.type === "textarea") el = <textarea className="inp" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.ph} />;
  else if (f.type === "image") el = (
    <div className="flex items-center gap-3">
      <Avatar name={f.nameFor || "?"} photo={value} size={44} />
      <input type="file" accept="image/*" className="text-[13px]" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => onChange(r.result); r.readAsDataURL(file); }} />
      {value && <Btn sm onClick={() => onChange("")}>Remove</Btn>}
    </div>
  );
  else el = <input className="inp" type={f.type || "text"} value={value ?? ""} onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? "" : +e.target.value) : e.target.value)} placeholder={f.ph} disabled={f.disabled} />;
  return <label className={cx("block", f.full && "sm:col-span-2", f.wide3 && "lg:col-span-3")}><span className="lbl">{f.label}{f.required && " *"}</span>{el}</label>;
}
export function FormGrid({ fields, value, setValue, db, cols = 2 }) {
  return (
    <div className={cx("grid grid-cols-1 gap-4", cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
      {fields.filter((f) => !f.hidden).map((f) => <Field key={f.k} f={f} db={db} value={value[f.k]} onChange={(v) => setValue({ ...value, [f.k]: v })} />)}
    </div>
  );
}

export function Avatar({ name, photo, size = 34 }) {
  const ini = (name || "?").split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  return photo ? <img src={photo} alt={name} className="rounded-full border border-navy object-cover" style={{ width: size, height: size }} />
    : <span className="grid shrink-0 place-items-center rounded-full border-2 border-navy bg-white font-bold" style={{ width: size, height: size, fontSize: size * 0.36 }}>{ini}</span>;
}

/* ---------- Generic CRUD page ---------- */
export function CrudPage({ title, sub, col, prefix, fields, columns, filters = [], scope, defaults, derive, canAdd = true, canEdit = () => true, canDelete = () => true, rowActions, onView, viewTitle, csv, addLabel, extraHead, validate }) {
  const s = useStore();
  const { db } = s;
  const [q, setQ] = useState("");
  const [f, setF] = useState({});
  const [edit, setEdit] = useState(null);
  const [view, setView] = useState(null);
  const [del, setDel] = useState(null);
  const [err, setErr] = useState("");

  const rows = useMemo(() => {
    let r = scope ? scope(db[col]) : db[col];
    const qq = q.trim().toLowerCase();
    return r.filter((x) => (!qq || columns.some((c) => String(c.text ? c.text(x) : x[c.k] ?? "").toLowerCase().includes(qq)) || String(x.id).toLowerCase().includes(qq))
      && filters.every((fl) => !f[fl.k] || (fl.match ? fl.match(x, f[fl.k]) : String(x[fl.k]) === f[fl.k])));
  }, [db, col, q, f, scope]);

  const save = () => {
    const missing = fields.filter((x) => x.required && !x.hidden && (edit[x.k] === "" || edit[x.k] == null));
    if (missing.length) return setErr("Please fill: " + missing.map((m) => m.label).join(", "));
    const v = validate && validate(edit, db);
    if (v) return setErr(v);
    const item = edit.id ? edit : { ...edit, id: nextId(db[col], prefix) };
    s.upsert(col, item); s.notify(edit.id ? "Record updated" : "Record created"); setEdit(null);
  };
  const setVal = (v) => setEdit(derive ? derive(v, edit, db) : v);

  return (
    <div>
      <PageHead title={title} sub={sub}>
        {extraHead}
        {csv && <Btn icon="download" onClick={() => exportCSV(col + ".csv", ["ID", ...columns.map((c) => c.label)], rows.map((r) => [r.id, ...columns.map((c) => (c.text ? c.text(r) : r[c.k]))]))}>Export CSV</Btn>}
        {canAdd && <Btn v="primary" icon="plus" onClick={() => { setErr(""); setEdit(defaults ? defaults() : {}); }}>{addLabel || "Add New"}</Btn>}
      </PageHead>
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4" style={{ borderColor: "var(--line)" }}>
          <SearchBox value={q} onChange={setQ} />
          {filters.map((fl) => {
            const opts = typeof fl.options === "function" ? fl.options(db) : fl.options;
            return fl.type === "month" ? <input key={fl.k} type="month" className="inp w-44" value={f[fl.k] || ""} onChange={(e) => setF({ ...f, [fl.k]: e.target.value })} />
              : <select key={fl.k} className="inp w-44" value={f[fl.k] || ""} onChange={(e) => setF({ ...f, [fl.k]: e.target.value })}><option value="">{fl.label}: All</option>{opts.map((o) => { const x = typeof o === "object" ? o : { v: o, l: o }; return <option key={x.v} value={x.v}>{x.l}</option>; })}</select>;
          })}
          {(q || Object.values(f).some(Boolean)) && <Btn sm v="ghost" icon="x" onClick={() => { setQ(""); setF({}); }}>Clear</Btn>}
          <span className="ml-auto text-[12.5px] font-semibold">{rows.length} records</span>
        </div>
        <Table columns={columns} rows={rows} onRow={(r) => (onView ? onView(r) : setView(r))}
          actions={(r) => (<>
            {rowActions && rowActions(r)}
            <IconBtn n="eye" title="View" onClick={() => (onView ? onView(r) : setView(r))} />
            {canEdit(r) && <IconBtn n="edit" title="Edit" onClick={() => { setErr(""); setEdit({ ...r }); }} />}
            {canDelete(r) && <IconBtn n="trash" title="Delete" onClick={() => setDel(r)} />}
          </>)} />
      </div>

      {edit && (
        <Modal wide title={(edit.id ? "Edit " : "New ") + (viewTitle || title)} onClose={() => setEdit(null)} footer={<><Btn onClick={() => setEdit(null)}>Cancel</Btn><Btn v="primary" icon="check" onClick={save}>Save</Btn></>}>
          {err && <div className="mb-4 rounded-lg border-2 border-navy px-3 py-2 text-[13px] font-semibold">{err}</div>}
          <FormGrid fields={fields.map((x) => (x.type === "image" ? { ...x, nameFor: edit.name } : x))} value={edit} setValue={setVal} db={db} />
        </Modal>
      )}
      {view && (
        <Modal wide title={(viewTitle || title) + " · " + view.id} onClose={() => setView(null)}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {fields.filter((x) => x.type !== "image" && x.k !== "password").map((x) => {
              const opts = typeof x.options === "function" ? x.options(db) : x.options || [];
              const o = opts.find((o) => typeof o === "object" && o.v === view[x.k]);
              const val = o ? o.l : x.type === "date" ? fmtDate(view[x.k]) : view[x.k];
              return <div key={x.k} className={x.full ? "sm:col-span-2" : ""}><div className="text-[11.5px] font-semibold uppercase tracking-wider">{x.label}</div><div className="mt-1 font-medium">{val === "" || val == null ? "—" : String(val)}</div></div>;
            })}
          </div>
        </Modal>
      )}
      {del && <Confirm text={`Delete ${del.id}? This cannot be undone.`} onYes={() => { s.remove(col, del.id); s.notify("Record deleted"); }} onClose={() => setDel(null)} />}
    </div>
  );
}

export const empOptions = (db) => db.employees.map((e) => ({ v: e.id, l: e.name }));
export const leadOptions = (db) => db.leads.map((l) => ({ v: l.id, l: `${l.id} · ${l.client}` }));
