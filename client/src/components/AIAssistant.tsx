import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from './ui/button';
import { aiService } from '@/services/aiService';
import { Sparkles, Loader2, Trash2 } from 'lucide-react';

interface AIInsights {
  financial?: string;
  leads?: string;
}

export function AIAssistant() {
  const { clients, leads, invoices } = useApp();
  const [insights, setInsights] = useState<AIInsights>({});
  const [loading, setLoading] = useState({ financial: false, leads: false });

  const getFinancialInsight = async () => {
    setLoading(prev => ({ ...prev, financial: true }));
    try {
      const result = await aiService.getFinancialInsight(invoices.invoices, clients.clients);
      setInsights(prev => ({ ...prev, financial: result.content }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, financial: false }));
    }
  };

  const getLeadInsight = async () => {
    setLoading(prev => ({ ...prev, leads: true }));
    try {
      const openLeads = leads.getOpenLeads();
      if (openLeads.length === 0) {
        setInsights(prev => ({ ...prev, leads: 'No open leads available to analyze.' }));
        return;
      }

      const result = await aiService.analyzeLead(openLeads[0], leads.leads);
      setInsights(prev => ({ ...prev, leads: result.content }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, leads: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold">AI Sourcing Assistant</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-2">Financial Health</p>
            {insights.financial ? (
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm leading-relaxed">{insights.financial}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 opacity-50 hover:opacity-100" onClick={() => setInsights(prev => ({...prev, financial: undefined}))}>
                  <Trash2 className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                disabled={loading.financial}
                onClick={getFinancialInsight}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 h-8 text-xs font-bold rounded-lg"
              >
                {loading.financial ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : 'Analyze Revenue'}
              </Button>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-2">Lead Opportunity</p>
            {insights.leads ? (
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm leading-relaxed">{insights.leads}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 opacity-50 hover:opacity-100" onClick={() => setInsights(prev => ({...prev, leads: undefined}))}>
                  <Trash2 className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                disabled={loading.leads}
                onClick={getLeadInsight}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 h-8 text-xs font-bold rounded-lg"
              >
                {loading.leads ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : 'Analyze Best Lead'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
