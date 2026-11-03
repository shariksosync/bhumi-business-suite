import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "@/crm/App.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bhumi Business Solutions — CRM & Business Management" },
      { name: "description", content: "Premium CRM for Bhumi Business Solutions: leads, quotations, GST tax invoices, expenses, payroll, tasks and reports." },
      { property: "og:title", content: "Bhumi Business Solutions — CRM" },
      { property: "og:description", content: "Leads, quotations, GST invoicing, payroll and reports for financial consultancy and compliance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? <App /> : <div className="min-h-screen bg-background" />;
}
