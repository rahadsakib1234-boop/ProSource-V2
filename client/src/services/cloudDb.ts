/**
 * Cloud Database Service
 * Wraps Supabase calls for the CRM entities with multi-tenant isolation.
 */

import { supabase } from '@/lib/supabase';
import { Client, Product, Lead, Invoice } from '@/types';

export class CloudDb {
  /**
   * Generic getter for all records in a table for a specific organization.
   */
  async getAll<T>(table: string, organizationId: string): Promise<T[]> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching all from ${table}:`, error);
      throw error;
    }
    return data as T[];
  }

  /**
   * Get a single record by ID for a specific organization.
   */
  async get<T>(table: string, id: string, organizationId: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching ${table} record ${id}:`, error);
      throw error;
    }
    return data as T | null;
  }

  /**
   * Upsert a record for a specific organization.
   */
  async put<T extends { id: string }>(table: string, obj: T, organizationId: string): Promise<void> {
    // Ensure the record is tied to the correct organization
    const record = {
      ...obj,
      organization_id: organizationId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(table)
      .upsert(record);

    if (error) {
      console.error(`Error upserting to ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record for a specific organization.
   */
  async delete(table: string, id: string, organizationId: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }
}

export const cloudDb = new CloudDb();
