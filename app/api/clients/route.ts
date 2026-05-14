export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

// GET /api/clients - List all clients with project counts
export async function GET(request: Request) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('clients')
      .select(`
        *,
        projects(id, status, contract_value)
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to include computed fields
    const clients = (data || []).map((client: any) => ({
      ...client,
      total_projects: client.projects?.length || 0,
      active_projects: client.projects?.filter((p: any) => p.status === 'active').length || 0,
      total_contract_value: client.projects?.reduce((sum: number, p: any) => sum + (p.contract_value || 0), 0) || 0,
    }));

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Clients fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create new client
export async function POST(request: Request) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const body = await request.json();

    const { data, error } = await (supabase.from('clients') )
      .insert({
        name: body.name,
        contact_person: body.contact_person,
        phone: body.phone,
        email: body.email,
        address: body.address,
        gstin: body.gstin,
        notes: body.notes,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Client creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
