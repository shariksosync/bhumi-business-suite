import { today, addDays, stateCode } from "./utils.js";

export const SERVICES = [
  ["GST Registration", "998231", 5000], ["GST Return Filing", "998231", 3000], ["Income Tax Return Filing", "998232", 4500],
  ["Accounting and Bookkeeping", "998222", 10000], ["Tax Audit", "998221", 25000], ["Statutory Audit", "998221", 40000],
  ["Payroll Management", "998223", 8000], ["Company Incorporation", "998216", 15000], ["ROC Compliance", "998216", 12000],
  ["TDS Return Filing", "998232", 3500], ["Virtual CFO Services", "998311", 30000], ["Other Consultancy Services", "998319", 5000],
];
export const LEAD_STATUSES = ["New", "Contacted", "Follow-up", "Interested", "Quotation Sent", "Converted", "Lost"];
export const LEAD_SOURCES = ["Website", "Referral", "Walk-in", "Cold Call", "LinkedIn", "Google Ads", "Existing Client"];
export const BUSINESS_TYPES = ["Private Limited", "LLP", "Partnership", "Proprietorship", "Public Limited", "Trust / NGO"];
export const QUOTE_STATUSES = ["Draft", "Sent", "Accepted", "Rejected", "Expired", "Converted"];
export const INV_STATUSES = ["Unpaid", "Partially Paid", "Paid", "Overdue"];
export const PAY_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque", "Other"];
export const EXP_CATEGORIES = ["Office Rent", "Electricity", "Internet", "Salary", "Travel", "Stationery", "Software", "Marketing", "Professional Fees", "Miscellaneous"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const TASK_STATUSES = ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"];
export const ATT_STATUSES = ["Present", "Absent", "Half Day", "Leave"];
export const GST_RATES = [0, 5, 12, 18, 28];

let seed = 7;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const pick = (a) => a[Math.floor(rnd() * a.length)];

export const DEFAULT_SETTINGS = {
  company: { name: "Bhumi Business Solutions", logo: "", email: "support@bhumibusiness.com", phone: "", address: "", gstin: "", pan: "", state: "Maharashtra", stateCode: "27" },
  invoicePrefix: "BBS/INV/", invoiceNext: 23, paymentTerms: "Payment due within 15 days from the invoice date.", defaultGst: 18,
  bank: { holder: "", bank: "", account: "", ifsc: "", branch: "" },
  invoiceNotes: "Thank you for your business.",
  quotePrefix: "BBS/QT/", quoteNext: 17, quoteValidity: 15,
  quoteTerms: "1. Fees are exclusive of government charges unless stated.\n2. 50% advance payable on acceptance.\n3. Quotation valid for the period mentioned above.",
};

export function buildSeed() {
  seed = 7;
  const T = today();
  const d = (n) => addDays(T, n);

  const empRaw = [
    ["Aarav Mehta", "Director", "Management", "Admin", "admin", "admin123", 120000],
    ["Rahul Verma", "Senior Accountant", "Accounts", "Employee", "employee", "emp123", 45000],
    ["Priya Sharma", "Tax Consultant", "Taxation", "Employee", "priya", "emp123", 52000],
    ["Vikram Singh", "Audit Executive", "Audit", "Employee", "vikram", "emp123", 40000],
    ["Sneha Iyer", "GST Specialist", "Taxation", "Employee", "sneha", "emp123", 48000],
    ["Amit Patel", "Business Development", "Sales", "Employee", "amit", "emp123", 38000],
    ["Neha Joshi", "Payroll Executive", "Accounts", "Employee", "neha", "emp123", 36000],
    ["Karan Malhotra", "Compliance Officer", "Corporate Law", "Employee", "karan", "emp123", 55000],
  ];
  const employees = empRaw.map((e, i) => ({
    id: "EMP" + String(i + 1).padStart(3, "0"), name: e[0], photo: "", mobile: "98" + String(20000000 + i * 1373571).slice(0, 8),
    email: e[4] + "@bhumibusiness.com", address: pick(["Andheri East, Mumbai", "Baner, Pune", "Thane West", "Navi Mumbai", "Powai, Mumbai"]),
    dob: `199${i % 9}-0${(i % 9) + 1}-1${i % 9}`, joining: `202${i % 5}-0${(i % 8) + 1}-01`, designation: e[1], department: e[2],
    salary: e[6], type: i === 6 ? "Part-time" : "Full-time", role: e[3], username: e[4], password: e[5], status: "Active",
  }));
  const staff = employees.slice(1).map((e) => e.id);

  const clients = [
    ["ABC Private Limited", "Rohit Agarwal", "Maharashtra", "Andheri East, Mumbai"], ["Sharma Traders", "Suresh Sharma", "Maharashtra", "Dadar, Mumbai"],
    ["Kaveri Textiles Pvt Ltd", "Lakshmi Rao", "Karnataka", "Jayanagar, Bengaluru"], ["Gupta & Sons", "Manoj Gupta", "Delhi", "Karol Bagh, New Delhi"],
    ["Nexus Infotech LLP", "Arjun Nair", "Maharashtra", "Hinjewadi, Pune"], ["Shree Balaji Enterprises", "Ramesh Jain", "Gujarat", "Navrangpura, Ahmedabad"],
    ["Patel Agro Industries", "Hitesh Patel", "Gujarat", "Rajkot"], ["Mehta Pharma Distributors", "Kavita Mehta", "Maharashtra", "Thane West"],
    ["Sunrise Hospitality Pvt Ltd", "Deepak Kulkarni", "Goa", "Panaji"], ["Orbit Logistics", "Farhan Shaikh", "Maharashtra", "Bhiwandi"],
    ["Greenleaf Organics", "Ananya Desai", "Maharashtra", "Nashik"], ["Vardhman Steel Works", "Sanjay Bansal", "Punjab", "Ludhiana"],
    ["Lotus Interiors", "Meera Kapoor", "Maharashtra", "Bandra West, Mumbai"], ["Apex Auto Parts", "Gurpreet Sandhu", "Haryana", "Gurugram"],
    ["Krishna Jewellers", "Mahesh Soni", "Rajasthan", "Jaipur"], ["Bluewave Software Pvt Ltd", "Nikhil Rao", "Telangana", "HITEC City, Hyderabad"],
  ];
  const leads = clients.map((c, i) => {
    const st = i < 10 ? "Converted" : LEAD_STATUSES[i % 7 === 5 ? 4 : i % 7];
    const sc = stateCode(c[2]);
    return {
      id: "LD" + String(i + 1).padStart(3, "0"), client: c[0], contact: c[1], mobile: "9" + String(812345670 + i * 7919).slice(0, 9),
      altMobile: i % 3 ? "" : "9" + String(712345670 + i * 3011).slice(0, 9), email: c[1].split(" ")[0].toLowerCase() + "@" + c[0].split(" ")[0].toLowerCase() + ".in",
      address: c[3] + ", " + c[2], state: c[2], gstin: sc + "AAB" + "CDEFGHJKLMNPQRST"[i] + String(1000 + i * 37) + "Q1Z" + (i % 9), pan: "AAB" + "CDEFGHJKLMNPQRST"[i] + String(1000 + i * 37) + "Q",
      businessType: BUSINESS_TYPES[i % 6], services: [SERVICES[i % 12][0], SERVICES[(i + 3) % 12][0]].join(", "), source: LEAD_SOURCES[i % 7],
      assignedTo: staff[i % staff.length], leadDate: d(-90 + i * 5), followUp: d(-3 + (i % 9)), value: SERVICES[i % 12][2] * (2 + (i % 3)),
      status: st, remarks: pick(["Keen on annual retainer", "Price sensitive", "Requires CA consultation", "Referred by existing client", "Needs GST cleanup"]),
      followups: [{ date: d(-60 + i * 4), note: "Initial discussion on requirements", by: staff[i % staff.length] }, { date: d(-40 + i * 3), note: "Shared service brochure and fee structure", by: staff[i % staff.length] }],
    };
  });

  const projectNames = ["Annual Compliance FY 2026-27", "GST & Accounting Retainer", "Statutory Audit FY 2025-26", "Tax Advisory", "Virtual CFO Engagement", "GST Compliance", "Agri Accounting Setup", "Payroll & TDS", "Hospitality Compliance", "Logistics Bookkeeping"];
  const projects = projectNames.map((n, i) => {
    const l = leads[i];
    return { id: "PRJ" + String(i + 1).padStart(3, "0"), name: n, client: l.client, contact: l.contact, mobile: l.mobile, email: l.email, gstin: l.gstin, pan: l.pan, address: l.address, state: l.state, stateCode: stateCode(l.state), assignedTo: l.assignedTo, status: i === 2 ? "Completed" : i === 8 ? "On Hold" : "Active", leadId: l.id, startDate: d(-80 + i * 4) };
  });

  const svc = (name, qty = 1, discount = 0, rate) => { const s = SERVICES.find((x) => x[0] === name); return { service: name, desc: "Professional services – " + name, sac: s[1], qty, unit: "Service", rate: rate ?? s[2], discount, gst: 18 }; };
  const plan = [
    [["GST Registration"], ["Accounting and Bookkeeping"], ["GST Return Filing"], ["ROC Compliance", "Income Tax Return Filing"]],
    [["Accounting and Bookkeeping"], ["GST Return Filing", "TDS Return Filing"], ["Accounting and Bookkeeping"]],
    [["Statutory Audit"], ["Tax Audit"]], [["Income Tax Return Filing"], ["Other Consultancy Services"]],
    [["Virtual CFO Services"], ["Virtual CFO Services"]], [["GST Registration", "GST Return Filing"], ["GST Return Filing"]],
    [["Accounting and Bookkeeping"], ["Income Tax Return Filing"]], [["Payroll Management"], ["Payroll Management", "TDS Return Filing"]],
    [["ROC Compliance"], ["Company Incorporation"]], [["Accounting and Bookkeeping"]],
  ];
  const invoices = []; let n = 1;
  plan.forEach((list, pi) => {
    const p = projects[pi];
    list.forEach((items, k) => {
      const date = d(-150 + pi * 9 + k * 28);
      const inv = {
        id: "inv" + n, number: "BBS/INV/" + String(n).padStart(3, "0"), projectId: p.id, date, due: addDays(date, 15), pos: p.state, stateCode: p.stateCode,
        inter: p.stateCode !== "27", reverseCharge: "No", ref: "", createdBy: p.assignedTo, items: items.map((s, j) => svc(s, 1, j === 0 && k % 2 ? 500 : 0)),
        payments: [], notes: "", statusOverride: "",
      };
      const total = inv.items.reduce((a, it) => a + (it.rate - it.discount) * 1.18, 0);
      const r = (pi + k) % 4;
      const pdate = addDays(date, 6);
      if (r === 0 || r === 1) inv.payments.push({ id: "p" + n, date: pdate, amount: Math.round(total * 100) / 100, mode: PAY_MODES[(pi + k) % 4], ref: "TXN" + (40000 + n * 13), notes: "" });
      if (r === 2) inv.payments.push({ id: "p" + n, date: pdate, amount: Math.round(total / 2), mode: "UPI", ref: "UPI" + (80000 + n * 7), notes: "Part payment" });
      if (r === 1 && total > 6000) { inv.payments[0].amount = Math.round(total * 0.6); inv.payments.push({ id: "q" + n, date: addDays(pdate, 10), amount: Math.round(total * 100) / 100 - Math.round(total * 0.6), mode: "Bank Transfer", ref: "NEFT" + (n * 991), notes: "Balance" }); }
      invoices.push(inv); n++;
    });
  });

  const quotations = leads.map((l, i) => {
    const date = d(-120 + i * 7);
    const items = [svc(SERVICES[i % 12][0]), ...(i % 2 ? [svc(SERVICES[(i + 3) % 12][0], 1, 250)] : [])];
    return { id: "q" + (i + 1), number: "BBS/QT/" + String(i + 1).padStart(3, "0"), date, validity: addDays(date, 15), leadId: l.id, client: l.client, contact: l.contact, mobile: l.mobile, email: l.email, address: l.address, gstin: l.gstin, state: l.state, stateCode: stateCode(l.state), inter: stateCode(l.state) !== "27", preparedBy: l.assignedTo, subject: "Proposal for " + items.map((x) => x.service).join(" & "), notes: "", items, status: i < 8 ? "Converted" : QUOTE_STATUSES[i % 5] };
  });

  const vendors = ["Regus Workspace", "Tata Power", "Airtel Business", "Uber India", "Office Depot", "Tally Solutions", "Zoho Corp", "Google India", "CA Associates", "Local Vendor"];
  const expenses = Array.from({ length: 18 }, (_, i) => {
    const cat = EXP_CATEGORIES[i % 10];
    const amount = [65000, 4200, 2999, 1850, 1200, 18000, 7500, 12000, 15000, 900][i % 10] + i * 50;
    return { id: "EXP" + String(i + 1).padStart(3, "0"), title: cat + " – " + ["Oct", "Sep", "Aug", "Jul", "Jun", "May"][i % 6], category: cat, desc: "Monthly " + cat.toLowerCase() + " expense", date: d(-i * 9), amount, gst: Math.round(amount * 0.18), vendor: vendors[i % 10], bill: "BILL-" + (2300 + i), mode: PAY_MODES[i % 4], addedBy: staff[i % staff.length], approvedBy: i % 5 === 3 ? "" : "EMP001", status: i % 5 === 3 ? "Pending" : i % 7 === 6 ? "Rejected" : "Approved" };
  });

  const taskTitles = ["File GSTR-3B", "Prepare balance sheet", "Collect TDS challans", "ROC annual filing", "Client KYC update", "Audit fieldwork", "Payroll processing", "Follow up on quotation", "Reconcile bank statements", "Draft tax notice reply", "Prepare MIS report", "ITR filing for directors"];
  const tasks = taskTitles.map((t, i) => ({ id: "TSK" + String(i + 1).padStart(3, "0"), title: t, desc: t + " for " + leads[i].client, related: leads[i].id, assignedTo: staff[i % staff.length], createdBy: "EMP001", priority: PRIORITIES[i % 4], start: d(-10 + i), due: d(-3 + i * 2), status: TASK_STATUSES[i % 5 === 4 ? 0 : i % 4], notes: i % 4 === 2 ? "Completed and shared with client" : "" }));

  const attendance = [];
  for (let k = 13; k >= 1; k--) {
    const date = d(-k); const dow = new Date(date + "T00:00:00").getDay(); if (dow === 0) continue;
    employees.forEach((e, ei) => {
      const r = (k * 7 + ei * 3) % 17;
      const status = r === 0 ? "Absent" : r === 5 ? "Leave" : r === 9 ? "Half Day" : "Present";
      attendance.push({ id: "att" + k + e.id, empId: e.id, date, in: status === "Present" || status === "Half Day" ? `09:${String(5 + ((k + ei) % 40)).padStart(2, "0")}` : "", out: status === "Present" ? `18:${String(10 + ((k * ei) % 45)).padStart(2, "0")}` : status === "Half Day" ? "13:30" : "", status, remarks: status === "Leave" ? "Approved leave" : "" });
    });
  }

  const salaries = [];
  [-2, -1].forEach((off) => {
    const dt = new Date(); dt.setDate(1); dt.setMonth(dt.getMonth() + off);
    const month = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    employees.forEach((e, i) => salaries.push({ id: "sal" + month + e.id, empId: e.id, month, basic: e.salary * 0.5, hra: e.salary * 0.2, allowances: e.salary * 0.3, incentives: i % 3 === 1 ? 2000 : 0, bonus: 0, deductions: Math.round(e.salary * 0.05), advance: i === 4 ? 3000 : 0, payDate: month + "-28", mode: "Bank Transfer", status: off === -2 ? "Paid" : i % 2 ? "Pending" : "Paid" }));
  });

  const purposes = ["Requirement discussion", "Document collection", "Proposal presentation", "Audit planning", "Fee negotiation"];
  const visits = Array.from({ length: 12 }, (_, i) => { const l = leads[i]; return { id: "VIS" + String(i + 1).padStart(3, "0"), leadId: l.id, client: l.client, contact: l.contact, date: d(-20 + i * 3), time: `1${i % 8}:30`, empId: l.assignedTo, location: l.address, purpose: purposes[i % 5], desc: "Meeting at client office", notes: i < 7 ? "Client agreed on scope; awaiting documents" : "", nextFollow: d(-10 + i * 3), status: i < 7 ? "Completed" : i === 9 ? "Cancelled" : "Scheduled" }; });
  const outcomes = ["Interested", "Call back later", "Not reachable", "Meeting fixed", "Quotation requested"];
  const calls = Array.from({ length: 14 }, (_, i) => { const l = leads[i % 16]; return { id: "CAL" + String(i + 1).padStart(3, "0"), leadId: l.id, client: l.client, number: l.mobile, date: d(-25 + i * 2), time: `1${i % 7}:1${i % 6}`, empId: l.assignedTo, direction: i % 3 ? "Outgoing" : "Incoming", purpose: purposes[(i + 2) % 5], discussion: "Discussed " + l.services.split(",")[0], outcome: outcomes[i % 5], followUp: d(-5 + i * 2), remarks: "" }; });

  return { employees, leads, projects, invoices, quotations, expenses, tasks, attendance, salaries, visits, calls, settings: DEFAULT_SETTINGS };
}
