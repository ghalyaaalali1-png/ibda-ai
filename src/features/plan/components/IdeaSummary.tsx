import { Lightbulb } from "lucide-react";
import type { BusinessPlan } from "../types";
import { DashCard } from "./DashCard";

export function IdeaSummary({ plan }: { plan: BusinessPlan }) {
  return (
    <DashCard id="idea" title="Business idea" icon={Lightbulb}>
      <dl className="divide-y divide-white/[0.05]">
        {plan.profile.map((field) => (
          <div key={field.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <dt className="text-sm text-mist/50">{field.label}</dt>
            <dd className="text-right text-sm font-medium text-white">{field.value}</dd>
          </div>
        ))}
      </dl>
    </DashCard>
  );
}
