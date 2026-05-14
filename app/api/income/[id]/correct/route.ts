import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { AuditService } from '@/lib/services/auditService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerClient();
    const authService = new AuthService(supabase);
    const auditService = new AuditService(supabase);

    const { error: authError, user } = await authService.checkOwner();
    if (authError) return authError;

    const body = await request.json();
    const incomeId = params.id;

    // BUG-03 FIX: Server-side validation — cannot be bypassed by direct API calls
    if (!body.correction_reason || String(body.correction_reason).trim().length < 10) {
      return NextResponse.json(
        { error: 'correction_reason must be at least 10 characters' },
        { status: 400 }
      );
    }
    if (!body.amount || Number(body.amount) <= 0) {
      return NextResponse.json(
        { error: 'amount must be greater than 0' },
        { status: 400 }
      );
    }

    // 1. Get original data for audit log
    const { data: originalData, error: fetchError } = await supabase
      .from('income')
      .select('*')
      .eq('id', incomeId)
      .single();

    if (fetchError || !originalData) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // 2. Perform update
    const { data: updatedData, error: updateError } = await (supabase.from('income') as any)
      .update({
        amount: body.amount,
        payment_date: body.payment_date,
        notes: body.notes,
        is_correction: true,
        correction_reason: body.correction_reason,
        original_data: originalData,
      })
      .eq('id', incomeId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Log to audit_logs using AuditService
    await auditService.logCorrection(
      'income',
      incomeId,
      originalData,
      updatedData,
      body.correction_reason,
      user.id
    );

    return NextResponse.json(updatedData);
  } catch (error: any) {
    console.error('Income correction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply correction' },
      { status: 500 }
    );
  }
}
