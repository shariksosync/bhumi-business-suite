import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { buildSeed } from "./data.js";
import logoAsset from "@/assets/bhumi-logo.asset.json";

const KEY = "bhumi_crm_db_v1";
const AUTH = "bhumi_crm_auth";
const Ctx = createContext(null);
export const DEFAULT_LOGO = logoAsset.url;

export function StoreProvider({ children }) {
  const [db, setDb] = useState(() => {
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch {}
    return buildSeed();
  });
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem(AUTH) || sessionStorage.getItem(AUTH); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [toasts, setToasts] = useState([]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }, [db]);

  const notify = useCallback((msg) => {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const api = useMemo(() => {
    const emp = (id) => db.employees.find((e) => e.id === id);
    return {
      db, user, toasts, notify,
      isAdmin: user?.role === "Admin",
      logo: db.settings.company.logo || DEFAULT_LOGO,
      emp, empName: (id) => emp(id)?.name || "—",
      set: (col, fn) => setDb((d) => ({ ...d, [col]: typeof fn === "function" ? fn(d[col]) : fn })),
      upsert: (col, item) => setDb((d) => ({ ...d, [col]: d[col].some((x) => x.id === item.id) ? d[col].map((x) => (x.id === item.id ? item : x)) : [item, ...d[col]] })),
      remove: (col, id) => setDb((d) => ({ ...d, [col]: d[col].filter((x) => x.id !== id) })),
      setSettings: (fn) => setDb((d) => ({ ...d, settings: typeof fn === "function" ? fn(d.settings) : fn })),
      reset: () => setDb(buildSeed()),
      login: (u, p, remember) => {
        const e = db.employees.find((x) => (x.username.toLowerCase() === u.trim().toLowerCase() || x.email.toLowerCase() === u.trim().toLowerCase()) && x.password === p);
        if (!e) return "Invalid username or password.";
        if (e.status !== "Active") return "This account is deactivated. Contact the administrator.";
        const sess = { id: e.id, name: e.name, role: e.role };
        (remember ? localStorage : sessionStorage).setItem(AUTH, JSON.stringify(sess));
        setUser(sess); return null;
      },
      logout: () => { localStorage.removeItem(AUTH); sessionStorage.removeItem(AUTH); setUser(null); },
    };
  }, [db, user, toasts, notify]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export const useStore = () => useContext(Ctx);
