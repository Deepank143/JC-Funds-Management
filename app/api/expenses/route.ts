export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

// GET /api/expenses - List expenses with filters
export async function GET(request: Request) {
  try {
    const { error: authError, supabase } = await checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const categoryId = searchParams.get('category_id');
    const paymentStatus = searchParams.get('payment_status');

    let query = supabase
      .from('expenses')
      .select(`
        *,
        projects(name),
        expense_categories(name, color),
        expense_subcategories(name),
        vendors(name, type)
      `)
      .order('expense_date', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (paymentStatus) query = query.eq('payment_status', paymentStatus);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Expenses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: Request) {
  try {
    const { error: authError, supabase, user } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const body = await request.json();

    const { data, error } = await (supabase.from('expenses') as any)
      .insert({
        project_id: body.project_id,
        category_id: body.category_id,
        subcategory_id: body.subcategory_id,
        vendor_id: body.vendor_id,
        amount: body.amount,
        expense_date: body.expense_date,
        payment_status: body.payment_status || 'unpaid',
        amount_paid: body.payment_status === 'paid' ? body.amount : (body.amount_paid || 0),
        payment_mode: body.payment_mode,
        reference_number: body.reference_number,
        milestone_id: body.milestone_id,
        notes: body.notes,
        bill_photo_url: body.bill_photo_url,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Expense creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
