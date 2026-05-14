export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { error: authError, supabase, user } = await checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const { data, error } = await supabase
      .from('expense_categories')
      .select('id, name, color, sort_order')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

