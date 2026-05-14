export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('expense_subcategories')
      .select('id, name, category_id, is_default')
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Subcategories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

