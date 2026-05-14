import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export interface AuditLogData {
  table_name: string;
  record_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SETTLEMENT' | 'PAYMENT' | 'CORRECTION';
  old_data?: any;
  new_data?: any;
  reason?: string;
  performed_by: string;
}

/**
 * Server-side service for managing the Audit Trail
 */
export class AuditService {
  constructor(private supabase: SupabaseClient<Database, 'public'>) {}

  /**
   * Logs an action to the audit_logs table
   */
  async logAction(data: AuditLogData) {
    const { error } = await this.supabase.from('audit_logs').insert({
      table_name: data.table_name,
      record_id: data.record_id,
      action: data.action,
      old_data: data.old_data || null,
      new_data: data.new_data || null,
      reason: data.reason || null,
      performed_by: data.performed_by,
    });

    if (error) {
      // We log to console but typically don't want to fail the main transaction
      // if it's just the audit log failing, though in a strict system we might.
      console.error('Audit Service Error - Failed to write log:', error.message);
      throw error;
    }

    return true;
  }

  /**
   * Helper to log a correction specifically (PRD I.2.1 Back Entry & Amendment)
   */
  async logCorrection(
    tableName: string, 
    recordId: string, 
    oldData: any, 
    newData: any, 
    reason: string, 
    userId: string
  ) {
    return this.logAction({
      table_name: tableName,
      record_id: recordId,
      action: 'CORRECTION',
      old_data: oldData,
      new_data: newData,
      reason: reason,
      performed_by: userId,
    });
  }

  /**
   * Gets audit history for a specific record
   */
  async getRecordHistory(tableName: string, recordId: string) {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*, profiles:performed_by(name, email, role)')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
