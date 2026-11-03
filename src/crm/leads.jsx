import { useState } from "react";
import { useStore } from "./store.jsx";
import { useNav } from "./nav.js";
import { CrudPage, Modal, Btn, Badge, Tabs, Table, empOptions, leadOptions, IconBtn } from "./ui.jsx";
import { LEAD_STATUSES, LEAD_SOURCES, BUSINESS_TYPES, SERVICES } from "./data.js";
import { fmtDate, inr0, today, STATES } from "./utils.js";

const own = (s, key) => (rows) => (s.isAdmin ? rows : rows.filter((r) => r[key] === s.user.id));

export function Leads() {
  const s = useStore();
  const [view, setView] = useState(null);
  const fields = [
    { k: "client", label: "Client Name", required: true }, { k: "contact", label: "Contact Person", required: true },
    { k: "mobile", label: "Mobile", required: true }, { k: "altMobile", label: "Alternate Mobile" }, { k: "email", label: "Email", type: "email" },
    { k: "businessType", label: "Business Type", type: "select", options: BUSINESS_TYPES }, { k: "gstin", label: "GSTIN" }, { k: "pan", label: "PAN" },
    { k: "address", label: "Address", full: true }, { k: "state", label: "State", type: "select", options: STATES.map((x) => x[0]) },
    { k: "services", label: "Required Services", ph: SERVICES.slice(0, 3).map((x) => x[0]).join(", ") }, { k: "source", label: "Lead Source", type: "select", options: LEAD_SOURCES },
    { k: "assignedTo", label: "Assigned Employee", type: "select", options: empOptions, disabled: !s.isAdmin },
    { k: "leadDate", label: "Lead Date", type: "date", required: true }, { k: "followUp", label: "Follow-up Date", type: "date" },
    { k: "value", label: "Expected Value (₹)", type: "number" }, { k: "status", label: "Status", type: "select", options: LEAD_STATUSES, required: true },
    { k: "remarks", label: "Remarks", type: "textarea", full: true },
  ];
  const cur = view && s.db.leads.find((l) => l.id === view);
  return (
    <>
      <CrudPage title="All Leads" sub="Track prospects from first contact to conversion." col="leads" prefix="LD" fields={fields} viewTitle="Lead"
        scope={own(s, "assignedTo")} csv addLabel="Add Lead" canDelete={() => s.isAdmin}
        defaults={() => ({ leadDate: today(), status: "New", assignedTo: s.user.id, followups: [], value: "" })}
        onView={(r) => setView(r.id)}
        filters={[{ k: "status", label: "Status", options: LEAD_STATUSES }, { k: "source", label: "Source", options: LEAD_SOURCES }, ...(s.isAdmin ? [{ k: "assignedTo", label: "Employee", options: empOptions }] : [])]}
        columns={[
          { k: "id", label: "Lead ID", bold: true }, { k: "client", label: "Client" }, { k: "contact", label: "Contact" }, { k: "mobile", label: "Mobile" },
          { k: "assignedTo", label: "Assigned", render: (r) => s.empName(r.assignedTo), text: (r) => s.empName(r.assignedTo) },
          { k: "followUp", label: "Follow-up", type: "date" }, { k: "value", label: "Expected", type: "money", right: true },
          { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
        ]} />
      {cur && <LeadView lead={cur} onClose={() => setView(null)} />}
    </>
  );
}

function LeadView({ lead, onClose }) {
  const s = useStore(); const { nav } = useNav();
  const [tab, setTab] = useState("Follow-ups");
  const [note, setNote] = useState(""); const [nd, setNd] = useState(today());
  const visits = s.db.visits.filter((v) => v.leadId === lead.id);
  const calls = s.db.calls.filter((c) => c.leadId === lead.id);
  const quotes = s.db.quotations.filter((q) => q.leadId === lead.id);
  const upd = (patch) => s.upsert("leads", { ...lead, ...patch });
  const info = [["Contact", lead.contact], ["Mobile", lead.mobile], ["Alt. Mobile", lead.altMobile], ["Email", lead.email], ["GSTIN", lead.gstin], ["PAN", lead.pan], ["Business Type", lead.businessType], ["Source", lead.source], ["Assigned", s.empName(lead.assignedTo)], ["Lead Date", fmtDate(lead.leadDate)], ["Follow-up", fmtDate(lead.followUp)], ["Expected Value", inr0(lead.value)], ["Services", lead.services], ["Address", lead.address], ["Remarks", lead.remarks]];
  return (
    <Modal xl title={`${lead.client} · ${lead.id}`} onClose={onClose}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-semibold">Status</span>
        <select className="inp w-48" value={lead.status} onChange={(e) => { upd({ status: e.target.value }); s.notify("Status updated"); }}>{LEAD_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
        <div className="ml-auto flex gap-2">
          <Btn icon="visit" onClick={() => nav("visits")}>Visits</Btn><Btn icon="call" onClick={() => nav("calls")}>Calls</Btn>
          <Btn v="primary" icon="quote" onClick={() => nav("quotations", { leadId: lead.id })}>Create Quotation</Btn>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-navy p-5 md:grid-cols-4">
        {info.map(([k, v]) => <div key={k} className={k === "Address" || k === "Remarks" || k === "Services" ? "col-span-2" : ""}><div className="text-[11px] font-semibold uppercase tracking-wider">{k}</div><div className="mt-0.5 font-medium">{v || "—"}</div></div>)}
      </div>
      <div className="mt-6 mb-3"><Tabs tabs={["Follow-ups", `Visits (${visits.length})`, `Calls (${calls.length})`, `Quotations (${quotes.length})`]} value={tab} onChange={setTab} /></div>
      {tab === "Follow-ups" && (
        <div>
          <div className="mb-4 flex flex-wrap gap-2"><input type="date" className="inp w-44" value={nd} onChange={(e) => setNd(e.target.value)} /><input className="inp flex-1" placeholder="Add follow-up note…" value={note} onChange={(e) => setNote(e.target.value)} />
            <Btn v="primary" icon="plus" onClick={() => { if (!note.trim()) return; upd({ followups: [{ date: nd, note, by: s.user.id }, ...(lead.followups || [])], followUp: nd, status: lead.status === "New" ? "Follow-up" : lead.status }); setNote(""); s.notify("Follow-up added"); }}>Add</Btn></div>
          <ol className="space-y-3 border-l-2 border-navy pl-5">
            {(lead.followups || []).map((f, i) => <li key={i} className="relative"><span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-navy bg-white" /><div className="text-[12px] font-semibold">{fmtDate(f.date)} · {s.empName(f.by)}</div><div>{f.note}</div></li>)}
            {!lead.followups?.length && <li>No follow-ups yet.</li>}
          </ol>
        </div>
      )}
      {tab.startsWith("Visits") && <Table rows={visits} columns={[{ k: "date", label: "Date", type: "date" }, { k: "time", label: "Time" }, { k: "purpose", label: "Purpose" }, { k: "empId", label: "Employee", render: (r) => s.empName(r.empId) }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />}
      {tab.startsWith("Calls") && <Table rows={calls} columns={[{ k: "date", label: "Date", type: "date" }, { k: "direction", label: "Type" }, { k: "purpose", label: "Purpose" }, { k: "outcome", label: "Outcome" }, { k: "empId", label: "Employee", render: (r) => s.empName(r.empId) }]} />}
      {tab.startsWith("Quotations") && <Table rows={quotes} onRow={() => nav("quotations")} columns={[{ k: "number", label: "Number", bold: true }, { k: "date", label: "Date", type: "date" }, { k: "subject", label: "Subject" }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />}
    </Modal>
  );
}

const fromLead = (v, prev, db) => {
  if (v.leadId && v.leadId !== prev.leadId) { const l = db.leads.find((x) => x.id === v.leadId); if (l) return { ...v, client: l.client, contact: l.contact, number: l.mobile, location: v.location || l.address }; }
  return v;
};

export function Visits() {
  const s = useStore();
  return (
    <CrudPage title="Visit Management" sub="Schedule and record client visits." col="visits" prefix="VIS" viewTitle="Visit" scope={own(s, "empId")} derive={fromLead} canDelete={() => s.isAdmin} addLabel="Schedule Visit" csv
      defaults={() => ({ date: today(), time: "11:00", empId: s.user.id, status: "Scheduled" })}
      fields={[{ k: "leadId", label: "Lead", type: "select", options: leadOptions, required: true }, { k: "client", label: "Client Name", required: true }, { k: "contact", label: "Contact Person" },
        { k: "date", label: "Visit Date", type: "date", required: true }, { k: "time", label: "Visit Time", type: "time" }, { k: "empId", label: "Employee", type: "select", options: empOptions, disabled: !s.isAdmin },
        { k: "location", label: "Location", full: true }, { k: "purpose", label: "Purpose" }, { k: "status", label: "Status", type: "select", options: ["Scheduled", "Completed", "Cancelled"] },
        { k: "desc", label: "Description", type: "textarea" }, { k: "notes", label: "Discussion Notes", type: "textarea" }, { k: "nextFollow", label: "Next Follow-up", type: "date" }]}
      filters={[{ k: "status", label: "Status", options: ["Scheduled", "Completed", "Cancelled"] }, ...(s.isAdmin ? [{ k: "empId", label: "Employee", options: empOptions }] : []), { k: "date", label: "Month", type: "month", match: (r, v) => r.date.startsWith(v) }]}
      rowActions={(r) => r.status === "Scheduled" && <IconBtn n="check" title="Mark completed" onClick={() => { s.upsert("visits", { ...r, status: "Completed" }); s.notify("Visit marked completed"); }} />}
      columns={[{ k: "id", label: "Visit ID", bold: true }, { k: "client", label: "Client" }, { k: "date", label: "Date", type: "date" }, { k: "time", label: "Time" }, { k: "empId", label: "Employee", render: (r) => s.empName(r.empId), text: (r) => s.empName(r.empId) }, { k: "purpose", label: "Purpose" }, { k: "nextFollow", label: "Next Follow-up", type: "date" }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />
  );
}

export function Calls() {
  const s = useStore();
  return (
    <CrudPage title="Call Management" sub="Complete call history with outcomes and follow-ups." col="calls" prefix="CAL" viewTitle="Call" scope={own(s, "empId")} derive={fromLead} canDelete={() => s.isAdmin} addLabel="Log Call" csv
      defaults={() => ({ date: today(), time: "11:00", empId: s.user.id, direction: "Outgoing" })}
      fields={[{ k: "leadId", label: "Lead", type: "select", options: leadOptions, required: true }, { k: "client", label: "Client Name", required: true }, { k: "number", label: "Contact Number", required: true },
        { k: "date", label: "Call Date", type: "date", required: true }, { k: "time", label: "Call Time", type: "time" }, { k: "empId", label: "Employee", type: "select", options: empOptions, disabled: !s.isAdmin },
        { k: "direction", label: "Incoming / Outgoing", type: "select", options: ["Incoming", "Outgoing"] }, { k: "purpose", label: "Purpose" },
        { k: "discussion", label: "Discussion", type: "textarea", full: true }, { k: "outcome", label: "Outcome" }, { k: "followUp", label: "Follow-up Date", type: "date" }, { k: "remarks", label: "Remarks", full: true }]}
      filters={[{ k: "direction", label: "Type", options: ["Incoming", "Outgoing"] }, ...(s.isAdmin ? [{ k: "empId", label: "Employee", options: empOptions }] : []), { k: "date", label: "Month", type: "month", match: (r, v) => r.date.startsWith(v) }]}
      columns={[{ k: "id", label: "Call ID", bold: true }, { k: "client", label: "Client" }, { k: "number", label: "Number" }, { k: "date", label: "Date", type: "date" }, { k: "time", label: "Time" }, { k: "direction", label: "Type", render: (r) => <Badge>{r.direction}</Badge> }, { k: "empId", label: "Employee", render: (r) => s.empName(r.empId), text: (r) => s.empName(r.empId) }, { k: "outcome", label: "Outcome" }, { k: "followUp", label: "Follow-up", type: "date" }]} />
  );
}
