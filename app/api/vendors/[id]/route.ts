export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

// GET /api/vendors/[id] - Get vendor details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const { id } = params;

    const { data: rawVendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    const vendor = rawVendor;

    if (error) throw error;
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Vendor detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// PATCH /api/vendors/[id] - Update vendor
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const { id } = params;
    const body = await request.json();

    const { data, error } = await (supabase.from('vendors') )
      .update({
        name: body.name,
        type: body.type,
        contact_person: body.contact_person,
        phone: body.phone,
        email: body.email,
        gstin: body.gstin,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Vendor update error:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}
