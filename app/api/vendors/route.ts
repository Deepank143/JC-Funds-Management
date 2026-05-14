export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const { data, error } = await supabase
      .from('vendors')
      .select('id, name, type, phone, category_id, subcategory_id')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Vendors fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const body = await request.json();

    const { data, error } = await (supabase.from('vendors') )
      .insert({
        name: body.name,
        type: body.type || 'vendor',
        phone: body.phone,
        email: body.email,
        address: body.address,
        category_id: body.category_id,
        subcategory_id: body.subcategory_id,
        notes: body.notes,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Vendor creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
