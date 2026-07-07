"use client";

import Link from "next/link";
import { Factory, Plus, Sparkles } from "lucide-react";
import { useCurrentEcosystem, useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";

// Wraps any module page that requires an active ecosystem. Shows a guided
// empty state (create new / load a sample) instead of a broken/blank module
// when no ecosystem has been selected yet.
export function RequireEcosystem({ children }: { children: ReactNode }) {
  const current = useCurrentEcosystem();
  const loadSample = useAppStore((s) => s.loadSampleEcosystem);

  if (current) return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blueLight">
            <Factory size={26} className="text-brand-blue" />
          </div>
          <h2 className="text-lg font-bold text-ink-900">No ecosystem selected</h2>
          <p className="max-w-md text-sm leading-relaxed text-ink-500">
            Create a new Manufacturing-as-a-Service ecosystem, or load one of the two bundled sample
            ecosystems to explore the platform immediately.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/ecosystem-builder">
              <Button variant="primary">
                <Plus size={14} /> Create Ecosystem
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => loadSample(0)}>
              <Sparkles size={14} /> Load Catena-X Sample
            </Button>
            <Button variant="secondary" onClick={() => loadSample(1)}>
              <Sparkles size={14} /> Load Small Marketplace Sample
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
