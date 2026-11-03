import { useStore } from "./store.jsx";
import { calcDoc, inr, fmtDate, amountInWords, invTotals, salaryNet, fmtMonth } from "./utils.js";

function DocHeader({ title, meta }) {
  const s = useStore(); const c = s.db.settings.company;
  return (
    <div className="flex items-start justify-between border-b-2 border-navy pb-4">
      <div>
        <img src={s.logo} alt="Bhumi Business Solutions" style={{ height: 58, width: "auto" }} />
        <div className="mt-2 text-[11px] leading-relaxed">
          {c.address && <div>{c.address}</div>}
          <div>{c.email}{c.phone && ` · ${c.phone}`}</div>
          {c.gstin && <div>GSTIN: {c.gstin}</div>}{c.pan && <div>PAN: {c.pan}</div>}
          {c.state && <div>State: {c.state} ({c.stateCode})</div>}
        </div>
      </div>
      <div className="text-right">
        <div className="inline-block border-2 border-navy px-4 py-1.5 text-[16px] font-bold tracking-widest">{title}</div>
        <table className="mt-3 ml-auto text-[11px]"><tbody>{meta.map(([k, v]) => <tr key={k}><td className="pr-3 text-left font-semibold">{k}</td><td className="text-right">{v || "—"}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
function Party({ label, p }) {
  return (
    <div className="rounded-md border border-navy p-3 text-[11px] leading-relaxed">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider">{label}</div>
      <div className="text-[13px] font-bold">{p.client}</div>
      {p.contact && <div>Attn: {p.contact}</div>}<div>{p.address}</div>
      <div>{p.mobile}{p.email && ` · ${p.email}`}</div>
      {p.gstin && <div>GSTIN: {p.gstin}</div>}{p.pan && <div>PAN: {p.pan}</div>}
      {p.state && <div>State: {p.state} ({p.stateCode})</div>}
    </div>
  );
}
function ItemTable({ c, inter, unit }) {
  return (
    <table className="doc-tbl mt-4">
      <thead><tr><th>#</th><th>Description</th><th>SAC</th><th>Qty</th><th className="text-right">Rate</th><th className="text-right">Disc.</th><th className="text-right">Taxable</th><th>GST%</th>{inter ? <th className="text-right">IGST</th> : <><th className="text-right">CGST</th><th className="text-right">SGST</th></>}<th className="text-right">Amount</th></tr></thead>
      <tbody>{c.lines.map((l, i) => (
        <tr key={i}><td>{i + 1}</td><td><b>{l.service}</b>{l.desc && <div>{l.desc}</div>}</td><td>{l.sac}</td><td>{l.qty}{unit && l.unit ? " " + l.unit : ""}</td><td className="text-right">{inr(l.rate)}</td><td className="text-right">{inr(l.discount)}</td><td className="text-right">{inr(l.taxable)}</td><td>{l.gst}%</td>
          {inter ? <td className="text-right">{inr(l.igst)}</td> : <><td className="text-right">{inr(l.cgst)}</td><td className="text-right">{inr(l.sgst)}</td></>}<td className="text-right font-semibold">{inr(l.total)}</td></tr>
      ))}</tbody>
    </table>
  );
}
function Summary({ c, inter, rows = [] }) {
  return (
    <table className="doc-tbl"><tbody>
      <tr><td>Taxable Value</td><td className="text-right">{inr(c.subtotal)}</td></tr>
      {inter ? <tr><td>IGST</td><td className="text-right">{inr(c.igst)}</td></tr> : <><tr><td>CGST</td><td className="text-right">{inr(c.cgst)}</td></tr><tr><td>SGST</td><td className="text-right">{inr(c.sgst)}</td></tr></>}
      <tr><td className="font-bold">Grand Total</td><td className="text-right text-[13px] font-bold">{inr(c.total)}</td></tr>
      {rows.map(([k, v]) => <tr key={k}><td className="font-semibold">{k}</td><td className="text-right font-semibold">{v}</td></tr>)}
    </tbody></table>
  );
}
function Sign() {
  const s = useStore();
  return <div className="mt-10 text-right text-[11px]"><div>For {s.db.settings.company.name}</div><div className="mt-12 inline-block border-t border-navy pt-1 font-semibold">Authorised Signatory</div></div>;
}

export function QuotationDoc({ q }) {
  const s = useStore(); const st = s.db.settings; const c = calcDoc(q.items, q.inter);
  return (
    <div>
      <DocHeader title="QUOTATION" meta={[["Quotation No.", q.number], ["Date", fmtDate(q.date)], ["Valid Until", fmtDate(q.validity)], ["Prepared By", s.empName(q.preparedBy)]]} />
      <div className="mt-4 grid grid-cols-2 gap-4"><Party label="Quotation For" p={q} /><div className="rounded-md border border-navy p-3 text-[11px]"><div className="mb-1 text-[10px] font-bold uppercase tracking-wider">Subject</div><div className="text-[12px] font-semibold">{q.subject || "—"}</div>{q.notes && <div className="mt-2">{q.notes}</div>}</div></div>
      <ItemTable c={c} inter={q.inter} />
      <div className="mt-4 grid grid-cols-[1fr_260px] gap-4">
        <div className="text-[11px]"><div className="font-bold">Amount in Words</div><div className="italic">{amountInWords(c.total)}</div><div className="mt-3 font-bold">Terms & Conditions</div><div className="whitespace-pre-line">{st.quoteTerms}</div></div>
        <Summary c={c} inter={q.inter} />
      </div>
      <Sign />
    </div>
  );
}

export function InvoiceDoc({ inv, project }) {
  const s = useStore(); const st = s.db.settings; const c = calcDoc(inv.items, inv.inter); const t = invTotals(inv); const b = st.bank;
  return (
    <div>
      <DocHeader title="TAX INVOICE" meta={[["Invoice No.", inv.number], ["Invoice Date", fmtDate(inv.date)], ["Due Date", fmtDate(inv.due)], ["Place of Supply", `${inv.pos} (${inv.stateCode})`], ["Reverse Charge", inv.reverseCharge], ["Reference", inv.ref]]} />
      <div className="mt-4 grid grid-cols-2 gap-4"><Party label="Bill To" p={project} /><div className="rounded-md border border-navy p-3 text-[11px] leading-relaxed"><div className="mb-1 text-[10px] font-bold uppercase tracking-wider">Project</div><div className="text-[12px] font-semibold">{project.name}</div><div>Project ID: {project.id}</div><div>Supply Type: {inv.inter ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}</div></div></div>
      <ItemTable c={c} inter={inv.inter} unit />
      <div className="mt-4 grid grid-cols-[1fr_260px] gap-4">
        <div className="text-[11px] leading-relaxed">
          <div className="font-bold">Amount in Words</div><div className="italic">{amountInWords(c.total)}</div>
          <div className="mt-3 font-bold">Bank Details</div>
          {b.account ? <div>{b.holder && <div>A/c Name: {b.holder}</div>}<div>Bank: {b.bank}</div><div>A/c No.: {b.account}</div><div>IFSC: {b.ifsc}</div>{b.branch && <div>Branch: {b.branch}</div>}</div> : <div>Bank details to be configured in Settings.</div>}
          <div className="mt-3 font-bold">Payment Terms</div><div>{st.paymentTerms}</div>
          {(inv.notes || st.invoiceNotes) && <><div className="mt-3 font-bold">Notes</div><div className="whitespace-pre-line">{inv.notes || st.invoiceNotes}</div></>}
        </div>
        <Summary c={c} inter={inv.inter} rows={[["Amount Received", inr(t.paid)], ["Balance Due", inr(t.balance)]]} />
      </div>
      <Sign />
      <div className="mt-6 border-t border-navy pt-2 text-center text-[10px]">This is a computer-generated invoice.</div>
    </div>
  );
}

export function SalarySlip({ rec }) {
  const s = useStore(); const e = s.emp(rec.empId) || {};
  const earn = [["Basic Salary", rec.basic], ["HRA", rec.hra], ["Allowances", rec.allowances], ["Incentives", rec.incentives], ["Bonus", rec.bonus]];
  const ded = [["Deductions", rec.deductions], ["Advance Recovery", rec.advance]];
  const te = earn.reduce((a, x) => a + (+x[1] || 0), 0), td = ded.reduce((a, x) => a + (+x[1] || 0), 0);
  return (
    <div>
      <DocHeader title="SALARY SLIP" meta={[["Month", fmtMonth(rec.month)], ["Payment Date", fmtDate(rec.payDate)], ["Mode", rec.mode], ["Status", rec.status]]} />
      <table className="doc-tbl mt-4"><tbody>
        <tr><th>Employee</th><td>{e.name}</td><th>Employee ID</th><td>{e.id}</td></tr>
        <tr><th>Designation</th><td>{e.designation}</td><th>Department</th><td>{e.department}</td></tr>
        <tr><th>Joining Date</th><td>{fmtDate(e.joining)}</td><th>Employment Type</th><td>{e.type}</td></tr>
      </tbody></table>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <table className="doc-tbl"><thead><tr><th>Earnings</th><th className="text-right">Amount</th></tr></thead><tbody>{earn.map(([k, v]) => <tr key={k}><td>{k}</td><td className="text-right">{inr(v)}</td></tr>)}<tr><td className="font-bold">Total Earnings</td><td className="text-right font-bold">{inr(te)}</td></tr></tbody></table>
        <table className="doc-tbl"><thead><tr><th>Deductions</th><th className="text-right">Amount</th></tr></thead><tbody>{ded.map(([k, v]) => <tr key={k}><td>{k}</td><td className="text-right">{inr(v)}</td></tr>)}<tr><td className="font-bold">Total Deductions</td><td className="text-right font-bold">{inr(td)}</td></tr></tbody></table>
      </div>
      <div className="mt-4 flex items-center justify-between border-2 border-navy p-3"><span className="font-bold">Net Salary</span><span className="text-[16px] font-bold">{inr(salaryNet(rec))}</span></div>
      <div className="mt-2 text-[11px] italic">{amountInWords(salaryNet(rec))}</div>
      <Sign />
    </div>
  );
}
