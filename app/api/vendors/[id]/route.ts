export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { VendorService } from '@/lib/services/vendorService';

// GET /api/vendors/[id] - Get vendor details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    const vendorService = new VendorService(supabase);

    const { error: authError } = await auth.checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const vendor = await vendorService.getVendorDetail(id);

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
    const { id } = params;
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    const vendorService = new VendorService(supabase);

    const { error: authError, user } = await auth.checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const body = await request.json();
    const vendor = await vendorService.updateVendor(id, body, user!.id);

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Vendor update error:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}
