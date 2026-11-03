import { SERVICES, GST_RATES } from "./data.js";
import { calcLine, inr, amountInWords } from "./utils.js";
import { Btn, IconBtn } from "./ui.jsx";

export const blankItem = (gst = 18) => ({ service: "", desc: "", sac: "", qty: 1, unit: "Service", rate: 0, discount: 0, gst });

export function ItemsEditor({ items, setItems, inter, unit }) {
  const upd = (i, patch) => setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-navy">
        <table className="tbl min-w-[1000px]">
          <thead><tr><th>#</th><th style={{ minWidth: 200 }}>Service</th><th>SAC</th><th>Qty</th>{unit && <th>Unit</th>}<th>Rate</th><th>Discount ₹</th><th>GST %</th><th className="text-right">Taxable</th><th className="text-right">{inter ? "IGST" : "CGST + SGST"}</th><th className="text-right">Total</th><th /></tr></thead>
          <tbody>
            {items.map((it, i) => {
              const c = calcLine(it, inter);
              const custom = !GST_RATES.includes(+it.gst);
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <select className="inp mb-1.5" value={SERVICES.some((s) => s[0] === it.service) ? it.service : it.service ? "__c" : ""} onChange={(e) => { const sv = SERVICES.find((s) => s[0] === e.target.value); if (sv) upd(i, { service: sv[0], sac: sv[1], rate: it.rate || sv[2], desc: it.desc || "Professional services – " + sv[0] }); else upd(i, { service: "Custom Service" }); }}>
                      <option value="">Select service…</option>{SERVICES.map((s) => <option key={s[0]}>{s[0]}</option>)}<option value="__c">Custom…</option>
                    </select>
                    {!SERVICES.some((s) => s[0] === it.service) && it.service && <input className="inp mb-1.5" value={it.service} onChange={(e) => upd(i, { service: e.target.value })} placeholder="Service name" />}
                    <input className="inp" value={it.desc} onChange={(e) => upd(i, { desc: e.target.value })} placeholder="Description" />
                  </td>
                  <td><input className="inp w-24" value={it.sac} onChange={(e) => upd(i, { sac: e.target.value })} /></td>
                  <td><input className="inp w-16" type="number" min="0" value={it.qty} onChange={(e) => upd(i, { qty: +e.target.value })} /></td>
                  {unit && <td><input className="inp w-24" value={it.unit || ""} onChange={(e) => upd(i, { unit: e.target.value })} /></td>}
                  <td><input className="inp w-28" type="number" min="0" value={it.rate} onChange={(e) => upd(i, { rate: +e.target.value })} /></td>
                  <td><input className="inp w-24" type="number" min="0" value={it.discount} onChange={(e) => upd(i, { discount: +e.target.value })} /></td>
                  <td>
                    <select className="inp w-24" value={custom ? "c" : it.gst} onChange={(e) => upd(i, { gst: e.target.value === "c" ? 3 : +e.target.value })}>{GST_RATES.map((g) => <option key={g} value={g}>{g}%</option>)}<option value="c">Custom</option></select>
                    {custom && <input className="inp mt-1.5 w-24" type="number" min="0" step="0.01" value={it.gst} onChange={(e) => upd(i, { gst: +e.target.value })} />}
                  </td>
                  <td className="text-right">{inr(c.taxable)}</td>
                  <td className="text-right">{inter ? inr(c.igst) : `${inr(c.cgst)} + ${inr(c.sgst)}`}</td>
                  <td className="text-right font-semibold">{inr(c.total)}</td>
                  <td>{items.length > 1 && <IconBtn n="trash" title="Remove line" onClick={() => setItems(items.filter((_, j) => j !== i))} />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Btn className="mt-3" icon="plus" onClick={() => setItems([...items, blankItem()])}>Add Line Item</Btn>
    </div>
  );
}

export function Totals({ c, inter, extra }) {
  const row = (k, v, b) => <div className={"flex justify-between py-1.5 " + (b ? "text-[16px] font-bold" : "")}><span>{k}</span><span>{v}</span></div>;
  return (
    <div className="rounded-xl border border-navy p-5">
      {row("Gross Amount", inr(c.gross))}{row("Discount", "− " + inr(c.discount))}{row("Taxable Value", inr(c.subtotal))}
      {inter ? row("IGST", inr(c.igst)) : <>{row("CGST", inr(c.cgst))}{row("SGST", inr(c.sgst))}</>}
      <div className="my-2 border-t-2 border-navy" />
      {row("Grand Total", inr(c.total), true)}
      {extra}
      <div className="mt-3 text-[12px] font-medium italic">{amountInWords(c.total)}</div>
    </div>
  );
}
