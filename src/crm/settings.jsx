import { useState } from "react";
import { useStore, DEFAULT_LOGO } from "./store.jsx";
import { PageHead, Btn, Card, FormGrid, Tabs, Confirm } from "./ui.jsx";
import { GST_RATES } from "./data.js";
import { STATES, stateCode } from "./utils.js";

export function Settings() {
  const s = useStore();
  const [v, setV] = useState(s.db.settings);
  const [tab, setTab] = useState("Company Profile");
  const [reset, setReset] = useState(false);
  const co = v.company;
  const save = () => { s.setSettings(v); s.notify("Settings saved"); };
  return (
    <div>
      <PageHead title="Settings" sub="Company profile, document numbering and defaults. Stored locally in this browser.">
        <Btn onClick={() => setReset(true)}>Reset Demo Data</Btn><Btn v="primary" icon="check" onClick={save}>Save Settings</Btn>
      </PageHead>
      <div className="mb-5"><Tabs tabs={["Company Profile", "Invoice Settings", "Quotation Settings"]} value={tab} onChange={setTab} /></div>
      {tab === "Company Profile" && (
        <Card title="Company Profile">
          <div className="mb-5 flex flex-wrap items-center gap-5 rounded-xl border border-navy p-4">
            <img src={co.logo || DEFAULT_LOGO} alt="Company logo" style={{ height: 64, width: "auto" }} />
            <div className="flex flex-wrap gap-2">
              <label className="btn cursor-pointer">Upload Logo<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setV({ ...v, company: { ...co, logo: r.result } }); r.readAsDataURL(f); }} /></label>
              {co.logo && <Btn onClick={() => setV({ ...v, company: { ...co, logo: "" } })}>Use Official Logo</Btn>}
            </div>
          </div>
          <FormGrid cols={3} value={co} setValue={(c) => setV({ ...v, company: { ...c, stateCode: stateCode(c.state) || c.stateCode } })} db={s.db} fields={[
            { k: "name", label: "Company Name" }, { k: "email", label: "Email" }, { k: "phone", label: "Phone", ph: "Not set" }, { k: "gstin", label: "GSTIN", ph: "Enter company GSTIN" }, { k: "pan", label: "PAN", ph: "Enter company PAN" },
            { k: "state", label: "State", type: "select", options: STATES.map((x) => x[0]) }, { k: "stateCode", label: "State Code", disabled: true }, { k: "address", label: "Address", wide3: true, ph: "Registered office address" },
          ]} />
        </Card>
      )}
      {tab === "Invoice Settings" && (
        <div className="space-y-5">
          <Card title="Numbering & Defaults">
            <FormGrid cols={3} value={v} setValue={setV} db={s.db} fields={[{ k: "invoicePrefix", label: "Invoice Prefix" }, { k: "invoiceNext", label: "Next Number", type: "number" }, { k: "defaultGst", label: "Default GST Rate (%)", type: "select", options: GST_RATES.map((g) => ({ v: g, l: g + "%" })) }, { k: "paymentTerms", label: "Payment Terms", type: "textarea", wide3: true }, { k: "invoiceNotes", label: "Invoice Notes", type: "textarea", wide3: true }]} />
          </Card>
          <Card title="Bank Details (printed on invoices)">
            <FormGrid cols={3} value={v.bank} setValue={(b) => setV({ ...v, bank: b })} db={s.db} fields={[{ k: "holder", label: "Account Holder", ph: "Not set" }, { k: "bank", label: "Bank Name", ph: "Not set" }, { k: "account", label: "Account Number", ph: "Not set" }, { k: "ifsc", label: "IFSC", ph: "Not set" }, { k: "branch", label: "Branch", ph: "Not set" }]} />
          </Card>
        </div>
      )}
      {tab === "Quotation Settings" && (
        <Card title="Quotation Settings">
          <FormGrid cols={3} value={v} setValue={setV} db={s.db} fields={[{ k: "quotePrefix", label: "Quotation Prefix" }, { k: "quoteNext", label: "Next Number", type: "number" }, { k: "quoteValidity", label: "Default Validity (days)", type: "number" }, { k: "quoteTerms", label: "Terms and Conditions", type: "textarea", wide3: true }]} />
        </Card>
      )}
      {reset && <Confirm text="Reset all records and settings to the original demo data? Your changes will be lost." onYes={() => { s.reset(); setV(s.db.settings); s.notify("Demo data restored"); }} onClose={() => setReset(false)} />}
    </div>
  );
}
