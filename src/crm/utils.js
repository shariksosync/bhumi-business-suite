const pad = (n) => String(n).padStart(2, "0");
export const iso = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
export const today = () => iso(new Date());
export const addDays = (s, n) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d); };
export const fmtDate = (s) => { if (!s) return "—"; const [y, m, d] = s.split("-"); return `${d}-${m}-${y}`; };
export const monthKey = (s) => (s || "").slice(0, 7);
export const fmtMonth = (k) => { if (!k) return "—"; const [y, m] = k.split("-"); return new Date(+y, +m - 1, 1).toLocaleString("en-IN", { month: "short", year: "numeric" }); };
export const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const inr = (n) => "₹" + r2(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const inr0 = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
export const uid = () => Math.random().toString(36).slice(2, 10);
export const nextId = (list, prefix) => {
  let max = 0;
  list.forEach((x) => { const m = String(x.id).match(/(\d+)$/); if (m) max = Math.max(max, +m[1]); });
  return prefix + String(max + 1).padStart(3, "0");
};
export const nowTime = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const hoursBetween = (a, b) => {
  if (!a || !b) return 0;
  const [h1, m1] = a.split(":").map(Number); const [h2, m2] = b.split(":").map(Number);
  return Math.max(0, r2((h2 * 60 + m2 - h1 * 60 - m1) / 60));
};

/* ---------- GST calculations ---------- */
export function calcLine(it, inter) {
  const gross = r2((+it.qty || 0) * (+it.rate || 0));
  const discount = Math.min(gross, +it.discount || 0);
  const taxable = r2(gross - discount);
  const tax = r2((taxable * (+it.gst || 0)) / 100);
  const cgst = inter ? 0 : r2(tax / 2);
  const sgst = inter ? 0 : r2(tax - cgst);
  return { ...it, gross, discount, taxable, tax, cgst, sgst, igst: inter ? tax : 0, total: r2(taxable + tax) };
}
export function calcDoc(items = [], inter) {
  const lines = items.map((i) => calcLine(i, inter));
  const sum = (k) => r2(lines.reduce((a, l) => a + l[k], 0));
  return { lines, gross: sum("gross"), discount: sum("discount"), subtotal: sum("taxable"), cgst: sum("cgst"), sgst: sum("sgst"), igst: sum("igst"), tax: sum("tax"), total: sum("total") };
}
export function invTotals(inv, todayStr = today()) {
  const { total } = calcDoc(inv.items, inv.inter);
  const paid = r2((inv.payments || []).reduce((a, p) => a + (+p.amount || 0), 0));
  const balance = r2(total - paid);
  let status = balance <= 0 && total > 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid";
  if (status !== "Paid" && inv.due && inv.due < todayStr) status = "Overdue";
  if (inv.statusOverride) status = inv.statusOverride;
  return { total, paid, balance, status };
}
export const salaryNet = (s) => r2((+s.basic || 0) + (+s.hra || 0) + (+s.allowances || 0) + (+s.incentives || 0) + (+s.bonus || 0) - (+s.deductions || 0) - (+s.advance || 0));

/* ---------- Amount in words (Indian system) ---------- */
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const two = (n) => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : ""));
const three = (n) => { const h = Math.floor(n / 100), r = n % 100; return (h ? ones[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : ""); };
function intWords(n) {
  if (n === 0) return "Zero";
  const parts = [];
  const cr = Math.floor(n / 1e7); n %= 1e7;
  const lk = Math.floor(n / 1e5); n %= 1e5;
  const th = Math.floor(n / 1000); n %= 1000;
  if (cr) parts.push(intWords(cr) + " Crore");
  if (lk) parts.push(two(lk) + " Lakh");
  if (th) parts.push(two(th) + " Thousand");
  if (n) parts.push(three(n));
  return parts.join(" ");
}
export function amountInWords(num) {
  const v = r2(num); const n = Math.floor(v); const p = Math.round((v - n) * 100);
  return "Rupees " + intWords(n) + (p ? " and " + two(p) + " Paise" : "") + " Only";
}

/* ---------- CSV ---------- */
export function exportCSV(filename, headers, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const STATES = [
  ["Andhra Pradesh", "37"], ["Assam", "18"], ["Bihar", "10"], ["Chhattisgarh", "22"], ["Delhi", "07"], ["Goa", "30"], ["Gujarat", "24"], ["Haryana", "06"], ["Himachal Pradesh", "02"], ["Jharkhand", "20"], ["Karnataka", "29"], ["Kerala", "32"], ["Madhya Pradesh", "23"], ["Maharashtra", "27"], ["Odisha", "21"], ["Punjab", "03"], ["Rajasthan", "08"], ["Tamil Nadu", "33"], ["Telangana", "36"], ["Uttar Pradesh", "09"], ["Uttarakhand", "05"], ["West Bengal", "19"],
];
export const stateCode = (name) => (STATES.find((s) => s[0] === name) || [])[1] || "";
