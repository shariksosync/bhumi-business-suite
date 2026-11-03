import { useState, useMemo, useEffect, useRef } from "react";
import { StoreProvider, useStore } from "./store.jsx";
import { NavCtx } from "./nav.js";
import { Icon, Avatar, Btn, cx } from "./ui.jsx";
import { Dashboard } from "./dashboard.jsx";
import { Leads, Visits, Calls } from "./leads.jsx";
import { Quotations } from "./quotations.jsx";
import { Invoices } from "./invoices.jsx";
import { Employees, Expenses, Tasks, Salary, Attendance } from "./people.jsx";
import { SalesReport, ExpenseReport } from "./reports.jsx";
import { Settings } from "./settings.jsx";
import { today, fmtDate, invTotals } from "./utils.js";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", C: Dashboard },
  { id: "leadgroup", label: "Lead Management", icon: "leads", children: [
    { id: "leads", label: "All Leads", C: Leads }, { id: "visits", label: "Visit Management", C: Visits }, { id: "calls", label: "Call Management", C: Calls }] },
  { id: "quotations", label: "Quotation", icon: "quote", C: Quotations },
  { id: "invoices", label: "Tax Invoice", icon: "invoice", C: Invoices },
  { id: "expenses", label: "Expense", icon: "expense", C: Expenses, admin: true },
  { id: "employees", label: "Employee", icon: "user", C: Employees, admin: true },
  { id: "salary", label: "Employee Salary", icon: "salary", C: Salary },
  { id: "tasks", label: "Task Management", icon: "task", C: Tasks },
  { id: "attendance", label: "Attendance", icon: "clock", C: Attendance },
  { id: "sales", label: "Sales Report", icon: "chart", C: SalesReport, admin: true },
  { id: "expreport", label: "Expense Report", icon: "pie", C: ExpenseReport, admin: true },
  { id: "settings", label: "Settings", icon: "settings", C: Settings, admin: true },
];
const FLAT = NAV.flatMap((n) => (n.children ? n.children.map((c) => ({ ...c, parent: n })) : [n]));

export default function App() {
  return <StoreProvider><Root /></StoreProvider>;
}

function Root() {
  const s = useStore();
  return (<>{s.user ? <Shell /> : <Login />}<Toasts /></>);
}

function Toasts() {
  const { toasts } = useStore();
  return <div className="no-print fixed bottom-5 right-5 z-[60] space-y-2">{toasts.map((t) => <div key={t.id} className="flex items-center gap-2 rounded-lg border-2 border-navy bg-white px-4 py-3 text-[13.5px] font-semibold" style={{ boxShadow: "var(--shadow-pop)" }}><Icon n="check" s={16} />{t.msg}</div>)}</div>;
}

function Login() {
  const s = useStore();
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [show, setShow] = useState(false); const [rem, setRem] = useState(true); const [err, setErr] = useState("");
  const submit = (e) => { e.preventDefault(); const r = s.login(u, p, rem); if (r) setErr(r); };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r-2 border-navy bg-white p-12 lg:flex">
        <img src={s.logo} alt="Bhumi Business Solutions" style={{ height: 72, width: "auto", alignSelf: "flex-start" }} />
        <div>
          <h1 className="max-w-md text-[34px] font-bold leading-tight tracking-tight">Financial consultancy & compliance, managed with precision.</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed">Accounting, taxation, auditing, GST compliance, payroll and virtual CFO engagements — leads to invoices, in one place.</p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">{["Leads & CRM", "GST Invoicing", "Payroll & HR"].map((x) => <div key={x} className="rounded-lg border border-navy p-3 text-[13px] font-semibold"><span className="mb-2 block h-1 w-6 rounded bg-navy" />{x}</div>)}</div>
        </div>
        <div className="text-[12.5px]">support@bhumibusiness.com</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="card w-full max-w-md p-8">
          <img src={s.logo} alt="Bhumi Business Solutions" className="mb-6 lg:hidden" style={{ height: 52, width: "auto" }} />
          <h2 className="text-[22px] font-bold">Sign in</h2><p className="mt-1 text-[13.5px]">Access your Bhumi CRM workspace.</p>
          {err && <div className="mt-5 rounded-lg border-2 border-navy px-3 py-2 text-[13px] font-semibold">{err}</div>}
          <label className="mt-6 block"><span className="lbl">Username / Email</span><input className="inp h-11" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" placeholder="admin" /></label>
          <label className="mt-4 block"><span className="lbl">Password</span>
            <div className="relative"><input className="inp h-11 pr-11" type={show ? "text" : "password"} value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}><Icon n={show ? "eyeoff" : "eye"} s={17} /></button></div></label>
          <label className="mt-4 flex items-center gap-2 text-[13.5px]"><input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} style={{ accentColor: "#0B1F44" }} />Remember me</label>
          <button type="submit" className="btn btn-primary mt-6 h-11 w-full">Login</button>
          <div className="mt-6 rounded-lg border p-3 text-[12.5px]" style={{ borderColor: "var(--line)" }}>
            <div className="mb-1 font-bold">Demo credentials</div>
            <button type="button" className="block underline" onClick={() => { setU("admin"); setP("admin123"); }}>Admin — admin / admin123</button>
            <button type="button" className="block underline" onClick={() => { setU("employee"); setP("emp123"); }}>Employee — employee / emp123</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Shell() {
  const s = useStore();
  const [state, setState] = useState({ page: "dashboard", params: {} });
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const allowed = (n) => !n.admin || s.isAdmin;
  const cur = FLAT.find((f) => f.id === state.page && allowed(f)) || FLAT[0];
  const nav = (page, params = {}) => { setState({ page, params: { ...params, _t: Date.now() } }); setMobile(false); window.scrollTo(0, 0); };
  const ctx = useMemo(() => ({ page: cur.id, params: state.params, nav }), [cur.id, state.params]);
  const Page = cur.C;
  return (
    <NavCtx.Provider value={ctx}>
      <div className="min-h-screen bg-white">
        {mobile && <div className="fixed inset-0 z-30 lg:hidden" style={{ background: "rgb(0 0 0 / 0.3)" }} onClick={() => setMobile(false)} />}
        <aside className={cx("no-print fixed inset-y-0 left-0 z-40 flex flex-col border-r border-navy bg-white transition-all", collapsed ? "lg:w-[76px]" : "lg:w-[264px]", mobile ? "w-[264px] translate-x-0" : "w-[264px] -translate-x-full lg:translate-x-0")}>
          <div className="flex h-[72px] items-center border-b border-navy px-4">
            {collapsed ? <div className="mx-auto h-10 w-10 overflow-hidden"><img src={s.logo} alt="Bhumi" style={{ height: 40, width: "auto", maxWidth: "none" }} /></div> : <img src={s.logo} alt="Bhumi Business Solutions" style={{ height: 46, width: "auto" }} />}
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {NAV.filter(allowed).map((n) => n.children ? <Group key={n.id} n={n} cur={cur.id} nav={nav} collapsed={collapsed && !mobile} /> : (
              <button key={n.id} className="navitem" data-on={cur.id === n.id ? "1" : "0"} onClick={() => nav(n.id)} title={n.label}><Icon n={n.icon} />{(!collapsed || mobile) && <span className="truncate">{n.label}</span>}</button>
            ))}
          </nav>
          <div className="hidden border-t border-navy p-3 lg:block"><button className="navitem" onClick={() => setCollapsed(!collapsed)}><Icon n={collapsed ? "chevron" : "back"} />{!collapsed && <span>Collapse</span>}</button></div>
        </aside>
        <div className={cx("transition-all", collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]")}>
          <Header cur={cur} nav={nav} onMenu={() => setMobile(true)} />
          <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><Page key={cur.id} /></main>
        </div>
      </div>
    </NavCtx.Provider>
  );
}

function Group({ n, cur, nav, collapsed }) {
  const active = n.children.some((c) => c.id === cur);
  const [open, setOpen] = useState(true);
  if (collapsed) return n.children.map((c) => <button key={c.id} className="navitem" data-on={cur === c.id ? "1" : "0"} onClick={() => nav(c.id)} title={c.label}><Icon n={c.id === "leads" ? "leads" : c.id === "visits" ? "visit" : "call"} /></button>);
  return (
    <div>
      <button className="navitem" onClick={() => setOpen(!open)}><Icon n={n.icon} /><span className={cx("flex-1 truncate", active && "font-bold")}>{n.label}</span><Icon n={open ? "down" : "chevron"} s={15} /></button>
      {open && <div className="ml-[21px] mt-1 space-y-1 border-l border-navy pl-3">{n.children.map((c) => <button key={c.id} className="navitem h-9" data-on={cur === c.id ? "1" : "0"} onClick={() => nav(c.id)}>{c.label}</button>)}</div>}
    </div>
  );
}

function useOutside(ref, fn) { useEffect(() => { const h = (e) => ref.current && !ref.current.contains(e.target) && fn(); document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []); }

function Header({ cur, nav, onMenu }) {
  const s = useStore(); const db = s.db; const T = today();
  const [q, setQ] = useState(""); const [openN, setOpenN] = useState(false); const [openP, setOpenP] = useState(false);
  const rS = useRef(), rN = useRef(), rP = useRef();
  useOutside(rS, () => setQ("")); useOutside(rN, () => setOpenN(false)); useOutside(rP, () => setOpenP(false));
  const results = useMemo(() => {
    const qq = q.trim().toLowerCase(); if (qq.length < 2) return [];
    const m = (x) => x.toLowerCase().includes(qq);
    const leads = (s.isAdmin ? db.leads : db.leads.filter((l) => l.assignedTo === s.user.id)).filter((l) => m(l.client + l.contact + l.id)).map((l) => ({ k: "Lead", a: l.client, b: l.id, go: () => nav("leads") }));
    const projs = (s.isAdmin ? db.projects : db.projects.filter((p) => p.assignedTo === s.user.id)).filter((p) => m(p.name + p.client + p.id)).map((p) => ({ k: "Project", a: p.name, b: p.client, go: () => nav("invoices", { projectId: p.id }) }));
    const invs = db.invoices.filter((i) => m(i.number)).map((i) => ({ k: "Invoice", a: i.number, b: db.projects.find((p) => p.id === i.projectId)?.client, go: () => nav("invoices", { projectId: i.projectId, invId: i.id }) }));
    const qs = db.quotations.filter((x) => m(x.number + x.client)).map((x) => ({ k: "Quotation", a: x.number, b: x.client, go: () => nav("quotations") }));
    return [...leads, ...projs, ...invs, ...qs].slice(0, 8);
  }, [q, db]);
  const notes = useMemo(() => {
    const out = [];
    const projIds = new Set(db.projects.filter((p) => s.isAdmin || p.assignedTo === s.user.id).map((p) => p.id));
    db.invoices.filter((i) => projIds.has(i.projectId)).forEach((i) => { const t = invTotals(i); if (t.status === "Overdue") out.push({ a: `Invoice ${i.number} overdue`, b: "Due " + fmtDate(i.due), go: () => nav("invoices", { projectId: i.projectId }) }); });
    db.tasks.filter((t) => (s.isAdmin || t.assignedTo === s.user.id) && t.due === T && t.status !== "Completed").forEach((t) => out.push({ a: `Task due today: ${t.title}`, b: s.empName(t.assignedTo), go: () => nav("tasks") }));
    db.leads.filter((l) => (s.isAdmin || l.assignedTo === s.user.id) && l.followUp === T).forEach((l) => out.push({ a: `Follow-up today: ${l.client}`, b: l.contact, go: () => nav("leads") }));
    return out;
  }, [db]);
  const me = s.emp(s.user.id) || {};
  return (
    <header className="no-print sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-navy bg-white px-4 sm:px-6 lg:px-8">
      <button className="btn btn-icon lg:hidden" onClick={onMenu} aria-label="Open menu"><Icon n="menu" /></button>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[12px] font-medium"><span>Home</span>{cur.parent && <><Icon n="chevron" s={12} /><span>{cur.parent.label}</span></>}<Icon n="chevron" s={12} /><span className="font-semibold">{cur.label}</span></div>
        <div className="truncate text-[17px] font-bold">{cur.label}</div>
      </div>
      <div ref={rS} className="relative ml-auto hidden w-full max-w-sm md:block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon n="search" s={16} /></span>
        <input className="inp pl-9" placeholder="Search leads, projects, invoices…" value={q} onChange={(e) => setQ(e.target.value)} />
        {results.length > 0 && <div className="absolute left-0 right-0 top-12 z-30 rounded-xl border border-navy bg-white p-1.5" style={{ boxShadow: "var(--shadow-pop)" }}>{results.map((r, i) => <button key={i} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[rgb(11_31_68/0.05)]" onClick={() => { r.go(); setQ(""); }}><span><span className="block font-semibold">{r.a}</span><span className="text-[12px]">{r.b}</span></span><span className="badge">{r.k}</span></button>)}</div>}
      </div>
      <div className="hidden items-center gap-2 text-[13px] font-semibold xl:flex"><Icon n="calendar" s={16} />{fmtDate(T)}</div>
      <div ref={rN} className="relative ml-auto md:ml-0">
        <button className="btn btn-icon relative" onClick={() => setOpenN(!openN)} aria-label="Notifications"><Icon n="bell" />{notes.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full border border-navy bg-white px-1 text-[10px] font-bold">{notes.length}</span>}</button>
        {openN && <div className="absolute right-0 top-11 z-30 w-80 rounded-xl border border-navy bg-white" style={{ boxShadow: "var(--shadow-pop)" }}><div className="border-b border-navy px-4 py-3 font-bold">Notifications</div><div className="max-h-80 overflow-y-auto p-1.5">{notes.length ? notes.map((n, i) => <button key={i} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[rgb(11_31_68/0.05)]" onClick={() => { n.go(); setOpenN(false); }}><div className="text-[13px] font-semibold">{n.a}</div><div className="text-[12px]">{n.b}</div></button>) : <div className="p-4 text-center text-[13px]">You're all caught up.</div>}</div></div>}
      </div>
      <div ref={rP} className="relative">
        <button className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-[rgb(11_31_68/0.05)]" onClick={() => setOpenP(!openP)}>
          <Avatar name={s.user.name} photo={me.photo} />
          <span className="hidden text-left sm:block"><span className="block text-[13px] font-bold leading-tight">{s.user.name}</span><span className="block text-[11.5px] font-medium">{s.user.role}</span></span>
          <Icon n="down" s={15} />
        </button>
        {openP && <div className="absolute right-0 top-12 z-30 w-60 rounded-xl border border-navy bg-white p-1.5" style={{ boxShadow: "var(--shadow-pop)" }}>
          <div className="border-b px-3 py-2.5" style={{ borderColor: "var(--line)" }}><div className="font-bold">{s.user.name}</div><div className="text-[12px]">{me.email}</div><span className="badge mt-2">{s.user.role}</span></div>
          <button className="navitem mt-1" onClick={() => { nav("attendance"); setOpenP(false); }}><Icon n="clock" />My Attendance</button>
          <button className="navitem" onClick={() => { nav("salary"); setOpenP(false); }}><Icon n="salary" />Salary Slips</button>
          {s.isAdmin && <button className="navitem" onClick={() => { nav("settings"); setOpenP(false); }}><Icon n="settings" />Settings</button>}
          <button className="navitem" onClick={s.logout}><Icon n="logout" />Logout</button>
        </div>}
      </div>
    </header>
  );
}
