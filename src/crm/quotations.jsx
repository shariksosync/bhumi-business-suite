import { useState, useEffect, useMemo } from "react";
import { useStore } from "./store.jsx";
import { useNav } from "./nav.js";
import { PageHead, Btn, IconBtn, Badge, Table, SearchBox, Confirm, PrintModal, Card, FormGrid, empOptions, leadOptions } from "./ui.jsx";
import { ItemsEditor, Totals, blankItem } from "./items.jsx";
import { QuotationDoc } from "./docs.jsx";
import { QUOTE_STATUSES } from "./data.js";
import { calcDoc, inr, fmtDate, today, addDays, uid, STATES, stateCode, nextId, exportCSV } from "./utils.js";

export const nextNumber = (prefix, next, existing) => {
  let n = next; let num;
  do { num = prefix + String(n).padStart(3, "0"); n++; } while (existing.includes(num));
  return { num, next: n };
};

export function createInvoiceFrom(s, project, base) {
  const st = s.db.settings;
  const { num, next } = nextNumber(st.invoicePrefix, st.invoiceNext, s.db.invoices.map((i) => i.number));
  const date = today();
  const inv = { id: "inv" + uid(), number: num, projectId: project.id, date, due: addDays(date, 15), pos: project.state || st.company.state, stateCode: project.stateCode || stateCode(project.state) || st.company.stateCode, reverseCharge: "No", ref: "", createdBy: s.user.id, items: [blankItem(st.defaultGst)], payments: [], notes: "", statusOverride: "", ...base };
  inv.inter = (inv.stateCode || "") !== (st.company.stateCode || "");
  return { inv, bump: () => s.setSettings((x) => ({ ...x, invoiceNext: next })) };
}

export function Quotations() {
  const s = useStore(); const { params, nav } = useNav();
  const [edit, setEdit] = useState(null);
  const [print, setPrint] = useState(null);
  const [del, setDel] = useState(null);
  const [q, setQ] = useState(""); const [st, setSt] = useState("");

  const newQuote = (leadId) => {
    const set = s.db.settings; const l = s.db.leads.find((x) => x.id === leadId);
    const { num } = nextNumber(set.quotePrefix, set.quoteNext, s.db.quotations.map((x) => x.number));
    const base = { id: "", number: num, date: today(), validity: addDays(today(), +set.quoteValidity || 15), leadId: leadId || "", preparedBy: s.user.id, subject: "", notes: "", items: [blankItem(set.defaultGst)], status: "Draft", client: "", contact: "", mobile: "", email: "", address: "", gstin: "", state: set.company.state, stateCode: set.company.stateCode, inter: false };
    if (l) Object.assign(base, { client: l.client, contact: l.contact, mobile: l.mobile, email: l.email, address: l.address, gstin: l.gstin, state: l.state || set.company.state, stateCode: stateCode(l.state) || set.company.stateCode, subject: "Proposal for " + (l.services || "professional services") });
    base.inter = base.stateCode !== set.company.stateCode;
    setEdit(base);
  };
  useEffect(() => { if (params?.leadId) newQuote(params.leadId); }, [params]);

  const rows = useMemo(() => {
    let r = s.isAdmin ? s.db.quotations : s.db.quotations.filter((x) => x.preparedBy === s.user.id || s.db.leads.find((l) => l.id === x.leadId)?.assignedTo === s.user.id);
    const qq = q.toLowerCase();
    return r.filter((x) => (!st || x.status === st) && (!qq || [x.number, x.client, x.mobile, x.subject].join(" ").toLowerCase().includes(qq)));
  }, [s.db, q, st]);

  const convert = (quote) => {
    let project = s.db.projects.find((p) => p.client === quote.client);
    if (!project) {
      project = { id: nextId(s.db.projects, "PRJ"), name: quote.subject || "Project – " + quote.client, client: quote.client, contact: quote.contact, mobile: quote.mobile, email: quote.email, gstin: quote.gstin, pan: "", address: quote.address, state: quote.state, stateCode: quote.stateCode, assignedTo: s.user.id, status: "Active", leadId: quote.leadId, startDate: today() };
      s.upsert("projects", project);
    }
    const { inv, bump } = createInvoiceFrom(s, project, { items: quote.items.map((i) => ({ unit: "Service", ...i })), ref: quote.number });
    s.upsert("invoices", inv); bump();
    s.upsert("quotations", { ...quote, status: "Converted" });
    if (quote.leadId) { const l = s.db.leads.find((x) => x.id === quote.leadId); if (l) s.upsert("leads", { ...l, status: "Converted" }); }
    s.notify(`Converted to invoice ${inv.number}`);
    nav("invoices", { projectId: project.id, invId: inv.id });
  };

  if (edit) return <QuoteEditor initial={edit} onClose={() => setEdit(null)} onPrint={setPrint} print={print} setPrint={setPrint} />;

  return (
    <div>
      <PageHead title="Quotations" sub="Create GST-ready proposals and convert them to tax invoices.">
        <Btn icon="download" onClick={() => exportCSV("quotations.csv", ["Number", "Date", "Client", "Subtotal", "GST", "Total", "Status"], rows.map((r) => { const c = calcDoc(r.items, r.inter); return [r.number, fmtDate(r.date), r.client, c.subtotal, c.tax, c.total, r.status]; }))}>Export CSV</Btn>
        <Btn v="primary" icon="plus" onClick={() => newQuote()}>New Quotation</Btn>
      </PageHead>
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4" style={{ borderColor: "var(--line)" }}>
          <SearchBox value={q} onChange={setQ} placeholder="Search number, client, subject…" />
          <select className="inp w-44" value={st} onChange={(e) => setSt(e.target.value)}><option value="">Status: All</option>{QUOTE_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
          <span className="ml-auto text-[12.5px] font-semibold">{rows.length} quotations</span>
        </div>
        <Table rows={rows} onRow={(r) => setEdit(r)}
          columns={[{ k: "number", label: "Quotation No.", bold: true }, { k: "date", label: "Date", type: "date" }, { k: "client", label: "Client" }, { k: "mobile", label: "Contact" }, { k: "leadId", label: "Lead Ref." },
            { label: "Subtotal", right: true, render: (r) => inr(calcDoc(r.items, r.inter).subtotal) }, { label: "GST", right: true, render: (r) => inr(calcDoc(r.items, r.inter).tax) },
            { label: "Grand Total", right: true, bold: true, render: (r) => inr(calcDoc(r.items, r.inter).total) }, { k: "validity", label: "Valid Until", type: "date" }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]}
          actions={(r) => (<>
            <IconBtn n="print" title="Print" onClick={() => setPrint(r)} />
            {r.status !== "Converted" && <IconBtn n="convert" title="Convert to Tax Invoice" onClick={() => convert(r)} />}
            <IconBtn n="edit" title="Edit" onClick={() => setEdit(r)} />
            {s.isAdmin && <IconBtn n="trash" title="Delete" onClick={() => setDel(r)} />}
          </>)} />
      </div>
      {print && <PrintModal title={print.number} onClose={() => setPrint(null)}><QuotationDoc q={print} /></PrintModal>}
      {del && <Confirm text={`Delete quotation ${del.number}?`} onYes={() => { s.remove("quotations", del.id); s.notify("Quotation deleted"); }} onClose={() => setDel(null)} />}
    </div>
  );
}

function QuoteEditor({ initial, onClose, print, setPrint }) {
  const s = useStore(); const set = s.db.settings;
  const [v, setV] = useState(initial);
  const c = calcDoc(v.items, v.inter);
  const setVal = (nv) => {
    if (nv.leadId !== v.leadId) { const l = s.db.leads.find((x) => x.id === nv.leadId); if (l) Object.assign(nv, { client: l.client, contact: l.contact, mobile: l.mobile, email: l.email, address: l.address, gstin: l.gstin, state: l.state || nv.state }); }
    nv.stateCode = stateCode(nv.state) || nv.stateCode; nv.inter = nv.stateCode !== set.company.stateCode;
    setV(nv);
  };
  const save = (status) => {
    if (!v.client) return s.notify("Client name is required");
    if (!v.items.some((i) => i.service)) return s.notify("Add at least one service");
    const item = { ...v, status: status || v.status, id: v.id || "q" + uid() };
    if (!v.id) s.setSettings((x) => ({ ...x, quoteNext: nextNumber(x.quotePrefix, x.quoteNext, s.db.quotations.map((q) => q.number)).next }));
    s.upsert("quotations", item); setV(item); s.notify("Quotation saved");
    if (status === "Draft" || !status) onClose();
  };
  return (
    <div>
      <PageHead title={v.id ? `Quotation ${v.number}` : "New Quotation"} sub="Line items calculate GST automatically based on place of supply.">
        <Btn icon="back" onClick={onClose}>Back</Btn>
        <Btn icon="print" onClick={() => setPrint(v)}>Preview / Print</Btn>
        <Btn onClick={() => save("Draft")}>Save Draft</Btn>
        <Btn v="primary" icon="check" onClick={() => save(v.status === "Draft" ? "Sent" : v.status)}>Save {v.status === "Draft" ? "& Mark Sent" : ""}</Btn>
      </PageHead>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card title="Quotation Details">
            <FormGrid cols={3} value={v} setValue={setVal} db={s.db} fields={[
              { k: "number", label: "Quotation Number" }, { k: "date", label: "Quotation Date", type: "date" }, { k: "validity", label: "Validity Date", type: "date" },
              { k: "preparedBy", label: "Prepared By", type: "select", options: empOptions }, { k: "status", label: "Status", type: "select", options: QUOTE_STATUSES }, { k: "leadId", label: "Lead Reference", type: "select", options: leadOptions },
              { k: "subject", label: "Subject", wide3: true },
            ]} />
          </Card>
          <Card title="Client Information">
            <FormGrid cols={3} value={v} setValue={setVal} db={s.db} fields={[
              { k: "client", label: "Client Name", required: true }, { k: "contact", label: "Contact Person" }, { k: "mobile", label: "Contact Number" }, { k: "email", label: "Email" }, { k: "gstin", label: "GSTIN" },
              { k: "state", label: "State (Place of Supply)", type: "select", options: STATES.map((x) => x[0]) }, { k: "address", label: "Address", wide3: true },
            ]} />
          </Card>
          <Card title={`Services · ${v.inter ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}`}><ItemsEditor items={v.items} setItems={(items) => setV({ ...v, items })} inter={v.inter} /></Card>
          <Card title="Notes"><textarea className="inp" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder="Additional notes for the client" /></Card>
        </div>
        <div className="space-y-5"><div className="xl:sticky xl:top-24"><Totals c={c} inter={v.inter} /></div></div>
      </div>
      {print && <PrintModal title={print.number} onClose={() => setPrint(null)}><QuotationDoc q={print} /></PrintModal>}
    </div>
  );
}
