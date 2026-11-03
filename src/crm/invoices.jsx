import { useState, useEffect, useMemo } from "react";
import { useStore } from "./store.jsx";
import { useNav } from "./nav.js";
import { PageHead, Btn, IconBtn, Badge, Table, SearchBox, Confirm, PrintModal, Card, FormGrid, Modal, Stat, empOptions } from "./ui.jsx";
import { ItemsEditor, Totals } from "./items.jsx";
import { InvoiceDoc } from "./docs.jsx";
import { createInvoiceFrom, nextNumber } from "./quotations.jsx";
import { INV_STATUSES, PAY_MODES } from "./data.js";
import { calcDoc, invTotals, inr, inr0, fmtDate, today, uid, STATES, stateCode, nextId, r2 } from "./utils.js";

export const projectStats = (db, pid) => {
  const invs = db.invoices.filter((i) => i.projectId === pid);
  const t = invs.map((i) => invTotals(i));
  return { count: invs.length, total: r2(t.reduce((a, x) => a + x.total, 0)), paid: r2(t.reduce((a, x) => a + x.paid, 0)), out: r2(t.reduce((a, x) => a + x.balance, 0)) };
};

export function Invoices() {
  const { params } = useNav();
  const [view, setView] = useState({ mode: "list" });
  useEffect(() => { if (params?.projectId) setView(params.invId ? { mode: "edit", projectId: params.projectId, invId: params.invId } : { mode: "project", id: params.projectId }); }, [params]);
  if (view.mode === "project") return <ProjectDetail id={view.id} go={setView} />;
  if (view.mode === "edit") return <InvoiceEditor projectId={view.projectId} invId={view.invId} go={setView} />;
  return <ProjectList go={setView} />;
}

const projFields = (s) => [
  { k: "name", label: "Project Name", required: true }, { k: "client", label: "Client Name", required: true }, { k: "contact", label: "Contact Person" }, { k: "mobile", label: "Mobile" },
  { k: "email", label: "Email" }, { k: "gstin", label: "GSTIN" }, { k: "pan", label: "PAN" }, { k: "state", label: "State", type: "select", options: STATES.map((x) => x[0]), required: true },
  { k: "address", label: "Address", full: true }, { k: "assignedTo", label: "Assigned Employee", type: "select", options: empOptions, disabled: !s.isAdmin },
  { k: "status", label: "Project Status", type: "select", options: ["Active", "On Hold", "Completed"] },
];

function ProjectList({ go }) {
  const s = useStore();
  const [q, setQ] = useState(""); const [st, setSt] = useState(""); const [edit, setEdit] = useState(null); const [del, setDel] = useState(null);
  const rows = useMemo(() => {
    const base = s.isAdmin ? s.db.projects : s.db.projects.filter((p) => p.assignedTo === s.user.id);
    const qq = q.toLowerCase();
    return base.filter((p) => (!st || p.status === st) && (!qq || [p.id, p.name, p.client, p.contact, p.mobile, p.gstin].join(" ").toLowerCase().includes(qq))).map((p) => ({ ...p, ...projectStats(s.db, p.id) }));
  }, [s.db, q, st]);
  const tot = rows.reduce((a, r) => ({ total: a.total + r.total, paid: a.paid + r.paid, out: a.out + r.out, count: a.count + r.count }), { total: 0, paid: 0, out: 0, count: 0 });
  const save = () => {
    if (!edit.name || !edit.client || !edit.state) return s.notify("Project name, client and state are required");
    const item = { ...edit, stateCode: stateCode(edit.state), id: edit.id || nextId(s.db.projects, "PRJ") };
    s.upsert("projects", item); s.notify("Project saved"); setEdit(null);
  };
  return (
    <div>
      <PageHead title="Tax Invoice · Projects" sub="Select a project to view and raise its tax invoices.">
        <Btn v="primary" icon="plus" onClick={() => setEdit({ status: "Active", assignedTo: s.user.id, state: s.db.settings.company.state, startDate: today() })}>New Project</Btn>
      </PageHead>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Projects" value={rows.length} icon="folder" /><Stat label="Invoices" value={tot.count} icon="invoice" />
        <Stat label="Total Invoiced" value={inr0(tot.total)} icon="chart" /><Stat label="Outstanding" value={inr0(tot.out)} icon="card" />
      </div>
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4" style={{ borderColor: "var(--line)" }}>
          <SearchBox value={q} onChange={setQ} placeholder="Search project, client, GSTIN…" />
          <select className="inp w-44" value={st} onChange={(e) => setSt(e.target.value)}><option value="">Status: All</option>{["Active", "On Hold", "Completed"].map((x) => <option key={x}>{x}</option>)}</select>
        </div>
        <Table rows={rows} onRow={(r) => go({ mode: "project", id: r.id })}
          columns={[{ k: "id", label: "Project ID", bold: true }, { k: "name", label: "Project" }, { k: "client", label: "Client" }, { k: "contact", label: "Contact" }, { k: "mobile", label: "Mobile" }, { k: "gstin", label: "GSTIN" },
            { label: "Assigned", render: (r) => s.empName(r.assignedTo) }, { k: "count", label: "Invoices", right: true }, { k: "total", label: "Invoiced", type: "money", right: true }, { k: "paid", label: "Paid", type: "money", right: true }, { k: "out", label: "Outstanding", type: "money", right: true, bold: true }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]}
          actions={(r) => (<><IconBtn n="eye" title="Open" onClick={() => go({ mode: "project", id: r.id })} /><IconBtn n="edit" title="Edit" onClick={() => setEdit(r)} />{s.isAdmin && <IconBtn n="trash" title="Delete" onClick={() => setDel(r)} />}</>)} />
      </div>
      {edit && <Modal wide title={edit.id ? "Edit Project" : "New Project"} onClose={() => setEdit(null)} footer={<><Btn onClick={() => setEdit(null)}>Cancel</Btn><Btn v="primary" icon="check" onClick={save}>Save Project</Btn></>}><FormGrid fields={projFields(s)} value={edit} setValue={setEdit} db={s.db} /></Modal>}
      {del && <Confirm text={del.count ? `Project ${del.name} has ${del.count} invoices. Deleting it will also delete those invoices.` : `Delete project ${del.name}?`} onYes={() => { s.remove("projects", del.id); s.set("invoices", (l) => l.filter((i) => i.projectId !== del.id)); s.notify("Project deleted"); }} onClose={() => setDel(null)} />}
    </div>
  );
}

function ProjectDetail({ id, go }) {
  const s = useStore();
  const p = s.db.projects.find((x) => x.id === id);
  const [print, setPrint] = useState(null); const [pay, setPay] = useState(null); const [hist, setHist] = useState(null); const [del, setDel] = useState(null); const [stat, setStat] = useState(null);
  if (!p) return <div className="card p-8"><Btn icon="back" onClick={() => go({ mode: "list" })}>Back to projects</Btn><p className="mt-4">Project not found.</p></div>;
  const invs = s.db.invoices.filter((i) => i.projectId === id).map((i) => ({ ...i, ...invTotals(i) })).sort((a, b) => (a.date < b.date ? 1 : -1));
  const ps = projectStats(s.db, id);
  const createNew = () => { const { inv, bump } = createInvoiceFrom(s, p, {}); go({ mode: "edit", projectId: id, invId: null, draft: inv }); };
  const duplicate = (inv) => { const { inv: n, bump } = createInvoiceFrom(s, p, { items: inv.items.map((x) => ({ ...x })), notes: inv.notes, ref: inv.number }); s.upsert("invoices", n); bump(); s.notify(`Duplicated as ${n.number}`); };
  return (
    <div>
      <PageHead title={p.name} sub={`${p.id} · ${p.client}`}>
        <Btn icon="back" onClick={() => go({ mode: "list" })}>All Projects</Btn>
        <Btn v="primary" icon="plus" onClick={createNew}>Create New Invoice</Btn>
      </PageHead>
      <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_auto]">
        <Card title="Project & Client Information" action={<Badge>{p.status}</Badge>}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
            {[["Client", p.client], ["Contact", p.contact], ["Mobile", p.mobile], ["Email", p.email], ["GSTIN", p.gstin], ["PAN", p.pan], ["State", `${p.state} (${p.stateCode})`], ["Assigned", s.empName(p.assignedTo)], ["Address", p.address]].map(([k, v]) => <div key={k} className={k === "Address" ? "col-span-2" : ""}><div className="text-[11px] font-semibold uppercase tracking-wider">{k}</div><div className="mt-0.5 font-medium">{v || "—"}</div></div>)}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4 lg:w-[380px]">
          <Stat label="Invoices" value={ps.count} /><Stat label="Invoiced" value={inr0(ps.total)} /><Stat label="Received" value={inr0(ps.paid)} /><Stat label="Outstanding" value={inr0(ps.out)} />
        </div>
      </div>
      <Card title={`Invoices (${invs.length})`} pad={false}>
        <Table rows={invs} empty="No invoices yet for this project" onRow={(r) => go({ mode: "edit", projectId: id, invId: r.id })}
          columns={[{ k: "number", label: "Invoice No.", bold: true }, { k: "date", label: "Date", type: "date" }, { k: "due", label: "Due", type: "date" }, { label: "Services", render: (r) => <span className="inline-block max-w-[220px] truncate align-bottom">{r.items.map((i) => i.service).join(", ")}</span> },
            { k: "total", label: "Total", right: true, render: (r) => inr(r.total) }, { k: "paid", label: "Received", right: true, render: (r) => inr(r.paid) }, { k: "balance", label: "Balance", right: true, bold: true, render: (r) => inr(r.balance) }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]}
          actions={(r) => (<>
            <IconBtn n="card" title="Add Payment" onClick={() => setPay(r)} />
            <IconBtn n="clock" title="Payment History" onClick={() => setHist(r)} />
            <IconBtn n="print" title="Print / PDF" onClick={() => setPrint(r)} />
            <IconBtn n="copy" title="Duplicate" onClick={() => duplicate(r)} />
            <IconBtn n="check" title="Update Status" onClick={() => setStat(r)} />
            <IconBtn n="edit" title="Edit" onClick={() => go({ mode: "edit", projectId: id, invId: r.id })} />
            {s.isAdmin && <IconBtn n="trash" title="Delete" onClick={() => setDel(r)} />}
          </>)} />
      </Card>
      {print && <PrintModal title={print.number} onClose={() => setPrint(null)}><InvoiceDoc inv={print} project={p} /></PrintModal>}
      {pay && <PaymentModal inv={s.db.invoices.find((i) => i.id === pay.id)} onClose={() => setPay(null)} />}
      {hist && <HistoryModal inv={s.db.invoices.find((i) => i.id === hist.id)} onClose={() => setHist(null)} onAdd={() => { setPay(hist); setHist(null); }} />}
      {stat && <StatusModal inv={s.db.invoices.find((i) => i.id === stat.id)} onClose={() => setStat(null)} />}
      {del && <Confirm text={`Delete invoice ${del.number}? Its payments will also be removed.`} onYes={() => { s.remove("invoices", del.id); s.notify("Invoice deleted"); }} onClose={() => setDel(null)} />}
    </div>
  );
}

export function PaymentModal({ inv, onClose }) {
  const s = useStore(); const t = invTotals(inv);
  const [v, setV] = useState({ date: today(), amount: t.balance, mode: "Bank Transfer", ref: "", notes: "" });
  const [err, setErr] = useState("");
  const save = () => {
    const amt = r2(v.amount);
    if (!(amt > 0)) return setErr("Enter a payment amount greater than zero.");
    if (amt > t.balance) return setErr(`Amount cannot exceed the outstanding balance of ${inr(t.balance)}.`);
    s.upsert("invoices", { ...inv, payments: [...(inv.payments || []), { ...v, amount: amt, id: "p" + uid() }] });
    s.notify(`Payment of ${inr(amt)} recorded`); onClose();
  };
  return (
    <Modal title={`Add Payment · ${inv.number}`} onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn v="primary" icon="check" onClick={save} disabled={t.balance <= 0}>Record Payment</Btn></>}>
      <div className="mb-4 grid grid-cols-3 gap-3 text-center">{[["Invoice Total", t.total], ["Received", t.paid], ["Outstanding", t.balance]].map(([k, x]) => <div key={k} className="rounded-lg border border-navy p-3"><div className="text-[11px] font-semibold uppercase">{k}</div><div className="mt-1 font-bold">{inr(x)}</div></div>)}</div>
      {t.balance <= 0 && <div className="mb-3 rounded-lg border-2 border-navy p-3 font-semibold">This invoice is fully paid.</div>}
      {err && <div className="mb-3 rounded-lg border-2 border-navy p-3 text-[13px] font-semibold">{err}</div>}
      <FormGrid value={v} setValue={(x) => { setErr(""); setV(x); }} db={s.db} fields={[{ k: "date", label: "Payment Date", type: "date" }, { k: "amount", label: "Amount (₹)", type: "number" }, { k: "mode", label: "Payment Mode", type: "select", options: PAY_MODES }, { k: "ref", label: "Transaction Reference" }, { k: "notes", label: "Payment Notes", full: true }]} />
    </Modal>
  );
}
function HistoryModal({ inv, onClose, onAdd }) {
  const s = useStore(); const t = invTotals(inv);
  return (
    <Modal wide title={`Payment History · ${inv.number}`} onClose={onClose} footer={<><Btn onClick={onClose}>Close</Btn>{t.balance > 0 && <Btn v="primary" icon="plus" onClick={onAdd}>Add Payment</Btn>}</>}>
      <div className="mb-4 flex flex-wrap gap-6 font-semibold"><span>Total: {inr(t.total)}</span><span>Received: {inr(t.paid)}</span><span>Balance: {inr(t.balance)}</span><Badge>{t.status}</Badge></div>
      <div className="rounded-xl border border-navy"><Table rows={inv.payments || []} empty="No payments recorded" columns={[{ k: "date", label: "Date", type: "date" }, { k: "amount", label: "Amount", right: true, render: (r) => inr(r.amount) }, { k: "mode", label: "Mode" }, { k: "ref", label: "Reference" }, { k: "notes", label: "Notes" }]}
        actions={s.isAdmin ? (r) => <IconBtn n="trash" title="Remove payment" onClick={() => { s.upsert("invoices", { ...inv, payments: inv.payments.filter((p) => p.id !== r.id) }); s.notify("Payment removed"); }} /> : undefined} /></div>
    </Modal>
  );
}
function StatusModal({ inv, onClose }) {
  const s = useStore(); const [v, setV] = useState(inv.statusOverride || "");
  return (
    <Modal title={`Update Status · ${inv.number}`} onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn v="primary" icon="check" onClick={() => { s.upsert("invoices", { ...inv, statusOverride: v }); s.notify("Status updated"); onClose(); }}>Save</Btn></>}>
      <p className="mb-3 text-[13px]">Status is calculated automatically from payments and due date. You may override it manually.</p>
      <select className="inp" value={v} onChange={(e) => setV(e.target.value)}><option value="">Automatic ({invTotals({ ...inv, statusOverride: "" }).status})</option>{INV_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
    </Modal>
  );
}

function InvoiceEditor({ projectId, invId, go }) {
  const s = useStore(); const set = s.db.settings;
  const p = s.db.projects.find((x) => x.id === projectId);
  const existing = invId && s.db.invoices.find((i) => i.id === invId);
  const [v, setV] = useState(() => existing || createInvoiceFrom(s, p, {}).inv);
  const [print, setPrint] = useState(false); const [pay, setPay] = useState(false);
  if (!p) return null;
  const isNew = !s.db.invoices.some((i) => i.id === v.id);
  const live = s.db.invoices.find((i) => i.id === v.id);
  const c = calcDoc(v.items, v.inter); const t = invTotals({ ...v, payments: live?.payments || v.payments });
  const setVal = (nv) => { if (nv.pos !== v.pos) nv.stateCode = stateCode(nv.pos); nv.inter = nv.stateCode !== set.company.stateCode; setV(nv); };
  const save = () => {
    if (!v.items.some((i) => i.service)) return s.notify("Add at least one service line");
    if (s.db.invoices.some((i) => i.number === v.number && i.id !== v.id)) return s.notify("Invoice number already exists");
    const item = { ...v, payments: live?.payments || v.payments };
    s.upsert("invoices", item);
    if (isNew) s.setSettings((x) => ({ ...x, invoiceNext: nextNumber(x.invoicePrefix, x.invoiceNext, [...s.db.invoices.map((i) => i.number), v.number]).next }));
    s.notify(isNew ? `Invoice ${v.number} created` : "Invoice updated");
    go({ mode: "project", id: projectId });
  };
  return (
    <div>
      <PageHead title={isNew ? "Create Tax Invoice" : `Invoice ${v.number}`} sub={`${p.name} · ${p.client}`}>
        <Btn icon="back" onClick={() => go({ mode: "project", id: projectId })}>Back to Project</Btn>
        {!isNew && <Btn icon="card" onClick={() => setPay(true)}>Add Payment</Btn>}
        <Btn icon="print" onClick={() => setPrint(true)}>Preview / Print</Btn>
        <Btn v="primary" icon="check" onClick={save}>{isNew ? "Create Invoice" : "Save Changes"}</Btn>
      </PageHead>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card title="Bill To (auto-filled from project)">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">{[["Client", p.client], ["Contact", p.contact], ["Mobile", p.mobile], ["Email", p.email], ["GSTIN", p.gstin], ["PAN", p.pan], ["Address", p.address]].map(([k, x]) => <div key={k} className={k === "Address" ? "col-span-2" : ""}><div className="text-[11px] font-semibold uppercase tracking-wider">{k}</div><div className="mt-0.5 font-medium">{x || "—"}</div></div>)}</div>
          </Card>
          <Card title="Invoice Details">
            <FormGrid cols={3} value={v} setValue={setVal} db={s.db} fields={[
              { k: "number", label: "Invoice Number" }, { k: "date", label: "Invoice Date", type: "date" }, { k: "due", label: "Due Date", type: "date" },
              { k: "pos", label: "Place of Supply / State", type: "select", options: STATES.map((x) => x[0]) }, { k: "stateCode", label: "State Code", disabled: true }, { k: "reverseCharge", label: "Reverse Charge", type: "select", options: ["No", "Yes"] },
              { k: "ref", label: "Reference Number" }, { k: "createdBy", label: "Created By", type: "select", options: empOptions, disabled: !s.isAdmin },
            ]} />
            <div className="mt-4 text-[13px] font-semibold">Supply type: {v.inter ? `Inter-State → IGST (company state ${set.company.state || "not set"})` : "Intra-State → CGST + SGST"}</div>
          </Card>
          <Card title="Invoice Items"><ItemsEditor unit items={v.items} setItems={(items) => setV({ ...v, items })} inter={v.inter} /></Card>
          <Card title="Notes"><textarea className="inp" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder={set.invoiceNotes} /></Card>
        </div>
        <div className="xl:sticky xl:top-24 h-fit space-y-5">
          <Totals c={c} inter={v.inter} extra={<><div className="flex justify-between py-1.5"><span>Amount Received</span><span>{inr(t.paid)}</span></div><div className="flex justify-between py-1.5 font-bold"><span>Balance Due</span><span>{inr(r2(c.total - t.paid))}</span></div><div className="mt-1"><Badge>{isNew ? "New" : t.status}</Badge></div></>} />
        </div>
      </div>
      {print && <PrintModal title={v.number} onClose={() => setPrint(false)}><InvoiceDoc inv={{ ...v, payments: live?.payments || v.payments }} project={p} /></PrintModal>}
      {pay && live && <PaymentModal inv={live} onClose={() => setPay(false)} />}
    </div>
  );
}
