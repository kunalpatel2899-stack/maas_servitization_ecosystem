"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, ClipboardList, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Progress } from "@/components/ui/Progress";
import { useAppStore } from "@/store/useAppStore";
import type { LifecyclePhaseName, PlatformType } from "@/lib/types";
import actorTypes from "@/config/actorTypes.json";
import { toast } from "@/lib/toast";

// Each "actor presence" question maps to a concrete actor type from the
// standard catalog — answering "Yes" seeds a starter actor of that type,
// which the user can then refine further in the Actor Registry.
const ACTOR_PRESENCE_QUESTIONS: { type: string; question: string }[] = [
  { type: "Platform Operator", question: "Is there a Platform Operator orchestrating the ecosystem?" },
  { type: "Regulator", question: "Is there a Regulator overseeing this ecosystem?" },
  { type: "Standards Body", question: "Is there a Standards Body defining interoperability rules?" },
  { type: "Manufacturing Provider", question: "Is there at least one Manufacturing Provider supplying capacity?" },
  { type: "Customer", question: "Is there a Customer actor originating demand?" },
  { type: "Security Provider", question: "Is there a dedicated Security Provider?" },
  { type: "Auditor", question: "Is there an independent Auditor?" },
];

type StepAnswer = string | number | boolean;

export function QuestionnaireWizard() {
  const router = useRouter();
  const createEcosystem = useAppStore((s) => s.createEcosystem);
  const addActor = useAppStore((s) => s.addActor);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StepAnswer>>({
    name: "",
    industry: "",
    country: "",
    platform: "",
    numOrganizations: 5,
    platformType: "Centralized",
    platformOpenness: 50,
    currentPhase: "Emergence",
  });

  const totalSteps = 8 + ACTOR_PRESENCE_QUESTIONS.length; // core questions + actor presence questions
  const set = (key: string, value: StepAnswer) => setAnswers((a) => ({ ...a, [key]: value }));

  const finish = () => {
    const ecoId = createEcosystem({
      name: String(answers.name || "Unnamed Ecosystem"),
      industry: String(answers.industry || ""),
      country: String(answers.country || ""),
      platform: String(answers.platform || ""),
      description: `Ecosystem created via the Guided Questionnaire.`,
      currentPhase: answers.currentPhase as LifecyclePhaseName,
      platformType: answers.platformType as PlatformType,
      platformOpenness: Number(answers.platformOpenness),
      numOrganizations: Number(answers.numOrganizations),
    });

    for (const q of ACTOR_PRESENCE_QUESTIONS) {
      if (answers[q.type] === true) {
        const preset = (actorTypes as any[]).find((t) => t.type === q.type);
        addActor({
          ecosystemId: ecoId,
          name: q.type,
          type: q.type,
          role: preset?.defaultRole ?? q.type,
          authorityLevel: 60,
          trustLevel: 60,
          criticality: "Medium",
          platformMember: q.type === "Platform Operator",
          country: String(answers.country || ""),
          capabilities: [],
          resources: [],
          status: "Active",
        });
      }
    }

    toast.success(`Ecosystem "${String(answers.name || "Unnamed Ecosystem")}" created via the Guided Questionnaire.`);
    router.push("/actors");
  };

  const next = () => (step < totalSteps - 1 ? setStep(step + 1) : finish());
  const back = () => step > 0 && setStep(step - 1);

  const progressPct = Math.round((step / (totalSteps - 1)) * 100);

  return (
    <Card>
      <CardContent className="py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blueLight">
            <ClipboardList size={18} className="text-brand-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900">Guided Ecosystem Questionnaire</p>
            <p className="text-[11px] text-ink-400">Step {step + 1} of {totalSteps}</p>
          </div>
          <span className="font-mono text-xs font-bold text-brand-blue">{progressPct}%</span>
        </div>
        <Progress value={progressPct} status="healthy" className="mb-8 h-1.5" />

        <div className="mx-auto max-w-md">
          {step === 0 && (
            <Question label="What is the ecosystem's name?">
              <Input autoFocus value={String(answers.name)} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Catena-X" />
            </Question>
          )}
          {step === 1 && (
            <Question label="Which industry does it operate in?">
              <Input autoFocus value={String(answers.industry)} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Automotive Manufacturing" />
            </Question>
          )}
          {step === 2 && (
            <Question label="Which country is it primarily based in?">
              <Input autoFocus value={String(answers.country)} onChange={(e) => set("country", e.target.value)} placeholder="e.g. Germany" />
            </Question>
          )}
          {step === 3 && (
            <Question label="What is the platform called?">
              <Input autoFocus value={String(answers.platform)} onChange={(e) => set("platform", e.target.value)} placeholder="e.g. Shared Data Space" />
            </Question>
          )}
          {step === 4 && (
            <Question label="Roughly how many organizations participate?">
              <Input autoFocus type="number" min={1} value={Number(answers.numOrganizations)} onChange={(e) => set("numOrganizations", Number(e.target.value))} />
            </Question>
          )}
          {step === 5 && (
            <Question label="What type of platform architecture does it use?">
              <Select value={String(answers.platformType)} onChange={(e) => set("platformType", e.target.value)}>
                <option value="Centralized">Centralized</option>
                <option value="Federated">Federated</option>
                <option value="Decentralized">Decentralized</option>
              </Select>
            </Question>
          )}
          {step === 6 && (
            <Question label="How open is the platform to new participants? (0-100)">
              <Input autoFocus type="number" min={0} max={100} value={Number(answers.platformOpenness)} onChange={(e) => set("platformOpenness", Number(e.target.value))} />
            </Question>
          )}
          {step === 7 && (
            <Question label="Which lifecycle phase best describes the ecosystem today?">
              <Select value={String(answers.currentPhase)} onChange={(e) => set("currentPhase", e.target.value)}>
                <option value="Emergence">Emergence</option>
                <option value="Evolution">Evolution</option>
                <option value="Maturity">Maturity</option>
                <option value="Transformation">Transformation</option>
              </Select>
            </Question>
          )}
          {step >= 8 && step < totalSteps && (
            <Question label={ACTOR_PRESENCE_QUESTIONS[step - 8].question}>
              <div className="flex gap-3">
                <Button
                  variant={answers[ACTOR_PRESENCE_QUESTIONS[step - 8].type] === true ? "primary" : "secondary"}
                  onClick={() => set(ACTOR_PRESENCE_QUESTIONS[step - 8].type, true)}
                >
                  Yes
                </Button>
                <Button
                  variant={answers[ACTOR_PRESENCE_QUESTIONS[step - 8].type] === false ? "primary" : "secondary"}
                  onClick={() => set(ACTOR_PRESENCE_QUESTIONS[step - 8].type, false)}
                >
                  No
                </Button>
              </div>
            </Question>
          )}
        </div>

        <div className="mx-auto mt-8 flex max-w-md items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft size={14} /> Back
          </Button>
          <Button variant="primary" onClick={next}>
            {step === totalSteps - 1 ? (
              <>Create Ecosystem <CheckCircle2 size={14} /></>
            ) : (
              <>Next <ArrowRight size={14} /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-base font-semibold text-ink-900">{label}</p>
      {children}
    </div>
  );
}
