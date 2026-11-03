import { useStore } from "./store.jsx";
import { useNav } from "./nav.js";
import { Stat, Card, BarChart, Badge, Avatar, Btn } from "./ui.jsx";
import { invTotals, calcDoc, inr0, fmtDate, today, fmtMonth, r2 } from "./utils.js";

const last6 = () => { const out = []; const d = new Date(); d.setDate(1); for (let i = 5; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`); } return out; };

function List({ items, empty = "Nothing here yet" }) {
  if (!items.length) return <div className="py-6 text-center text-[13px]">{empty}</div>;
  return <ul className="divide-y" style={{ borderColor: "var(--line)" }}>{items.map((it, i) => <li key={i} className="flex items-center justify-between gap-3 py-2.5" style={{ borderColor: "var(--line)" }}><div className="min-w-0"><div className="truncate font-semibold">{it.a}</div><div className="truncate text-[12px]">{it.b}</div></div><div className="shrink-0 text-right">{it.c}</div></li>)}</ul>;
}

export function Dashboard() {
  const s = useStore(); const { nav } = useNav(); const db = s.db; const T = today();
  const mine = (arr, k) => (s.isAdmin ? arr : arr.filter((x) => x[k] === s.user.id));
  const leads = mine(db.leads, "assignedTo");
  const projIds = new Set(mine(db.projects, "assignedTo").map((p) => p.id));
  const invs = db.invoices.filter((i) => s.isAdmin || projIds.has(i.projectId)).map((i) => ({ ...i, ...invTotals(i) }));
  const quotes = s.isAdmin ? db.quotations : db.quotations.filter((q) => q.preparedBy === s.user.id);
  const tasks = mine(db.tasks, "assignedTo");
  const months = last6();
  const sales = months.map((m) => ({ label: fmtMonth(m).split(" ")[0], value: r2(invs.filter((i) => i.date.startsWith(m)).reduce((a, i) => a + i.total, 0)) }));
  const exps = months.map((m) => ({ label: fmtMonth(m).split(" ")[0], value: r2(db.expenses.filter((e) => e.date.startsWith(m) && e.status !== "Rejected").reduce((a, e) => a + +e.amount, 0)) }));
  const todayAtt = db.attendance.filter((a) => a.date === T);
  const lastDate = db.attendance.reduce((m, a) => (a.date > m ? a.date : m), "");
  const attDate = todayAtt.length ? T : lastDate;
  const att = db.attendance.filter((a) => a.date === attDate);
  const cnt = (st) => att.filter((a) => a.status === st).length;
  const stats = [
    ["Total Leads", leads.length, "leads"], ["New Leads", leads.filter((l) => l.status === "New").length, "plus"], ["Converted Leads", leads.filter((l) => l.status === "Converted").length, "check"],
    ["Pending Quotations", quotes.filter((q) => ["Draft", "Sent"].includes(q.status)).length, "quote"], ["Total Quotations", quotes.length, "quote"], ["Tax Invoices", invs.length, "invoice"],
    ["Total Revenue", inr0(invs.reduce((a, i) => a + i.paid, 0)), "chart"], ["Pending Payments", inr0(invs.reduce((a, i) => a + i.balance, 0)), "card"],
    ...(s.isAdmin ? [["Total Expenses", inr0(db.expenses.filter((e) => e.status === "Approved").reduce((a, e) => a + +e.amount, 0)), "expense"], ["Total Employees", db.employees.filter((e) => e.status === "Active").length, "user"]] : []),
  ];
  const sortD = (k) => (a, b) => (a[k] < b[k] ? 1 : -1);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><div className="text-[13px] font-semibold">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</div><h1 className="text-[24px] font-bold tracking-tight">Welcome back, {s.user.name.split(" ")[0]}</h1></div>
        <div className="flex gap-2"><Btn icon="leads" onClick={() => nav("leads")}>Leads</Btn><Btn v="primary" icon="invoice" onClick={() => nav("invoices")}>New Invoice</Btn></div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{stats.map(([l, v, i]) => <Stat key={l} label={l} value={v} icon={i} />)}</div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card title="Monthly Sales" action={<span className="text-[12px] font-semibold">Last 6 months · invoiced</span>}><BarChart data={sales} /></Card>
        {s.isAdmin ? <Card title="Monthly Expenses" action={<span className="text-[12px] font-semibold">Last 6 months</span>}><BarChart data={exps} /></Card>
          : <Card title="My Pending Tasks"><List items={tasks.filter((t) => !["Completed", "Cancelled"].includes(t.status)).slice(0, 6).map((t) => ({ a: t.title, b: "Due " + fmtDate(t.due), c: <Badge>{t.priority}</Badge> }))} /></Card>}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card title="Recent Leads" action={<Btn sm onClick={() => nav("leads")}>View all</Btn>}><List items={[...leads].sort(sortD("leadDate")).slice(0, 5).map((l) => ({ a: l.client, b: `${l.contact} · ${fmtDate(l.leadDate)}`, c: <Badge>{l.status}</Badge> }))} /></Card>
        <Card title="Recent Invoices" action={<Btn sm onClick={() => nav("invoices")}>View all</Btn>}><List items={[...invs].sort(sortD("date")).slice(0, 5).map((i) => ({ a: i.number, b: `${db.projects.find((p) => p.id === i.projectId)?.client} · ${fmtDate(i.date)}`, c: <div><div className="font-semibold">{inr0(i.total)}</div><div className="text-[11px]">{i.status}</div></div> }))} /></Card>
        <Card title="Recent Quotations" action={<Btn sm onClick={() => nav("quotations")}>View all</Btn>}><List items={[...quotes].sort(sortD("date")).slice(0, 5).map((q) => ({ a: q.number, b: `${q.client} · ${fmtDate(q.date)}`, c: <div><div className="font-semibold">{inr0(calcDoc(q.items, q.inter).total)}</div><div className="text-[11px]">{q.status}</div></div> }))} /></Card>
        <Card title="Recent Visits" action={<Btn sm onClick={() => nav("visits")}>View all</Btn>}><List items={mine(db.visits, "empId").slice().sort(sortD("date")).slice(0, 5).map((v) => ({ a: v.client, b: `${fmtDate(v.date)} · ${v.time} · ${s.empName(v.empId)}`, c: <Badge>{v.status}</Badge> }))} /></Card>
        <Card title="Recent Calls" action={<Btn sm onClick={() => nav("calls")}>View all</Btn>}><List items={mine(db.calls, "empId").slice().sort(sortD("date")).slice(0, 5).map((c) => ({ a: c.client, b: `${fmtDate(c.date)} · ${c.direction}`, c: <span className="text-[12px] font-semibold">{c.outcome}</span> }))} /></Card>
        <Card title="Pending Tasks" action={<Btn sm onClick={() => nav("tasks")}>View all</Btn>}><List items={tasks.filter((t) => ["Pending", "In Progress", "On Hold"].includes(t.status) && t.due <= T).slice(0, 5).map((t) => ({ a: t.title, b: `${s.empName(t.assignedTo)} · due ${fmtDate(t.due)}`, c: <Badge>{t.priority}</Badge> }))} empty="No overdue or due-today tasks" /></Card>
        <Card title="Upcoming Tasks"><List items={tasks.filter((t) => !["Completed", "Cancelled"].includes(t.status) && t.due > T).sort((a, b) => (a.due > b.due ? 1 : -1)).slice(0, 5).map((t) => ({ a: t.title, b: `${s.empName(t.assignedTo)} · ${fmtDate(t.due)}`, c: <Badge>{t.status}</Badge> }))} empty="No upcoming tasks" /></Card>
        <Card title={`Employee Attendance · ${fmtDate(attDate)}`} className="lg:col-span-2" action={<Btn sm onClick={() => nav("attendance")}>Open</Btn>}>
          <div className="mb-4 grid grid-cols-4 gap-3">{[["Present", cnt("Present")], ["Half Day", cnt("Half Day")], ["Leave", cnt("Leave")], ["Absent", cnt("Absent")]].map(([k, v]) => <div key={k} className="rounded-lg border border-navy p-3 text-center"><div className="text-[20px] font-bold">{v}</div><div className="text-[11.5px] font-semibold uppercase">{k}</div></div>)}</div>
          <div className="flex flex-wrap gap-3">{att.slice(0, 8).map((a) => <div key={a.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5" style={{ borderColor: "var(--line)" }}><Avatar name={s.empName(a.empId)} size={26} /><div className="text-[12px]"><div className="font-semibold">{s.empName(a.empId)}</div><div>{a.status}{a.in && ` · ${a.in}`}</div></div></div>)}</div>
        </Card>
      </div>
    </div>
  );
}
