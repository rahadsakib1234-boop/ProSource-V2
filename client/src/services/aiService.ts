/**
 * AI Assistant Service
 * Handles communication with the AI proxy (Supabase Edge Functions)
 */

import { supabase } from '@/lib/supabase';

export interface AIRequest {
  prompt: string;
  context?: {
    clients?: any[];
    leads?: any[];
    products?: any[];
    invoices?: any[];
    settings?: any;
  };
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

class AIService {
  /**
   * Sends a prompt to the AI assistant via the Supabase Edge Function.
   * The context object is used to provide the AI with current CRM data.
   */
  async ask(request: AIRequest): Promise<AIResponse> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Failed to read Supabase session:', sessionError.message);
      }

      const headers = sessionData?.session?.access_token
        ? { Authorization: `Bearer ${sessionData.session.access_token}` }
        : undefined;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: request,
        headers,
      });

      if (error) throw error;
      if (!data) throw new Error('AI service returned no data');

      return data as AIResponse;
    } catch (error) {
      console.error('AI Assistant Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to communicate with AI assistant');
    }
  }

  /**
   * Generates a a suggested action for a specific lead.
   */
  async analyzeLead(lead: any, otherLeads: any[]) {
    const prompt = `Analyze this lead and suggest the best next step to close the deal.
    Lead Details: ${JSON.stringify(lead)}
    Current Lead Pipeline: ${JSON.stringify(otherLeads)}`;

    return this.ask({
      prompt,
      context: { leads: otherLeads }
    });
  }

  /**
   * Summarizes the financial health of the organization.
   */
  async getFinancialInsight(invoices: any[], clients: any[]) {
    const prompt = `Analyze the following financial data and give a 2-sentence summary of the business health.
    Invoices: ${JSON.stringify(invoices)}
    Clients: ${JSON.stringify(clients)}`;

    return this.ask({
      prompt,
      context: { invoices, clients }
    });
  }
}

export const aiService = new AIService();
