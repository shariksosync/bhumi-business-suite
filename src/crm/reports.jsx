import { useState, useMemo } from "react";
import { useStore } from "./store.jsx";
import { PageHead, Btn, Card, Table, Stat, Tabs, BarChart, HBars } from "./ui.jsx";
import { invTotals, calcDoc, inr, inr0, fmtDate, fmtMonth, addDays, today, exportCSV, r2 } from "./utils.js";

const weekStart = (d) => { const dt = new Date(d + "T00:00:00"); const k = (dt.getDay() + 6) % 7; return addDays(d, -k); };
const periodKey = (tab, d) => (tab === "Daily" ? d : tab === "Weekly" ? weekStart(d) : tab === "Monthly" ? d.slice(0, 7) : d.slice(0, 4));
const periodLabel = (tab, k) => (tab === "Daily" ? fmtDate(k) : tab === "Weekly" ? "Wk of " + fmtDate(k) : tab === "Monthly" ? fmtMonth(k) : k);

function DateRange({ from, to, setFrom, setTo }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="date" className="inp w-44" value={from} onChange={(e) => setFrom(e.target.value)} /><span className="font-semibold">to</span>
      <input type="date" className="inp w-44" value={to} onChange={(e) => setTo(e.target.value)} />
      {[["30D", 30], ["90D", 90], ["1Y", 365]].map(([l, n]) => <Btn key={l} sm onClick={() => { setFrom(addDays(today(), -n)); setTo(today()); }}>{l}</Btn>)}
    </div>
  );
}

function ReportBody({ title, tab, rows, cols, chart }) {
  return (
    <div id="print-area">
      <div className="hidden print:block mb-4 text-[18px] font-bold">{title} · {tab}</div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card title={`${tab} overview`}>{chart.length ? (chart.length <= 12 && chart.every((c) => c.label.length < 12) ? <BarChart data={chart} /> : <HBars data={chart.slice(0, 10)} />) : <HBars data={[]} />}</Card>
        <Card title={`${tab} breakdown`} pad={false}><Table rows={rows} columns={cols} pageSize={12} /></Card>
      </div>
    </div>
  );
}

export function SalesReport() {
  const s = useStore();
  const [from, setFrom] = useState(addDays(today(), -365)); const [to, setTo] = useState(today());
  const [tab, setTab] = useState("Monthly");
  const proj = (id) => s.db.projects.find((p) => p.id === id) || {};
  const invs = useMemo(() => s.db.invoices.filter((i) => i.date >= from && i.date <= to).map((i) => ({ ...i, ...invTotals(i), p: proj(i.projectId) })), [s.db, from, to]);
  const sum = (a, k) => r2(a.reduce((x, y) => x + y[k], 0));
  const stats = { total: sum(invs, "total"), paid: sum(invs, "paid"), out: sum(invs, "balance") };

  const { rows, cols, chart } = useMemo(() => {
    const money = [{ k: "count", label: "Invoices", right: true }, { k: "invoiced", label: "Invoiced", right: true, render: (r) => inr(r.invoiced) }, { k: "received", label: "Received", right: true, render: (r) => inr(r.received) }, { k: "out", label: "Outstanding", right: true, bold: true, render: (r) => inr(r.out) }];
    const group = (keyFn, labelFn) => {
      const m = {};
      invs.forEach((i) => { const k = keyFn(i); m[k] = m[k] || { id: k, label: labelFn ? labelFn(k, i) : k, count: 0, invoiced: 0, received: 0, out: 0 }; m[k].count++; m[k].invoiced = r2(m[k].invoiced + i.total); m[k].received = r2(m[k].received + i.paid); m[k].out = r2(m[k].out + i.balance); });
      return Object.values(m);
    };
    if (["Daily", "Weekly", "Monthly", "Yearly"].includes(tab)) {
      const r = group((i) => periodKey(tab, i.date), (k) => periodLabel(tab, k)).sort((a, b) => (a.id > b.id ? 1 : -1));
      return { rows: r.slice().reverse(), cols: [{ k: "label", label: "Period", bold: true }, ...money], chart: r.slice(-12).map((x) => ({ label: tab === "Monthly" ? fmtMonth(x.id).split(" ")[0] : x.label.replace("Wk of ", ""), value: x.invoiced })) };
    }
    if (tab === "Client-wise" || tab === "Project-wise" || tab === "Employee-wise") {
      const r = group((i) => (tab === "Client-wise" ? i.p.client : tab === "Project-wise" ? i.p.id : i.p.assignedTo), (k, i) => (tab === "Client-wise" ? k : tab === "Project-wise" ? `${i.p.id} · ${i.p.name}` : s.empName(k))).sort((a, b) => b.invoiced - a.invoiced);
      return { rows: r, cols: [{ k: "label", label: tab.replace("-wise", ""), bold: true }, ...money], chart: r.map((x) => ({ label: x.label, value: x.invoiced })) };
    }
    if (tab === "Service-wise") {
      const m = {};
      invs.forEach((i) => calcDoc(i.items, i.inter).lines.forEach((l) => { m[l.service] = m[l.service] || { id: l.service, label: l.service, qty: 0, taxable: 0, tax: 0, total: 0 }; const x = m[l.service]; x.qty += +l.qty; x.taxable = r2(x.taxable + l.taxable); x.tax = r2(x.tax + l.tax); x.total = r2(x.total + l.total); }));
      const r = Object.values(m).sort((a, b) => b.total - a.total);
      return { rows: r, cols: [{ k: "label", label: "Service", bold: true }, { k: "qty", label: "Qty", right: true }, { k: "taxable", label: "Taxable", right: true, render: (x) => inr(x.taxable) }, { k: "tax", label: "GST", right: true, render: (x) => inr(x.tax) }, { k: "total", label: "Total", right: true, bold: true, render: (x) => inr(x.total) }], chart: r.map((x) => ({ label: x.label, value: x.total })) };
    }
    const pays = s.db.invoices.flatMap((i) => (i.payments || []).filter((p) => p.date >= from && p.date <= to).map((p) => ({ ...p, inv: i.number, client: proj(i.projectId).client })));
    const byMode = {}; pays.forEach((p) => (byMode[p.mode] = r2((byMode[p.mode] || 0) + +p.amount)));
    return { rows: pays.sort((a, b) => (a.date < b.date ? 1 : -1)), cols: [{ k: "date", label: "Date", type: "date" }, { k: "inv", label: "Invoice", bold: true }, { k: "client", label: "Client" }, { k: "mode", label: "Mode" }, { k: "ref", label: "Reference" }, { k: "amount", label: "Amount", right: true, render: (r) => inr(r.amount) }], chart: Object.entries(byMode).map(([label, value]) => ({ label, value })) };
  }, [invs, tab, s.db]);

  const csv = () => exportCSV(`sales-${tab}.csv`, cols.map((c) => c.label), rows.map((r) => cols.map((c) => (c.type === "date" ? fmtDate(r[c.k]) : r[c.k]))));
  return (
    <div>
      <PageHead title="Sales Report" sub="Based strictly on raised tax invoices and recorded payments."><Btn icon="download" onClick={csv}>Export CSV</Btn><Btn v="primary" icon="print" onClick={() => window.print()}>Print</Btn></PageHead>
      <div className="mb-5"><DateRange from={from} to={to} setFrom={setFrom} setTo={setTo} /></div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Stat label="Total Invoiced" value={inr0(stats.total)} /><Stat label="Received" value={inr0(stats.paid)} /><Stat label="Outstanding" value={inr0(stats.out)} />
        <Stat label="Paid" value={invs.filter((i) => i.status === "Paid").length} /><Stat label="Unpaid / Overdue" value={invs.filter((i) => i.status === "Unpaid" || i.status === "Overdue").length} /><Stat label="Partially Paid" value={invs.filter((i) => i.status === "Partially Paid").length} />
      </div>
      <div className="mb-4"><Tabs tabs={["Daily", "Weekly", "Monthly", "Yearly", "Client-wise", "Project-wise", "Employee-wise", "Service-wise", "Payment Collection"]} value={tab} onChange={setTab} /></div>
      <ReportBody title="Sales Report" tab={tab} rows={rows} cols={cols} chart={chart} />
    </div>
  );
}

export function ExpenseReport() {
  const s = useStore();
  const [from, setFrom] = useState(addDays(today(), -365)); const [to, setTo] = useState(today());
  const [tab, setTab] = useState("Monthly"); const [status, setStatus] = useState("");
  const all = s.db.expenses.filter((e) => e.date >= from && e.date <= to);
  const exps = all.filter((e) => !status || e.status === status);
  const sum = (a) => r2(a.reduce((x, y) => x + (+y.amount || 0), 0));
  const t = today();
  const { rows, cols, chart } = useMemo(() => {
    const keyFn = { Daily: (e) => e.date, Monthly: (e) => e.date.slice(0, 7), Yearly: (e) => e.date.slice(0, 4), "Category-wise": (e) => e.category, "Employee-wise": (e) => e.addedBy, "Vendor-wise": (e) => e.vendor || "—", "Payment Mode-wise": (e) => e.mode }[tab];
    const lab = (k) => (tab === "Daily" ? fmtDate(k) : tab === "Monthly" ? fmtMonth(k) : tab === "Employee-wise" ? s.empName(k) : k);
    const m = {};
    exps.forEach((e) => { const k = keyFn(e); m[k] = m[k] || { id: k, label: lab(k), count: 0, amount: 0, gst: 0 }; m[k].count++; m[k].amount = r2(m[k].amount + +e.amount); m[k].gst = r2(m[k].gst + (+e.gst || 0)); });
    const timeTab = ["Daily", "Monthly", "Yearly"].includes(tab);
    let r = Object.values(m).sort((a, b) => (timeTab ? (a.id > b.id ? 1 : -1) : b.amount - a.amount));
    const chart = (timeTab ? r.slice(-12) : r).map((x) => ({ label: tab === "Monthly" ? fmtMonth(x.id).split(" ")[0] : x.label, value: x.amount }));
    if (timeTab) r = r.slice().reverse();
    return { rows: r, chart, cols: [{ k: "label", label: tab.replace("-wise", ""), bold: true }, { k: "count", label: "Entries", right: true }, { k: "gst", label: "GST", right: true, render: (x) => inr(x.gst) }, { k: "amount", label: "Amount", right: true, bold: true, render: (x) => inr(x.amount) }] };
  }, [exps, tab]);
  return (
    <div>
      <PageHead title="Expense Report" sub="Company spending analysis from recorded expenses.">
        <Btn icon="download" onClick={() => exportCSV(`expenses-${tab}.csv`, cols.map((c) => c.label), rows.map((r) => cols.map((c) => r[c.k])))}>Export CSV</Btn><Btn v="primary" icon="print" onClick={() => window.print()}>Print</Btn>
      </PageHead>
      <div className="mb-5 flex flex-wrap items-center gap-3"><DateRange from={from} to={to} setFrom={setFrom} setTo={setTo} />
        <select className="inp w-44" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Status: All</option>{["Approved", "Pending", "Rejected"].map((x) => <option key={x}>{x}</option>)}</select></div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Stat label="Total Expenses" value={inr0(sum(all))} /><Stat label="Approved" value={inr0(sum(all.filter((e) => e.status === "Approved")))} /><Stat label="Pending" value={inr0(sum(all.filter((e) => e.status === "Pending")))} />
        <Stat label="Rejected" value={inr0(sum(all.filter((e) => e.status === "Rejected")))} /><Stat label="This Month" value={inr0(sum(s.db.expenses.filter((e) => e.date.startsWith(t.slice(0, 7)))))} /><Stat label="This Year" value={inr0(sum(s.db.expenses.filter((e) => e.date.startsWith(t.slice(0, 4)))))} />
      </div>
      <div className="mb-4"><Tabs tabs={["Daily", "Monthly", "Yearly", "Category-wise", "Employee-wise", "Vendor-wise", "Payment Mode-wise"]} value={tab} onChange={setTab} /></div>
      <ReportBody title="Expense Report" tab={tab} rows={rows} cols={cols} chart={chart} />
    </div>
  );
}
