// Import Wizard parsing layer — accepts JSON (full ecosystem bundle), CSV
// (actor table) or Excel (.xlsx, with Actors/Dependencies/GovernanceRules
// sheets) and normalizes all three into a common ImportBundle that the
// wizard can validate and then hand to the store.

import * as XLSX from "xlsx";
import type { Actor, ActorStatus, Criticality, Dependency, DependencyStatus, Ecosystem, GovernanceRule } from "./types";
import actorTypeCatalog from "@/config/actorTypes.json";
import dependencyRuleCatalog from "@/config/dependencyRules.json";

export interface ImportBundle {
  ecosystem?: Partial<Ecosystem>;
  actors: Partial<Actor>[];
  dependencies: (Partial<Dependency> & { fromActorName?: string; toActorName?: string })[];
  rules: Partial<GovernanceRule>[];
}

export interface ImportValidation {
  errors: string[];
  warnings: string[];
  recordCounts: { actors: number; dependencies: number; rules: number };
  status: "Ready to Import" | "Has Errors";
}

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "yes", "1", "y"].includes(v.trim().toLowerCase());
  return false;
}

function toNumber(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function splitList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

// --- JSON ----------------------------------------------------------------
export function parseJSONImport(text: string): ImportBundle {
  const data = JSON.parse(text);
  return {
    ecosystem: data.ecosystem ?? undefined,
    actors: Array.isArray(data.actors) ? data.actors : [],
    dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
    rules: Array.isArray(data.governanceRules ?? data.rules) ? (data.governanceRules ?? data.rules) : [],
  };
}

// --- CSV (actors only) -----------------------------------------------------
function parseCSVRows(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells.map((c) => c.trim());
  };
  const headers = parseLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

function rowToActor(row: Record<string, string>): Partial<Actor> {
  return {
    name: row.name || row.Name,
    type: row.type || row.Type,
    role: row.role || row.Role,
    authorityLevel: toNumber(row.authorityLevel ?? row.AuthorityLevel, 50),
    trustLevel: toNumber(row.trustLevel ?? row.TrustLevel, 50),
    criticality: (row.criticality || row.Criticality || "Medium") as Criticality,
    platformMember: toBool(row.platformMember ?? row.PlatformMember),
    country: row.country || row.Country || "",
    capabilities: splitList(row.capabilities ?? row.Capabilities),
    resources: splitList(row.resources ?? row.Resources),
    status: (row.status || row.Status || "Onboarding") as ActorStatus,
  };
}

export function parseCSVImport(text: string): ImportBundle {
  const rows = parseCSVRows(text);
  return { actors: rows.map(rowToActor), dependencies: [], rules: [] };
}

// --- Excel (.xlsx) ---------------------------------------------------------
export function parseExcelImport(buffer: ArrayBuffer): ImportBundle {
  const wb = XLSX.read(buffer, { type: "array" });
  const bundle: ImportBundle = { actors: [], dependencies: [], rules: [] };

  const actorSheet = wb.Sheets["Actors"] ?? wb.Sheets[wb.SheetNames[0]];
  if (actorSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(actorSheet);
    bundle.actors = rows.map((row) => ({
      name: String(row.name ?? row.Name ?? ""),
      type: String(row.type ?? row.Type ?? ""),
      role: String(row.role ?? row.Role ?? ""),
      authorityLevel: toNumber(row.authorityLevel ?? row.AuthorityLevel, 50),
      trustLevel: toNumber(row.trustLevel ?? row.TrustLevel, 50),
      criticality: (row.criticality ?? row.Criticality ?? "Medium") as Criticality,
      platformMember: toBool(row.platformMember ?? row.PlatformMember),
      country: String(row.country ?? row.Country ?? ""),
      capabilities: splitList(row.capabilities ?? row.Capabilities),
      resources: splitList(row.resources ?? row.Resources),
      status: (row.status ?? row.Status ?? "Onboarding") as ActorStatus,
    }));
  }

  const depSheet = wb.Sheets["Dependencies"];
  if (depSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(depSheet);
    bundle.dependencies = rows.map((row) => ({
      fromActorName: String(row.from ?? row.From ?? row.fromActor ?? ""),
      toActorName: String(row.to ?? row.To ?? row.toActor ?? ""),
      dependencyType: (row.type ?? row.dependencyType ?? "Service") as Dependency["dependencyType"],
      strength: toNumber(row.strength ?? row.Strength, 50),
      ruleId: (row.ruleId ?? row.rule ?? null) as string | null,
      criticality: (row.criticality ?? row.Criticality ?? "Medium") as Criticality,
      status: (row.status ?? row.Status ?? "Active") as DependencyStatus,
    }));
  }

  const ruleSheet = wb.Sheets["GovernanceRules"];
  if (ruleSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ruleSheet);
    bundle.rules = rows.map((row) => ({
      id: String(row.id ?? row.ID ?? ""),
      title: String(row.title ?? row.Title ?? ""),
      active: toBool(row.active ?? row.Active),
      owner: String(row.owner ?? row.Owner ?? ""),
      compliance: toNumber(row.compliance ?? row.Compliance, 70),
      impact: (row.impact ?? row.Impact ?? "Medium") as Criticality,
    }));
  }

  return bundle;
}

// --- Validation ------------------------------------------------------------
const VALID_ACTOR_TYPES = new Set((actorTypeCatalog as { type: string }[]).map((a) => a.type));
const VALID_DEP_RULE_IDS = new Set((dependencyRuleCatalog as { id: string }[]).map((r) => r.id));

export function validateImportBundle(bundle: ImportBundle): ImportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  bundle.actors.forEach((a, i) => {
    if (!a.name) errors.push(`Actor row ${i + 1}: missing name.`);
    if (a.type && !VALID_ACTOR_TYPES.has(a.type)) warnings.push(`Actor "${a.name ?? i + 1}": type "${a.type}" is not in the standard actor type catalog.`);
    if (a.authorityLevel !== undefined && (a.authorityLevel < 0 || a.authorityLevel > 100)) warnings.push(`Actor "${a.name}": authorityLevel out of 0-100 range.`);
    if (a.trustLevel !== undefined && (a.trustLevel < 0 || a.trustLevel > 100)) warnings.push(`Actor "${a.name}": trustLevel out of 0-100 range.`);
  });

  const actorNames = new Set(bundle.actors.map((a) => a.name).filter(Boolean) as string[]);
  bundle.dependencies.forEach((d, i) => {
    if (!d.fromActorName && !d.fromActorId) errors.push(`Dependency row ${i + 1}: missing "from" actor.`);
    if (!d.toActorName && !d.toActorId) errors.push(`Dependency row ${i + 1}: missing "to" actor.`);
    if (d.fromActorName && !actorNames.has(d.fromActorName)) warnings.push(`Dependency row ${i + 1}: "from" actor "${d.fromActorName}" not found among imported actors.`);
    if (d.toActorName && !actorNames.has(d.toActorName)) warnings.push(`Dependency row ${i + 1}: "to" actor "${d.toActorName}" not found among imported actors.`);
    if (d.ruleId && !VALID_DEP_RULE_IDS.has(d.ruleId)) warnings.push(`Dependency row ${i + 1}: rule "${d.ruleId}" is not in the D1-D14 dependency rule catalog.`);
  });

  bundle.rules.forEach((r, i) => {
    if (!r.id) errors.push(`Governance rule row ${i + 1}: missing rule ID.`);
  });

  const recordCounts = { actors: bundle.actors.length, dependencies: bundle.dependencies.length, rules: bundle.rules.length };
  const status: ImportValidation["status"] = errors.length === 0 ? "Ready to Import" : "Has Errors";

  return { errors, warnings, recordCounts, status };
}
