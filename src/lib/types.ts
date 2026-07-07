// Core domain types for the ROGF Governance Assessment Platform.
// Every entity here is user-editable at runtime — nothing is hardcoded.
// Config-driven templates (actor types, governance rule definitions, KPI
// definitions, sample ecosystems) live in src/config/*.json.

export type RiskLevel = "healthy" | "warning" | "critical";
export type Criticality = "Low" | "Medium" | "High" | "Critical";
export type ActorStatus = "Active" | "Onboarding" | "Inactive" | "Exited";
export type DependencyStatus = "Active" | "At Risk" | "Broken";
export type LifecyclePhaseName = "Emergence" | "Evolution" | "Maturity" | "Transformation";
export type PhaseGate = "PASS" | "HOLD" | "FAIL";
export type PlatformType = "Centralized" | "Federated" | "Decentralized";

export interface Ecosystem {
  id: string;
  name: string;
  industry: string;
  country: string;
  platform: string;
  description: string;
  currentPhase: LifecyclePhaseName;
  platformType: PlatformType;
  platformOpenness: number; // 0-100
  numOrganizations: number;
  dateCreated: string; // ISO date
}

export interface Actor {
  id: string;
  ecosystemId: string;
  name: string;
  type: string; // e.g. "Platform Operator" — see config/actorTypes.json
  role: string; // governance role held
  authorityLevel: number; // 0-100
  trustLevel: number; // 0-100
  criticality: Criticality;
  platformMember: boolean;
  country: string;
  capabilities: string[];
  resources: string[];
  status: ActorStatus;
}

export interface Dependency {
  id: string;
  ecosystemId: string;
  fromActorId: string;
  toActorId: string;
  dependencyType: "Data" | "Material" | "Financial" | "Contractual" | "Technology" | "Service";
  strength: number; // 0-100
  ruleId: string | null; // links to a GovernanceRule id, e.g. "G4"
  criticality: Criticality;
  status: DependencyStatus;
}

export interface GovernanceRule {
  id: string; // "G1".."G14"
  ecosystemId: string;
  title: string;
  description: string;
  category: "Onboarding" | "Data" | "Risk" | "Compliance" | "Dependency" | "Lifecycle" | "Resilience";
  active: boolean;
  owner: string; // role or actor name
  compliance: number; // 0-100
  impact: Criticality;
}

export interface KPIDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  unit: "score" | "%" | "index";
  target: number;
  threshold: number; // value at which status flips to critical
  lowerIsBetter: boolean;
  category: string;
  weight: number; // contribution weight in ROGMA composite
}

export interface KPI extends KPIDefinition {
  current: number;
  trend: "up" | "down" | "flat";
  changePct: number;
  status: RiskLevel;
  history: number[]; // rolling history for sparklines, seeded then appended to at runtime
}

// Full traceability block — every risk/recommendation must be answerable
// with "why does this exist?" by pointing back to the concrete framework
// element(s) that produced it.
export interface Traceability {
  actorId?: string;
  actorName?: string;
  governanceRuleId?: string; // e.g. "G4"
  dependencyRuleId?: string; // e.g. "D12"
  lifecyclePhase?: LifecyclePhaseName;
  kpiId?: string;
}

export interface GovernanceRisk {
  id: string;
  title: string;
  severity: Criticality;
  responsibleActor: string;
  affectedRules: string[];
  recommendedAction: string;
  estimatedImpact: Criticality;
  description: string;
  category: "Governance Gap" | "Dependency Risk" | "Concentration Risk" | "Compliance Risk";
  trace: Traceability;
}

export interface Recommendation {
  id: string;
  trigger: string;
  severity: Criticality;
  actions: string[];
  relatedKPI?: string;
  trace: Traceability;
  priority: "Low" | "Medium" | "High" | "Urgent";
  estimatedImpact: "Low" | "Medium" | "High";
  implementationDifficulty: "Easy" | "Moderate" | "Hard";
  estimatedGovernanceImprovement: number; // approximate ROGMA points this action could recover
}

export interface LifecyclePhase {
  name: LifecyclePhaseName;
  completedCriteria: string[];
  remainingCriteria: string[];
  requiredKPIs: string[];
  readiness: number;
}

export interface GovernanceState {
  rogma: number;
  status: "Healthy" | "At Risk" | "Critical";
  phase: LifecyclePhaseName;
  phaseGate: PhaseGate;
  trendPct: number;
}

export interface AssessmentResult {
  id: string;
  ecosystemId: string;
  timestamp: string;
  rogma: number;
  health: "Healthy" | "At Risk" | "Critical";
  kpis: KPI[];
  lifecycleReadiness: number;
  phaseGate: PhaseGate;
  governanceGaps: GovernanceRisk[];
  dependencyRisks: GovernanceRisk[];
  recommendations: Recommendation[];
}

// --- Simulation --------------------------------------------------------

export type SimulationScenarioType =
  | "actorExit"
  | "cyberAttack"
  | "platformFailure"
  | "governanceChange"
  | "regulatoryChange"
  | "lowInteroperability"
  | "newActorJoins";

export interface SimulationInputs {
  actorExitId: string | null; // id of actor to simulate exiting; null = no exit
  cyberAttackSeverity: number; // 0-100
  platformFailureSeverity: number; // 0-100
  governanceChangeDelta: number; // -100..100, negative = governance quality decline
  regulatoryChangeSeverity: number; // 0-100, tightening compliance burden
  lowInteroperabilitySeverity: number; // 0-100
  newActorJoins: boolean; // adds one hypothetical high-trust actor
}

export interface TrendPoint {
  period: string;
  value: number;
}

export interface TrendSeries {
  id: string;
  name: string;
  color: string;
  unit: string;
  data: TrendPoint[];
}
