import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { AuditService } from './auditService';

/**
 * Server-side service for Vendor management
 */
export class VendorService {
  private auditService: AuditService;

  constructor(private supabase: SupabaseClient<Database, 'public'>) {
    this.auditService = new AuditService(supabase);
  }

  /**
   * Lists all vendors
   */
  async listVendors() {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('id, name, type, phone, category_id, subcategory_id')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Creates a new vendor
   */
  async createVendor(body: any, userId: string) {
    const { data, error } = await this.supabase.from('vendors')
      .insert({
        name: body.name,
        type: body.type || 'vendor',
        phone: body.phone,
        email: body.email,
        address: body.address,
        category_id: body.category_id,
        subcategory_id: body.subcategory_id,
        notes: body.notes,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Log the creation
    await this.auditService.logAction({
      table_name: 'vendors',
      record_id: data.id,
      action: 'CREATE',
      new_data: { name: data.name, type: data.type },
      reason: 'Vendor profile created',
      performed_by: userId,
    }).catch(err => console.warn('Failed to log vendor creation audit:', err));

    return data;
  }

  /**
   * Gets detailed vendor information
   */
  async getVendorDetail(id: string) {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Updates vendor profile
   */
  async updateVendor(id: string, body: any, userId: string) {
    const { data, error } = await this.supabase.from('vendors')
      .update({
        name: body.name,
        type: body.type,
        phone: body.phone,
        email: body.email,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the update
    // Note: We don't have the old data here easily without an extra query,
    // so we log the new data. In a strict system, we'd fetch old data first.
    await this.auditService.logAction({
      table_name: 'vendors',
      record_id: id,
      action: 'UPDATE',
      new_data: { name: data.name, phone: data.phone, type: data.type },
      reason: 'Vendor profile updated',
      performed_by: userId,
    }).catch(err => console.warn('Failed to log vendor update audit:', err));

    return data;
  }
}
