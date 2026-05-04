import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// GET /api/expenses - List expenses with filters
export async function GET(request: Request) {
  try {
    const supabase = getServerClient() as any;
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
    const supabase = getServerClient() as any;
    const body = await request.json();

    const { data, error } = await supabase
      .from('expenses')
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
        notes: body.notes,
      } as any)
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

// PUT /api/expenses/:id/pay - Mark expense as paid
export async function PUT(request: Request) {
  try {
    const supabase = getServerClient() as any;
    const body = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    const { data, error } = await supabase
      .from('expenses')
      .update({
        payment_status: 'paid',
        amount_paid: body.amount,
        payment_mode: body.payment_mode,
        reference_number: body.reference_number,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Expense payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
