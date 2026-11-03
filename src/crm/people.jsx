import { useState, useMemo } from "react";
import { useStore } from "./store.jsx";
import { CrudPage, Badge, IconBtn, Avatar, PageHead, Btn, Card, Table, Modal, FormGrid, PrintModal, Stat, Tabs, Confirm, empOptions, leadOptions } from "./ui.jsx";
import { SalarySlip } from "./docs.jsx";
import { EXP_CATEGORIES, PAY_MODES, PRIORITIES, TASK_STATUSES, ATT_STATUSES } from "./data.js";
import { today, inr, inr0, fmtDate, fmtMonth, salaryNet, hoursBetween, nowTime, uid, r2, exportCSV } from "./utils.js";

export function Employees() {
  const s = useStore();
  return (
    <CrudPage title="Employees" sub="Team directory, roles and login access." col="employees" prefix="EMP" viewTitle="Employee" csv addLabel="Add Employee"
      canDelete={(r) => r.id !== s.user.id}
      defaults={() => ({ status: "Active", role: "Employee", type: "Full-time", joining: today(), password: "emp123", photo: "" })}
      validate={(v, db) => db.employees.some((e) => e.username.toLowerCase() === String(v.username).toLowerCase() && e.id !== v.id) ? "Username already in use" : null}
      fields={[{ k: "photo", label: "Profile Image", type: "image", full: true }, { k: "name", label: "Full Name", required: true }, { k: "mobile", label: "Mobile", required: true }, { k: "email", label: "Email", type: "email", required: true },
        { k: "dob", label: "Date of Birth", type: "date" }, { k: "address", label: "Address", full: true }, { k: "joining", label: "Joining Date", type: "date" }, { k: "designation", label: "Designation" }, { k: "department", label: "Department" },
        { k: "salary", label: "Monthly Salary (₹)", type: "number" }, { k: "type", label: "Employment Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Intern"] }, { k: "role", label: "Role", type: "select", options: ["Admin", "Employee"] },
        { k: "username", label: "Username", required: true }, { k: "password", label: "Demo Password", required: true }, { k: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }]}
      filters={[{ k: "department", label: "Department", options: (db) => [...new Set(db.employees.map((e) => e.department))] }, { k: "role", label: "Role", options: ["Admin", "Employee"] }, { k: "status", label: "Status", options: ["Active", "Inactive"] }]}
      rowActions={(r) => r.id !== s.user.id && <IconBtn n={r.status === "Active" ? "x" : "check"} title={r.status === "Active" ? "Deactivate" : "Activate"} onClick={() => { s.upsert("employees", { ...r, status: r.status === "Active" ? "Inactive" : "Active" }); s.notify(`${r.name} ${r.status === "Active" ? "deactivated" : "activated"}`); }} />}
      columns={[{ k: "name", label: "Employee", render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} photo={r.photo} /><div><div className="font-semibold">{r.name}</div><div className="text-[12px]">{r.id} · {r.email}</div></div></div> },
        { k: "designation", label: "Designation" }, { k: "department", label: "Department" }, { k: "mobile", label: "Mobile" }, { k: "salary", label: "Salary", type: "money", right: true }, { k: "role", label: "Role", render: (r) => <Badge>{r.role}</Badge> }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />
  );
}

export function Expenses() {
  const s = useStore();
  const setStatus = (r, status) => { s.upsert("expenses", { ...r, status, approvedBy: s.user.id }); s.notify(`Expense ${status.toLowerCase()}`); };
  return (
    <CrudPage title="Expenses" sub="Record, approve and export company expenses." col="expenses" prefix="EXP" viewTitle="Expense" csv addLabel="Add Expense"
      defaults={() => ({ date: today(), status: "Pending", addedBy: s.user.id, mode: "Bank Transfer", category: "Miscellaneous", gst: 0 })}
      fields={[{ k: "title", label: "Title", required: true }, { k: "category", label: "Category", type: "select", options: EXP_CATEGORIES, required: true }, { k: "date", label: "Date", type: "date", required: true },
        { k: "amount", label: "Amount (₹)", type: "number", required: true }, { k: "gst", label: "GST (₹)", type: "number" }, { k: "vendor", label: "Vendor" }, { k: "bill", label: "Bill Number" },
        { k: "mode", label: "Payment Mode", type: "select", options: PAY_MODES }, { k: "addedBy", label: "Added By", type: "select", options: empOptions }, { k: "approvedBy", label: "Approved By", type: "select", options: empOptions },
        { k: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"] }, { k: "desc", label: "Description", type: "textarea", full: true }]}
      filters={[{ k: "category", label: "Category", options: EXP_CATEGORIES }, { k: "status", label: "Status", options: ["Pending", "Approved", "Rejected"] }, { k: "mode", label: "Mode", options: PAY_MODES }, { k: "date", label: "Month", type: "month", match: (r, v) => r.date.startsWith(v) }]}
      rowActions={(r) => r.status === "Pending" && <><IconBtn n="check" title="Approve" onClick={() => setStatus(r, "Approved")} /><IconBtn n="x" title="Reject" onClick={() => setStatus(r, "Rejected")} /></>}
      columns={[{ k: "id", label: "Expense ID", bold: true }, { k: "title", label: "Title" }, { k: "category", label: "Category" }, { k: "date", label: "Date", type: "date" }, { k: "vendor", label: "Vendor" }, { k: "amount", label: "Amount", type: "money", right: true }, { k: "gst", label: "GST", type: "money", right: true }, { k: "mode", label: "Mode" }, { k: "addedBy", label: "Added By", render: (r) => s.empName(r.addedBy), text: (r) => s.empName(r.addedBy) }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />
  );
}

export function Tasks() {
  const s = useStore();
  return (
    <CrudPage title="Task Management" sub="Assign, prioritise and track work across the team." col="tasks" prefix="TSK" viewTitle="Task" addLabel="New Task" csv
      scope={(rows) => (s.isAdmin ? rows : rows.filter((t) => t.assignedTo === s.user.id || t.createdBy === s.user.id))}
      canDelete={(r) => s.isAdmin || r.createdBy === s.user.id}
      defaults={() => ({ start: today(), due: today(), status: "Pending", priority: "Medium", createdBy: s.user.id, assignedTo: s.user.id })}
      fields={[{ k: "title", label: "Title", required: true, full: true }, { k: "desc", label: "Description", type: "textarea", full: true }, { k: "related", label: "Related Lead / Client", type: "select", options: leadOptions },
        { k: "assignedTo", label: "Assigned Employee", type: "select", options: empOptions, required: true, disabled: !s.isAdmin }, { k: "createdBy", label: "Created By", type: "select", options: empOptions, disabled: true },
        { k: "priority", label: "Priority", type: "select", options: PRIORITIES }, { k: "start", label: "Start Date", type: "date" }, { k: "due", label: "Due Date", type: "date", required: true },
        { k: "status", label: "Status", type: "select", options: TASK_STATUSES }, { k: "notes", label: "Completion Notes", type: "textarea", full: true }]}
      filters={[{ k: "status", label: "Status", options: TASK_STATUSES }, { k: "priority", label: "Priority", options: PRIORITIES }, ...(s.isAdmin ? [{ k: "assignedTo", label: "Employee", options: empOptions }] : [])]}
      rowActions={(r) => r.status !== "Completed" && <IconBtn n="check" title="Mark completed" onClick={() => { s.upsert("tasks", { ...r, status: "Completed" }); s.notify("Task completed"); }} />}
      columns={[{ k: "id", label: "Task ID", bold: true }, { k: "title", label: "Title" }, { k: "related", label: "Related", render: (r) => s.db.leads.find((l) => l.id === r.related)?.client || "—" }, { k: "assignedTo", label: "Assigned", render: (r) => s.empName(r.assignedTo), text: (r) => s.empName(r.assignedTo) }, { k: "priority", label: "Priority", render: (r) => <Badge>{r.priority}</Badge> }, { k: "due", label: "Due", type: "date" }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]} />
  );
}

/* ---------------- Salary ---------------- */
export function Salary() {
  const s = useStore();
  const cur = today().slice(0, 7);
  const [month, setMonth] = useState(cur);
  const [emp, setEmp] = useState("");
  const [edit, setEdit] = useState(null); const [slip, setSlip] = useState(null); const [del, setDel] = useState(null);
  const rows = s.db.salaries.filter((r) => (s.isAdmin ? true : r.empId === s.user.id) && (!month || r.month === month) && (!emp || r.empId === emp)).map((r) => ({ ...r, net: salaryNet(r) }));
  const generate = () => {
    const have = new Set(s.db.salaries.filter((x) => x.month === month).map((x) => x.empId));
    const add = s.db.employees.filter((e) => e.status === "Active" && !have.has(e.id)).map((e) => ({ id: "sal" + uid(), empId: e.id, month, basic: r2(e.salary * 0.5), hra: r2(e.salary * 0.2), allowances: r2(e.salary * 0.3), incentives: 0, bonus: 0, deductions: 0, advance: 0, payDate: "", mode: "Bank Transfer", status: "Pending" }));
    if (!add.length) return s.notify(`Salaries for ${fmtMonth(month)} already generated`);
    s.set("salaries", (l) => [...add, ...l]); s.notify(`Generated ${add.length} salary records for ${fmtMonth(month)}`);
  };
  const save = () => {
    if (!edit.empId || !edit.month) return s.notify("Employee and month are required");
    if (s.db.salaries.some((x) => x.empId === edit.empId && x.month === edit.month && x.id !== edit.id)) return s.notify("Salary already exists for this employee and month");
    s.upsert("salaries", { ...edit, id: edit.id || "sal" + uid() }); s.notify("Salary saved"); setEdit(null);
  };
  const total = rows.reduce((a, r) => a + r.net, 0);
  return (
    <div>
      <PageHead title={s.isAdmin ? "Employee Salary" : "My Salary Slips"} sub={s.isAdmin ? "Monthly payroll generation with duplicate protection." : "View and print your salary slips."}>
        {s.isAdmin && <><Btn icon="plus" onClick={() => setEdit({ month, mode: "Bank Transfer", status: "Pending", basic: 0, hra: 0, allowances: 0, incentives: 0, bonus: 0, deductions: 0, advance: 0 })}>Add Entry</Btn><Btn v="primary" icon="salary" onClick={generate}>Generate {fmtMonth(month)}</Btn></>}
      </PageHead>
      {s.isAdmin && <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Records" value={rows.length} icon="user" /><Stat label="Net Payroll" value={inr0(total)} icon="salary" /><Stat label="Paid" value={rows.filter((r) => r.status === "Paid").length} icon="check" /><Stat label="Pending" value={rows.filter((r) => r.status !== "Paid").length} icon="clock" /></div>}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4" style={{ borderColor: "var(--line)" }}>
          <input type="month" className="inp w-48" value={month} onChange={(e) => setMonth(e.target.value)} />
          {s.isAdmin && <select className="inp w-52" value={emp} onChange={(e) => setEmp(e.target.value)}><option value="">Employee: All</option>{s.db.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>}
          <Btn sm v="ghost" onClick={() => setMonth("")}>All months (history)</Btn>
        </div>
        <Table rows={rows} empty={s.isAdmin ? "No salary records — click Generate to create this month's payroll" : "No salary slips for this period"}
          columns={[{ label: "Employee", render: (r) => s.empName(r.empId), bold: true }, { k: "month", label: "Month", render: (r) => fmtMonth(r.month) }, { k: "basic", label: "Basic", type: "money", right: true }, { k: "hra", label: "HRA", type: "money", right: true }, { k: "allowances", label: "Allow.", type: "money", right: true }, { label: "Incent. + Bonus", right: true, render: (r) => inr0(+r.incentives + +r.bonus) }, { label: "Deductions", right: true, render: (r) => inr0(+r.deductions + +r.advance) }, { k: "net", label: "Net Salary", right: true, bold: true, render: (r) => inr(r.net) }, { k: "payDate", label: "Paid On", type: "date" }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }]}
          actions={(r) => (<>
            <IconBtn n="print" title="Salary Slip" onClick={() => setSlip(r)} />
            {s.isAdmin && r.status !== "Paid" && <IconBtn n="check" title="Mark Paid" onClick={() => { s.upsert("salaries", { ...r, status: "Paid", payDate: r.payDate || today() }); s.notify("Marked as paid"); }} />}
            {s.isAdmin && <IconBtn n="edit" title="Edit" onClick={() => setEdit(r)} />}
            {s.isAdmin && <IconBtn n="trash" title="Delete" onClick={() => setDel(r)} />}
          </>)} />
      </div>
      {edit && (
        <Modal wide title={edit.id ? "Edit Salary" : "New Salary Entry"} onClose={() => setEdit(null)} footer={<><span className="mr-auto self-center font-bold">Net Salary: {inr(salaryNet(edit))}</span><Btn onClick={() => setEdit(null)}>Cancel</Btn><Btn v="primary" icon="check" onClick={save}>Save</Btn></>}>
          <FormGrid cols={3} value={edit} setValue={setEdit} db={s.db} fields={[{ k: "empId", label: "Employee", type: "select", options: empOptions, required: true }, { k: "month", label: "Salary Month", type: "month" }, { k: "basic", label: "Basic Salary", type: "number" }, { k: "hra", label: "HRA", type: "number" }, { k: "allowances", label: "Allowances", type: "number" }, { k: "incentives", label: "Incentives", type: "number" }, { k: "bonus", label: "Bonus", type: "number" }, { k: "deductions", label: "Deductions", type: "number" }, { k: "advance", label: "Advance Recovery", type: "number" }, { k: "payDate", label: "Payment Date", type: "date" }, { k: "mode", label: "Payment Mode", type: "select", options: PAY_MODES }, { k: "status", label: "Payment Status", type: "select", options: ["Pending", "Paid"] }]} />
        </Modal>
      )}
      {slip && <PrintModal title="Salary Slip" onClose={() => setSlip(null)}><SalarySlip rec={slip} /></PrintModal>}
      {del && <Confirm text="Delete this salary record?" onYes={() => { s.remove("salaries", del.id); s.notify("Deleted"); }} onClose={() => setDel(null)} />}
    </div>
  );
}

/* ---------------- Attendance ---------------- */
export function Attendance() {
  const s = useStore();
  const [tab, setTab] = useState("Records");
  const [month, setMonth] = useState(today().slice(0, 7));
  const [emp, setEmp] = useState("");
  const [edit, setEdit] = useState(null); const [del, setDel] = useState(null);
  const mine = s.db.attendance.find((a) => a.empId === s.user.id && a.date === today());
  const rows = s.db.attendance.filter((a) => (s.isAdmin ? !emp || a.empId === emp : a.empId === s.user.id) && (!month || a.date.startsWith(month))).sort((a, b) => (a.date < b.date ? 1 : -1)).map((a) => ({ ...a, hours: hoursBetween(a.in, a.out) }));
  const checkIn = () => { s.upsert("attendance", { id: "att" + uid(), empId: s.user.id, date: today(), in: nowTime(), out: "", status: "Present", remarks: "" }); s.notify("Checked in at " + nowTime()); };
  const checkOut = () => { s.upsert("attendance", { ...mine, out: nowTime() }); s.notify("Checked out at " + nowTime()); };
  const save = () => {
    if (!edit.empId || !edit.date) return s.notify("Employee and date are required");
    if (s.db.attendance.some((a) => a.empId === edit.empId && a.date === edit.date && a.id !== edit.id)) return s.notify("Attendance already recorded for this date");
    s.upsert("attendance", { ...edit, id: edit.id || "att" + uid() }); s.notify("Attendance saved"); setEdit(null);
  };
  const report = useMemo(() => (s.isAdmin ? s.db.employees : s.db.employees.filter((e) => e.id === s.user.id)).map((e) => {
    const r = s.db.attendance.filter((a) => a.empId === e.id && a.date.startsWith(month));
    const c = (st) => r.filter((a) => a.status === st).length;
    return { id: e.id, name: e.name, present: c("Present"), half: c("Half Day"), absent: c("Absent"), leave: c("Leave"), hours: r2(r.reduce((a, x) => a + hoursBetween(x.in, x.out), 0)) };
  }), [s.db, month]);
  return (
    <div>
      <PageHead title="Attendance" sub="Daily check-in / check-out with monthly summaries.">
        {s.isAdmin && <Btn v="primary" icon="plus" onClick={() => setEdit({ date: today(), status: "Present", in: "09:30", out: "18:30" })}>Manual Entry</Btn>}
      </PageHead>
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-navy"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B1F44" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></span>
          <div><div className="text-[12px] font-semibold uppercase tracking-wider">Today · {fmtDate(today())}</div><div className="text-[18px] font-bold">{mine ? (mine.out ? `Completed · ${hoursBetween(mine.in, mine.out)} hrs` : `Checked in at ${mine.in}`) : "Not checked in yet"}</div></div>
          <div className="ml-auto flex gap-2">
            <Btn v="primary" icon="check" disabled={!!mine} onClick={checkIn}>Check In</Btn>
            <Btn icon="logout" disabled={!mine || !!mine.out || !mine.in} onClick={checkOut}>Check Out</Btn>
          </div>
        </div>
      </Card>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs tabs={["Records", "Monthly Report"]} value={tab} onChange={setTab} />
        <input type="month" className="inp ml-auto w-48" value={month} onChange={(e) => setMonth(e.target.value)} />
        {s.isAdmin && tab === "Records" && <select className="inp w-52" value={emp} onChange={(e) => setEmp(e.target.value)}><option value="">Employee: All</option>{s.db.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>}
        {tab === "Monthly Report" && <Btn icon="download" onClick={() => exportCSV(`attendance-${month}.csv`, ["Employee", "Present", "Half Day", "Absent", "Leave", "Hours"], report.map((r) => [r.name, r.present, r.half, r.absent, r.leave, r.hours]))}>CSV</Btn>}
      </div>
      <div className="card">
        {tab === "Records" ? (
          <Table rows={rows} columns={[{ label: "Employee", bold: true, render: (r) => s.empName(r.empId) }, { k: "date", label: "Date", type: "date" }, { k: "in", label: "Check-in", render: (r) => r.in || "—" }, { k: "out", label: "Check-out", render: (r) => r.out || "—" }, { k: "hours", label: "Working Hours", right: true, render: (r) => r.hours ? r.hours.toFixed(2) + " h" : "—" }, { k: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> }, { k: "remarks", label: "Remarks" }]}
            actions={s.isAdmin ? (r) => <><IconBtn n="edit" title="Edit" onClick={() => setEdit(r)} /><IconBtn n="trash" title="Delete" onClick={() => setDel(r)} /></> : undefined} />
        ) : (
          <Table rows={report} columns={[{ k: "name", label: "Employee", bold: true }, { k: "present", label: "Present", right: true }, { k: "half", label: "Half Day", right: true }, { k: "absent", label: "Absent", right: true }, { k: "leave", label: "Leave", right: true }, { k: "hours", label: "Total Hours", right: true, render: (r) => r.hours.toFixed(2) }]} />
        )}
      </div>
      {edit && <Modal wide title={edit.id ? "Edit Attendance" : "Manual Attendance Entry"} onClose={() => setEdit(null)} footer={<><span className="mr-auto self-center font-bold">Working hours: {hoursBetween(edit.in, edit.out).toFixed(2)}</span><Btn onClick={() => setEdit(null)}>Cancel</Btn><Btn v="primary" icon="check" onClick={save}>Save</Btn></>}>
        <FormGrid value={edit} setValue={setEdit} db={s.db} fields={[{ k: "empId", label: "Employee", type: "select", options: empOptions, required: true }, { k: "date", label: "Date", type: "date" }, { k: "in", label: "Check-in", type: "time" }, { k: "out", label: "Check-out", type: "time" }, { k: "status", label: "Attendance Status", type: "select", options: ATT_STATUSES }, { k: "remarks", label: "Remarks" }]} />
      </Modal>}
      {del && <Confirm text="Delete this attendance record?" onYes={() => s.remove("attendance", del.id)} onClose={() => setDel(null)} />}
    </div>
  );
}
