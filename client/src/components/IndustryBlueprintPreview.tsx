import { getIndustryBlueprint } from '@/services/industryBlueprints';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'crm', label: 'CRM' },
  { key: 'operations', label: 'Operations' },
  { key: 'finance', label: 'Finance' },
  { key: 'reports', label: 'Reports' },
  { key: 'kpis', label: 'KPIs' },
  { key: 'workflows', label: 'Workflows' },
  { key: 'actions', label: 'Actions' },
] as const;

interface IndustryBlueprintPreviewProps {
  industryId: string;
  title?: string;
}

export function IndustryBlueprintPreview({ industryId, title = 'Industry blueprint' }: IndustryBlueprintPreviewProps) {
  const blueprint = getIndustryBlueprint(industryId);
  const sections = {
    dashboard: blueprint.dashboard,
    crm: blueprint.crm,
    operations: blueprint.operations,
    finance: blueprint.finance,
    reports: blueprint.reports,
    kpis: blueprint.kpis,
    workflows: blueprint.workflows,
    actions: blueprint.actions,
  } as const;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">
          The selected industry uses the same core platform structure everywhere, then fills each section with industry-specific details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section) => {
          const items = sections[section.key];
          return (
            <div key={section.key} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className="text-sm font-semibold text-foreground">{section.label}</h4>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {items.length} items
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
