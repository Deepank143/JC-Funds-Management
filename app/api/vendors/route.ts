export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { VendorService } from '@/lib/services/vendorService';

export async function GET() {
  try {
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    const vendorService = new VendorService(supabase);

    const { error: authError } = await auth.checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const vendors = await vendorService.listVendors();
    return NextResponse.json(vendors);
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
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    const vendorService = new VendorService(supabase);

    const { error: authError, user } = await auth.checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const body = await request.json();
    const vendor = await vendorService.createVendor(body, user!.id);

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error('Vendor creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
