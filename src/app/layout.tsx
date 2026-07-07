import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/Toaster";
import { ConfirmHost } from "@/components/ui/ConfirmHost";

export const metadata: Metadata = {
  title: "GDSS · Governance Assessment Platform",
  description:
    "Resilience-Oriented Governance Framework (ROGF) Governance Decision Support Platform for Manufacturing-as-a-Service ecosystems — TUHH Institute Log>U.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-base">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
        <Toaster />
        <ConfirmHost />
      </body>
    </html>
  );
}
