import type { Dispatch, SetStateAction } from 'react';
import { FIELD_LABEL_OPTIONS, MODULE_OPTIONS, STAGE_OPTIONS, CORE_MODULE_IDS } from '@/services/templateCustomization';
import type { Settings } from '@/types';

interface TemplateCustomizationPanelProps {
  value: Settings;
  onChange: Dispatch<SetStateAction<Settings>>;
}

export function TemplateCustomizationPanel({ value, onChange }: TemplateCustomizationPanelProps) {
  const customization = value.templateCustomization || {};
  const stageLabels = customization.stageLabels || {};
  const fieldLabels = customization.fieldLabels || {};
  const moduleVisibility = customization.moduleVisibility || {};
  const branding = value.invoiceBranding || {};

  const updateCustomization = (patch: Partial<NonNullable<Settings['templateCustomization']>>) => {
    onChange((prev) => ({
      ...prev,
      templateCustomization: {
        ...(prev.templateCustomization || {}),
        ...patch,
      },
    }));
  };

  const updateBranding = (patch: Partial<NonNullable<Settings['invoiceBranding']>>) => {
    onChange((prev) => ({
      ...prev,
      invoiceBranding: {
        ...(prev.invoiceBranding || {}),
        ...patch,
      },
    }));
  };

  return (
    <div className="space-y-6 border-t border-border pt-6">
      <div>
        <h3 className="font-semibold text-foreground mb-2">Template Customization</h3>
        <p className="text-sm text-muted-foreground">
          Let admins tailor the CRM to their industry without changing the app code.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-1">Module Visibility</h4>
            <p className="text-xs text-muted-foreground">Show or hide modules for this industry template.</p>
          </div>
          <div className="space-y-2">
            {MODULE_OPTIONS.map((mod) => (
              <label key={mod.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={moduleVisibility[mod.id] !== false}
                  onChange={(e) => {
                    if (CORE_MODULE_IDS.includes(mod.id as any) && !e.target.checked) return;
                    updateCustomization({
                      moduleVisibility: {
                        ...moduleVisibility,
                        [mod.id]: e.target.checked,
                      },
                    })
                  }}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{mod.label}</span>
                  <span className="block text-xs text-muted-foreground">{mod.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-1">Stage Names</h4>
            <p className="text-xs text-muted-foreground">Rename the pipeline stages to match the workflow.</p>
          </div>
          <div className="grid gap-3">
            {STAGE_OPTIONS.map((stage) => (
              <div key={stage.id}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {stage.label}
                </label>
                <input
                  type="text"
                  value={stageLabels[stage.id] || ''}
                  placeholder={stage.label}
                  onChange={(e) =>
                    updateCustomization({
                      stageLabels: {
                        ...stageLabels,
                        [stage.id]: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-1">Field Labels</h4>
          <p className="text-xs text-muted-foreground">Change labels for important forms and reports.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FIELD_LABEL_OPTIONS.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={fieldLabels[field.key] || ''}
                placeholder={field.label}
                onChange={(e) =>
                  updateCustomization({
                    fieldLabels: {
                      ...fieldLabels,
                      [field.key]: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{field.help}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-1">Invoice Branding</h4>
          <p className="text-xs text-muted-foreground">Used by the printable invoice template and PDF flow.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Business Name</label>
            <input
              type="text"
              value={branding.businessName || ''}
              onChange={(e) => updateBranding({ businessName: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Logo URL</label>
            <input
              type="text"
              value={branding.logoUrl || ''}
              onChange={(e) => updateBranding({ logoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Address</label>
            <input
              type="text"
              value={branding.address || ''}
              onChange={(e) => updateBranding({ address: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phone</label>
            <input
              type="text"
              value={branding.phone || ''}
              onChange={(e) => updateBranding({ phone: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              value={branding.email || ''}
              onChange={(e) => updateBranding({ email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Website</label>
            <input
              type="text"
              value={branding.website || ''}
              onChange={(e) => updateBranding({ website: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Invoice Footer Note</label>
            <textarea
              value={branding.footerNote || ''}
              onChange={(e) => updateBranding({ footerNote: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
