export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServerClient() as any;
    
    // Add auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const supabase = getServerClient() as any;
    
    // Add auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('vendors')
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
      } as any)
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
