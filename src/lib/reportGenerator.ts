// Governance Assessment Report generation — PDF (jsPDF + autotable),
// Excel (SheetJS/xlsx, multi-sheet workbook) and CSV (flattened sections).
// The PDF is structured like a management-consulting deliverable: cover
// page, executive summary, framework overview, full data appendices and a
// risk matrix — not a raw software export.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Actor, AssessmentResult, Dependency, Ecosystem, GovernanceRule, SimulationInputs } from "./types";
import { generateExecutiveNarrative } from "./narrativeEngine";
import { computeNetworkAnalytics } from "./networkAnalytics";
import { FRAMEWORK_STEPS, type FrameworkStepContext } from "./frameworkSteps";

export interface ReportContext {
  ecosystem: Ecosystem;
  actors: Actor[];
  dependencies: Dependency[];
  rules: GovernanceRule[];
  assessment: AssessmentResult | null;
  simulationInputs?: SimulationInputs;
  frameworkCtx?: FrameworkStepContext;
}

function fileBaseName(ecosystem: Ecosystem): string {
  return `GDSS_${ecosystem.name.replace(/[^a-z0-9]+/gi, "_")}_Assessment`;
}

const BRAND_BLUE: [number, number, number] = [11, 95, 255];
const BRAND_TEAL: [number, number, number] = [45, 198, 214];
const INK: [number, number, number] = [21, 27, 38];
const MUTED: [number, number, number] = [90, 100, 114];

function addFooters(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Governance Decision Support Platform — ROGF · TUHH Institute Log>U", 40, 812);
    doc.text(`Page ${i} of ${pageCount}`, 515, 812, { align: "right" });
  }
}

function checkPageBreak(doc: jsPDF, y: number): number {
  if (y > 700) {
    doc.addPage();
    return 50;
  }
  return y;
}

export function exportPDF(ctx: ReportContext) {
  const { ecosystem, actors, dependencies, rules, assessment } = ctx;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;

  // --- Cover page ---------------------------------------------------------
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, 595, 200, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("GOVERNANCE DECISION SUPPORT PLATFORM", marginX, 60);
  doc.setFontSize(24);
  doc.text("Governance Assessment Report", marginX, 100);
  doc.setFontSize(14);
  doc.text(ecosystem.name, marginX, 130);
  doc.setFontSize(10);
  doc.text(`${ecosystem.industry} · ${ecosystem.country} · ${ecosystem.currentPhase} Phase`, marginX, 150);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString()}`, marginX, 175);

  doc.setTextColor(...INK);
  let y = 240;
  doc.setFontSize(11);
  doc.text("Resilience-Oriented Governance Framework (ROGF) for Manufacturing-as-a-Service Ecosystems", marginX, y);
  y += 16;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("TUHH Institute Log>U — Logistik und Unternehmensführung · Master's Thesis Design Science Research Artifact", marginX, y);

  if (assessment) {
    y += 50;
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text("Headline Result", marginX, y);
    y += 20;
    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: BRAND_BLUE },
      head: [["Metric", "Value"]],
      body: [
        ["ROGMA Score", assessment.rogma.toFixed(1)],
        ["Ecosystem Health", assessment.health],
        ["Phase Gate", assessment.phaseGate],
        ["Lifecycle Readiness", `${assessment.lifecycleReadiness}%`],
      ],
    });
  }

  // --- Executive Summary ---------------------------------------------------
  doc.addPage();
  y = 50;
  doc.setFontSize(16);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Executive Summary", marginX, y);
  y += 24;
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  if (assessment) {
    const narrative = generateExecutiveNarrative(ecosystem, assessment);
    for (const para of narrative.paragraphs) {
      const lines = doc.splitTextToSize(para, 515);
      doc.text(lines, marginX, y);
      y += lines.length * 14 + 10;
      y = checkPageBreak(doc, y);
    }
  } else {
    doc.text("No ROGMA assessment has been run for this ecosystem yet. Run one from the ROGMA Assessment module for an executive summary.", marginX, y, { maxWidth: 515 });
    y += 30;
  }

  // --- Framework Overview ---------------------------------------------------
  y = checkPageBreak(doc, y + 20);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Framework Overview — 10-Step ROGF Methodology", marginX, y);
  y += 10;
  if (ctx.frameworkCtx) {
    autoTable(doc, {
      startY: y + 10,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: BRAND_TEAL },
      head: [["Step", "Module", "Status"]],
      body: FRAMEWORK_STEPS.map((s) => [String(s.step), s.label, s.isComplete(ctx.frameworkCtx!) ? "Complete" : "Pending"]),
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  // --- Ecosystem Overview ----------------------------------------------------
  y = checkPageBreak(doc, y);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Ecosystem Overview", marginX, y);
  autoTable(doc, {
    startY: y + 10,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND_BLUE },
    head: [["Field", "Value"]],
    body: [
      ["Platform", ecosystem.platform],
      ["Platform Type", ecosystem.platformType],
      ["Platform Openness", `${ecosystem.platformOpenness}%`],
      ["Number of Organizations", String(ecosystem.numOrganizations)],
      ["Current Lifecycle Phase", ecosystem.currentPhase],
      ["Date Created", ecosystem.dateCreated],
      ["Description", ecosystem.description],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // --- KPI table -------------------------------------------------------------
  if (assessment) {
    y = checkPageBreak(doc, y);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("Governance KPIs", marginX, y);
    autoTable(doc, {
      startY: y + 10,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: BRAND_BLUE },
      head: [["KPI", "Current", "Target", "Status", "Trend"]],
      body: assessment.kpis.map((k) => [k.name, `${k.current}${k.unit === "%" ? "%" : ""}`, `${k.target}${k.unit === "%" ? "%" : ""}`, k.status, k.trend]),
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  // --- Risk Matrix -------------------------------------------------------------
  if (assessment && (assessment.governanceGaps.length > 0 || assessment.dependencyRisks.length > 0)) {
    const allRisks = [...assessment.governanceGaps, ...assessment.dependencyRisks];
    const categories = [...new Set(allRisks.map((r) => r.category))];
    const severities = ["Critical", "High", "Medium", "Low"];
    y = checkPageBreak(doc, y);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("Risk Matrix", marginX, y);
    autoTable(doc, {
      startY: y + 10,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: { fontSize: 8, halign: "center" },
      headStyles: { fillColor: BRAND_TEAL },
      head: [["Category", ...severities]],
      body: categories.map((cat) => [
        cat,
        ...severities.map((sev) => String(allRisks.filter((r) => r.category === cat && r.severity === sev).length)),
      ]),
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    y = checkPageBreak(doc, y);
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text("Governance & Dependency Risks (Detail)", marginX, y);
    autoTable(doc, {
      startY: y + 10,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Title", "Severity", "Responsible Actor", "Recommended Action"]],
      body: allRisks.map((r) => [r.title, r.severity, r.responsibleActor, r.recommendedAction]),
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  // --- Network Analytics -------------------------------------------------------
  y = checkPageBreak(doc, y);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Network Analysis", marginX, y);
  const netStats = computeNetworkAnalytics(actors, dependencies);
  autoTable(doc, {
    startY: y + 10,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND_BLUE },
    head: [["Metric", "Value"]],
    body: [
      ["Most Central Actor", netStats.mostCentralActor?.name ?? "N/A"],
      ["Network Density", `${netStats.networkDensity}%`],
      ["Average Connectivity", String(netStats.avgConnectivity)],
      ["Critical Dependencies", String(netStats.criticalDependencies.length)],
      ["Single Points of Failure", netStats.singlePointsOfFailure.map((s) => s.name).join(", ") || "None detected"],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // --- Actor Inventory ---------------------------------------------------------
  y = checkPageBreak(doc, y);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`Actor Inventory (${actors.length})`, marginX, y);
  autoTable(doc, {
    startY: y + 10,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: BRAND_BLUE },
    head: [["Name", "Type", "Role", "Authority", "Trust", "Criticality", "Status"]],
    body: actors.map((a) => [a.name, a.type, a.role, String(a.authorityLevel), String(a.trustLevel), a.criticality, a.status]),
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // --- Dependency Analysis -----------------------------------------------------
  const nameOf = (id: string) => actors.find((a) => a.id === id)?.name ?? id;
  y = checkPageBreak(doc, y);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`Dependency Analysis (${dependencies.length})`, marginX, y);
  autoTable(doc, {
    startY: y + 10,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: BRAND_BLUE },
    head: [["From", "To", "Type", "Strength", "Rule", "Criticality", "Status"]],
    body: dependencies.map((d) => [nameOf(d.fromActorId), nameOf(d.toActorId), d.dependencyType, String(d.strength), d.ruleId ?? "-", d.criticality, d.status]),
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // --- Governance Rules ---------------------------------------------------------
  y = checkPageBreak(doc, y);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`Governance Rules (${rules.length})`, marginX, y);
  autoTable(doc, {
    startY: y + 10,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: BRAND_BLUE },
    head: [["ID", "Title", "Category", "Active", "Owner", "Compliance", "Impact"]],
    body: rules.map((r) => [r.id, r.title, r.category, r.active ? "Yes" : "No", r.owner, `${r.compliance}%`, r.impact]),
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // --- Recommendations -----------------------------------------------------------
  if (assessment && assessment.recommendations.length > 0) {
    y = checkPageBreak(doc, y);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("Decision Support Recommendations", marginX, y);
    autoTable(doc, {
      startY: y + 10,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: BRAND_BLUE },
      head: [["Trigger", "Priority", "Actions", "Est. ROGMA Impact"]],
      body: assessment.recommendations.map((r) => [r.trigger, r.priority, r.actions.join("; "), `~${Math.abs(r.estimatedGovernanceImprovement)} pts`]),
    });
  }

  // --- Simulation results (if provided) -------------------------------------------
  if (ctx.simulationInputs) {
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : y + 20;
    y = checkPageBreak(doc, y);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("Simulation Scenario Applied", marginX, y);
    const s = ctx.simulationInputs;
    autoTable(doc, {
      startY: y + 10,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: { fontSize: 9 },
      head: [["Scenario Lever", "Value"]],
      body: [
        ["Actor Exit", s.actorExitId ? actors.find((a) => a.id === s.actorExitId)?.name ?? s.actorExitId : "None"],
        ["Cyber Attack Severity", `${s.cyberAttackSeverity}%`],
        ["Platform Failure Severity", `${s.platformFailureSeverity}%`],
        ["Governance Change", `${s.governanceChangeDelta}`],
        ["Regulatory Change Severity", `${s.regulatoryChangeSeverity}%`],
        ["Low Interoperability Severity", `${s.lowInteroperabilitySeverity}%`],
        ["New Actor Joins", s.newActorJoins ? "Yes" : "No"],
      ],
    });
  }

  addFooters(doc);
  doc.save(`${fileBaseName(ecosystem)}.pdf`);
}

export function exportExcel(ctx: ReportContext) {
  const { ecosystem, actors, dependencies, rules, assessment } = ctx;
  const wb = XLSX.utils.book_new();
  const nameOf = (id: string) => actors.find((a) => a.id === id)?.name ?? id;

  const overviewSheet = XLSX.utils.json_to_sheet([
    { Field: "Name", Value: ecosystem.name },
    { Field: "Industry", Value: ecosystem.industry },
    { Field: "Country", Value: ecosystem.country },
    { Field: "Platform", Value: ecosystem.platform },
    { Field: "Platform Type", Value: ecosystem.platformType },
    { Field: "Platform Openness", Value: `${ecosystem.platformOpenness}%` },
    { Field: "Number of Organizations", Value: ecosystem.numOrganizations },
    { Field: "Current Phase", Value: ecosystem.currentPhase },
    { Field: "Date Created", Value: ecosystem.dateCreated },
    { Field: "ROGMA", Value: assessment?.rogma ?? "Not yet assessed" },
    { Field: "Health", Value: assessment?.health ?? "-" },
    { Field: "Phase Gate", Value: assessment?.phaseGate ?? "-" },
    { Field: "Lifecycle Readiness", Value: assessment ? `${assessment.lifecycleReadiness}%` : "-" },
  ]);
  XLSX.utils.book_append_sheet(wb, overviewSheet, "Overview");

  if (assessment) {
    const narrative = generateExecutiveNarrative(ecosystem, assessment);
    const execSheet = XLSX.utils.json_to_sheet(narrative.paragraphs.map((p, i) => ({ Paragraph: i + 1, Text: p })));
    XLSX.utils.book_append_sheet(wb, execSheet, "Executive Summary");

    const kpiSheet = XLSX.utils.json_to_sheet(
      assessment.kpis.map((k) => ({
        KPI: k.name, Current: k.current, Target: k.target, Threshold: k.threshold, Unit: k.unit, Status: k.status, Trend: k.trend,
      }))
    );
    XLSX.utils.book_append_sheet(wb, kpiSheet, "KPIs");
  }

  const actorSheet = XLSX.utils.json_to_sheet(
    actors.map((a) => ({
      Name: a.name, Type: a.type, Role: a.role, Authority: a.authorityLevel, Trust: a.trustLevel,
      Criticality: a.criticality, PlatformMember: a.platformMember, Country: a.country, Status: a.status,
      Capabilities: a.capabilities.join("; "), Resources: a.resources.join("; "),
    }))
  );
  XLSX.utils.book_append_sheet(wb, actorSheet, "Actors");

  const depSheet = XLSX.utils.json_to_sheet(
    dependencies.map((d) => ({
      From: nameOf(d.fromActorId), To: nameOf(d.toActorId), Type: d.dependencyType, Strength: d.strength,
      Rule: d.ruleId ?? "-", Criticality: d.criticality, Status: d.status,
    }))
  );
  XLSX.utils.book_append_sheet(wb, depSheet, "Dependencies");

  const netStats = computeNetworkAnalytics(actors, dependencies);
  const netSheet = XLSX.utils.json_to_sheet([
    { Metric: "Most Central Actor", Value: netStats.mostCentralActor?.name ?? "N/A" },
    { Metric: "Network Density (%)", Value: netStats.networkDensity },
    { Metric: "Average Connectivity", Value: netStats.avgConnectivity },
    { Metric: "Critical Dependencies", Value: netStats.criticalDependencies.length },
    { Metric: "Single Points of Failure", Value: netStats.singlePointsOfFailure.map((s) => s.name).join(", ") || "None" },
  ]);
  XLSX.utils.book_append_sheet(wb, netSheet, "Network Analytics");

  const ruleSheet = XLSX.utils.json_to_sheet(
    rules.map((r) => ({ ID: r.id, Title: r.title, Category: r.category, Active: r.active, Owner: r.owner, Compliance: r.compliance, Impact: r.impact }))
  );
  XLSX.utils.book_append_sheet(wb, ruleSheet, "Governance Rules");

  if (assessment) {
    const riskSheet = XLSX.utils.json_to_sheet(
      [...assessment.governanceGaps, ...assessment.dependencyRisks].map((r) => ({
        Title: r.title, Severity: r.severity, Category: r.category, ResponsibleActor: r.responsibleActor,
        RecommendedAction: r.recommendedAction, EstimatedImpact: r.estimatedImpact,
      }))
    );
    XLSX.utils.book_append_sheet(wb, riskSheet, "Risks");

    const recSheet = XLSX.utils.json_to_sheet(
      assessment.recommendations.map((r) => ({ Trigger: r.trigger, Priority: r.priority, Severity: r.severity, Actions: r.actions.join("; "), EstGovernanceImprovement: r.estimatedGovernanceImprovement }))
    );
    XLSX.utils.book_append_sheet(wb, recSheet, "Recommendations");
  }

  XLSX.writeFile(wb, `${fileBaseName(ecosystem)}.xlsx`);
}

function toCSVRow(values: (string | number | boolean)[]): string {
  return values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
}

export function exportCSV(ctx: ReportContext) {
  const { ecosystem, actors, dependencies, rules, assessment } = ctx;
  const nameOf = (id: string) => actors.find((a) => a.id === id)?.name ?? id;
  const lines: string[] = [];

  lines.push(`Governance Assessment Report — ${ecosystem.name}`);
  lines.push("");
  lines.push("ECOSYSTEM OVERVIEW");
  lines.push(toCSVRow(["Field", "Value"]));
  lines.push(toCSVRow(["Name", ecosystem.name]));
  lines.push(toCSVRow(["Industry", ecosystem.industry]));
  lines.push(toCSVRow(["Country", ecosystem.country]));
  lines.push(toCSVRow(["Platform", ecosystem.platform]));
  lines.push(toCSVRow(["Current Phase", ecosystem.currentPhase]));
  if (assessment) {
    lines.push(toCSVRow(["ROGMA", assessment.rogma]));
    lines.push(toCSVRow(["Health", assessment.health]));
    lines.push(toCSVRow(["Phase Gate", assessment.phaseGate]));
    lines.push(toCSVRow(["Lifecycle Readiness", `${assessment.lifecycleReadiness}%`]));
  }
  lines.push("");

  if (assessment) {
    lines.push("EXECUTIVE SUMMARY");
    const narrative = generateExecutiveNarrative(ecosystem, assessment);
    narrative.paragraphs.forEach((p) => lines.push(toCSVRow([p])));
    lines.push("");

    lines.push("KPIS");
    lines.push(toCSVRow(["KPI", "Current", "Target", "Status", "Trend"]));
    for (const k of assessment.kpis) lines.push(toCSVRow([k.name, k.current, k.target, k.status, k.trend]));
    lines.push("");
  }

  lines.push("ACTORS");
  lines.push(toCSVRow(["Name", "Type", "Role", "Authority", "Trust", "Criticality", "Platform Member", "Country", "Status"]));
  for (const a of actors) lines.push(toCSVRow([a.name, a.type, a.role, a.authorityLevel, a.trustLevel, a.criticality, a.platformMember, a.country, a.status]));
  lines.push("");

  lines.push("DEPENDENCIES");
  lines.push(toCSVRow(["From", "To", "Type", "Strength", "Rule", "Criticality", "Status"]));
  for (const d of dependencies) lines.push(toCSVRow([nameOf(d.fromActorId), nameOf(d.toActorId), d.dependencyType, d.strength, d.ruleId ?? "-", d.criticality, d.status]));
  lines.push("");

  const netStats = computeNetworkAnalytics(actors, dependencies);
  lines.push("NETWORK ANALYTICS");
  lines.push(toCSVRow(["Metric", "Value"]));
  lines.push(toCSVRow(["Most Central Actor", netStats.mostCentralActor?.name ?? "N/A"]));
  lines.push(toCSVRow(["Network Density (%)", netStats.networkDensity]));
  lines.push(toCSVRow(["Average Connectivity", netStats.avgConnectivity]));
  lines.push(toCSVRow(["Single Points of Failure", netStats.singlePointsOfFailure.map((s) => s.name).join("; ") || "None"]));
  lines.push("");

  lines.push("GOVERNANCE RULES");
  lines.push(toCSVRow(["ID", "Title", "Active", "Owner", "Compliance", "Impact"]));
  for (const r of rules) lines.push(toCSVRow([r.id, r.title, r.active, r.owner, r.compliance, r.impact]));

  if (assessment) {
    lines.push("");
    lines.push("RECOMMENDATIONS");
    lines.push(toCSVRow(["Trigger", "Priority", "Severity", "Actions"]));
    for (const r of assessment.recommendations) lines.push(toCSVRow([r.trigger, r.priority, r.severity, r.actions.join(" | ")]));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileBaseName(ecosystem)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
