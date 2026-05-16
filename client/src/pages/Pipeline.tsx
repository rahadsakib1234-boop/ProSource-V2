/**
 * Pipeline Page
 * Industry-aware Kanban board for lead pipeline management
 * Drop-in replacement for the placeholder Pipeline.tsx
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Lead } from '@/types';
import { getStageLabel } from '@/services/templateCustomization';

// ─── Industry Stage Configs ───────────────────────────────────────────────────

const INDUSTRY_STAGES: Record<string, { id: Lead['status']; label: string; color: string; bg: string; icon: string }[]> = {
  sourcing: [
    { id: 'new',         label: 'Inquiry',      color: '#6366f1', bg: '#eef2ff', icon: '📥' },
    { id: 'contacted',   label: 'Contacted',    color: '#f59e0b', bg: '#fffbeb', icon: '📞' },
    { id: 'negotiating', label: 'Negotiating',  color: '#8b5cf6', bg: '#f5f3ff', icon: '🤝' },
    { id: 'closed',      label: 'Closed Won',   color: '#10b981', bg: '#ecfdf5', icon: '✅' },
    { id: 'lost',        label: 'Lost',         color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ],
  realestate: [
    { id: 'new',         label: 'New Lead',     color: '#6366f1', bg: '#eef2ff', icon: '🏠' },
    { id: 'contacted',   label: 'Site Visit',   color: '#f59e0b', bg: '#fffbeb', icon: '👀' },
    { id: 'negotiating', label: 'Offer Made',   color: '#8b5cf6', bg: '#f5f3ff', icon: '📋' },
    { id: 'closed',      label: 'Deal Closed',  color: '#10b981', bg: '#ecfdf5', icon: '🔑' },
    { id: 'lost',        label: 'Lost',         color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ],
  agency: [
    { id: 'new',         label: 'Brief',        color: '#6366f1', bg: '#eef2ff', icon: '📝' },
    { id: 'contacted',   label: 'Proposal',     color: '#f59e0b', bg: '#fffbeb', icon: '📤' },
    { id: 'negotiating', label: 'Review',       color: '#8b5cf6', bg: '#f5f3ff', icon: '🔍' },
    { id: 'closed',      label: 'Signed',       color: '#10b981', bg: '#ecfdf5', icon: '✍️' },
    { id: 'lost',        label: 'Rejected',     color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ],
  recruiting: [
    { id: 'new',         label: 'Applied',      color: '#6366f1', bg: '#eef2ff', icon: '📄' },
    { id: 'contacted',   label: 'Screening',    color: '#f59e0b', bg: '#fffbeb', icon: '📋' },
    { id: 'negotiating', label: 'Interview',    color: '#8b5cf6', bg: '#f5f3ff', icon: '🎙️' },
    { id: 'closed',      label: 'Hired',        color: '#10b981', bg: '#ecfdf5', icon: '🎉' },
    { id: 'lost',        label: 'Rejected',     color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ],
  ecommerce: [
    { id: 'new',         label: 'Prospect',     color: '#6366f1', bg: '#eef2ff', icon: '🛒' },
    { id: 'contacted',   label: 'Engaged',      color: '#f59e0b', bg: '#fffbeb', icon: '💬' },
    { id: 'negotiating', label: 'Cart / Quote', color: '#8b5cf6', bg: '#f5f3ff', icon: '🧾' },
    { id: 'closed',      label: 'Purchased',    color: '#10b981', bg: '#ecfdf5', icon: '💰' },
    { id: 'lost',        label: 'Churned',      color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ],
  default: [
    { id: 'new',         label: 'New',          color: '#6366f1', bg: '#eef2ff', icon: '🆕' },
    { id: 'contacted',   label: 'Contacted',    color: '#f59e0b', bg: '#fffbeb', icon: '📞' },
    { id: 'negotiating', label: 'In Progress',  color: '#8b5cf6', bg: '#f5f3ff', icon: '⚙️' },
    { id: 'closed',      label: 'Won',          color: '#10b981', bg: '#ecfdf5', icon: '✅' },
    { id: 'lost',        label: 'Lost',         color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ],
};

function getStages(industry: string) {
  return INDUSTRY_STAGES[industry] ?? INDUSTRY_STAGES.default;
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead;
  stageColor: string;
  stageBg: string;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

function LeadCard({ lead, stageColor, stageBg, onDragStart, onEdit, onDelete }: LeadCardProps) {
  const createdTs = typeof lead.createdAt === 'string' ? Date.parse(lead.createdAt) : (lead.createdAt as number);
  const age = Number.isNaN(createdTs) ? 0 : Math.floor((Date.now() - createdTs) / (1000 * 60 * 60 * 24));

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      className="group bg-card border border-border rounded-xl p-3.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:-translate-y-0.5 select-none"
      style={{ borderLeft: `3px solid ${stageColor}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-foreground leading-tight">{lead.name}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(lead)}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            className="p-1 hover:bg-red-100 rounded text-muted-foreground hover:text-red-600 transition-colors"
            title="Delete"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      {lead.contact && (
        <p className="text-xs text-muted-foreground mb-1 truncate">{lead.contact}</p>
      )}

      <div className="flex flex-wrap gap-1 mt-2">
        {lead.product && (
          <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: stageBg, color: stageColor }}>
            {lead.product}
          </span>
        )}
        {lead.budget && (
          <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
            {lead.budget}
          </span>
        )}
        {lead.country && (
          <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
            🌍 {lead.country}
          </span>
        )}
      </div>

      {lead.notes && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">{lead.notes}</p>
      )}

      <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {age === 0 ? 'Today' : age === 1 ? 'Yesterday' : `${age}d ago`}
        </span>
        <span className="text-[10px] text-muted-foreground">#{lead.id.slice(-4).toUpperCase()}</span>
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  stage: { id: Lead['status']; label: string; color: string; bg: string; icon: string };
  leads: Lead[];
  onDrop: (e: React.DragEvent, stageId: Lead['status']) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  isOver: boolean;
}

function KanbanColumn({ stage, leads, onDrop, onDragOver, onDragLeave, onDragStart, onEdit, onDelete, isOver }: KanbanColumnProps) {
  const totalBudget = leads.filter(l => l.budget).length;

  return (
    <div
      className="flex flex-col min-w-[260px] w-[260px] shrink-0"
      onDrop={(e) => onDrop(e, stage.id)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{stage.icon}</span>
          <span className="font-semibold text-sm text-foreground">{stage.label}</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            style={{ background: stage.bg, color: stage.color }}
          >
            {leads.length}
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`flex-1 rounded-2xl p-2 min-h-[120px] transition-all duration-200 space-y-2 ${
          isOver
            ? 'ring-2 ring-offset-1 scale-[1.01]'
            : 'bg-secondary/40'
        }`}
        style={isOver ? { background: stage.bg, boxShadow: `0 0 0 2px ${stage.color}` } : {}}
      >
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
            <span className="text-2xl opacity-30">{stage.icon}</span>
            <p className="text-xs mt-1 opacity-50">Drop here</p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              stageColor={stage.color}
              stageBg={stage.bg}
              onDragStart={onDragStart}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Lead Form Modal ──────────────────────────────────────────────────────────

interface LeadFormProps {
  initial?: Partial<Lead>;
  onSave: (data: Partial<Lead>) => void;
  onClose: () => void;
  stages: { id: Lead['status']; label: string }[];
}

function LeadFormModal({ initial, onSave, onClose, stages }: LeadFormProps) {
  const [form, setForm] = useState<Partial<Lead>>(initial ?? { status: 'new' });

  const set = (k: keyof Lead, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">
            {initial?.id ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Name *', key: 'name', placeholder: 'Lead / company name', required: true },
            { label: 'Contact', key: 'contact', placeholder: 'Email or phone' },
            { label: 'Product / Service', key: 'product', placeholder: 'What are they interested in?' },
            { label: 'Country', key: 'country', placeholder: 'Country or region' },
            { label: 'Budget', key: 'budget', placeholder: 'e.g. $5,000 or ৳50,000' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={(form as any)[key] || ''}
                onChange={e => set(key as keyof Lead, e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Stage</label>
            <select
              value={form.status || 'new'}
              onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
            >
              {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</label>
            <textarea
              placeholder="Any additional context..."
              value={form.notes || ''}
              onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (form.name) { onSave(form); onClose(); } }}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            {initial?.id ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Pipeline Page ───────────────────────────────────────────────────────

export default function Pipeline() {
  const { leads, settings } = useApp();
  const stages = useMemo(() => getStages(settings.settings.industry || 'default'), [settings.settings.industry]);
  const customizedStages = useMemo(
    () => stages.map((stage) => ({ ...stage, label: getStageLabel(settings.settings, stage.id, stage.label) })),
    [settings.settings, stages]
  );

  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [overStage, setOverStage] = useState<Lead['status'] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filterText, setFilterText] = useState('');
  const dragCounter = useRef(0);

  // Group leads by stage, with optional filter
  const leadsByStage = useMemo(() => {
    const q = filterText.toLowerCase();
    const filtered = q
      ? leads.leads.filter(l =>
          l.name.toLowerCase().includes(q) ||
          (l.product?.toLowerCase().includes(q) ?? false) ||
          (l.contact?.toLowerCase().includes(q) ?? false)
        )
      : leads.leads;

    return customizedStages.reduce((acc, stage) => {
      acc[stage.id] = filtered.filter(l => l.status === stage.id);
      return acc;
    }, {} as Record<string, Lead[]>);
  }, [leads.leads, customizedStages, filterText]);

  const totalOpen = useMemo(
    () => leads.leads.filter(l => !['closed', 'lost'].includes(l.status)).length,
    [leads.leads]
  );

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((stageId: Lead['status']) => {
    dragCounter.current++;
    setOverStage(stageId);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) setOverStage(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, stageId: Lead['status']) => {
    e.preventDefault();
    dragCounter.current = 0;
    setOverStage(null);
    if (!draggedLead || draggedLead.status === stageId) { setDraggedLead(null); return; }
    try {
      await leads.saveLead({ ...draggedLead, status: stageId });
    } catch (err) {
      console.error('Failed to move lead:', err);
    }
    setDraggedLead(null);
  }, [draggedLead, leads]);

  const handleSaveLead = useCallback(async (data: Partial<Lead>) => {
    try {
      await leads.saveLead(data as Omit<Lead, 'id' | 'createdAt'>);
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  }, [leads]);

  const handleDeleteLead = useCallback(async (id: string) => {
    if (confirm('Delete this lead?')) {
      try { await leads.deleteLead(id); } catch (err) { console.error(err); }
    }
  }, [leads]);

  const conversionRate = leads.getConversionRate();

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalOpen} open · {conversionRate}% conversion rate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search leads..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background w-48"
            />
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Lead
            </button>
          </div>
        </div>

        {/* Stage Summary Pills */}
        <div className="flex gap-2 flex-wrap">
          {customizedStages.map(stage => {
            const count = leadsByStage[stage.id]?.length ?? 0;
            return (
              <div key={stage.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium"
                style={{ background: count > 0 ? stage.bg : undefined, color: count > 0 ? stage.color : undefined }}>
                <span>{stage.icon}</span>
                <span>{stage.label}</span>
                <span className="font-bold">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {customizedStages.map(stage => (
            <div
              key={stage.id}
              onDragEnter={() => handleDragEnter(stage.id)}
            >
              <KanbanColumn
                stage={stage}
                leads={leadsByStage[stage.id] ?? []}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragStart={handleDragStart}
                onEdit={lead => setEditingLead(lead)}
                onDelete={handleDeleteLead}
                isOver={overStage === stage.id}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {leads.leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No leads yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first lead to start tracking your pipeline</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + Add First Lead
            </button>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showForm && (
        <LeadFormModal
          stages={customizedStages}
          onSave={handleSaveLead}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <LeadFormModal
          initial={editingLead}
          stages={customizedStages}
          onSave={data => handleSaveLead({ ...editingLead, ...data })}
          onClose={() => setEditingLead(null)}
        />
      )}
    </Layout>
  );
}