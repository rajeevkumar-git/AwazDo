import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Endpoint to lookup municipal ward by latitude and longitude.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const tenantId = searchParams.get('tenant_id');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Query ward containing the point using PostGIS
    // ST_SetSRID(ST_Point(lng, lat), 4326)
    const { data: ward, error } = await supabase
      .rpc('find_ward_by_coords', {
        p_lng: lng,
        p_lat: lat,
        p_tenant_id: tenantId
      });

    if (error) {
      console.warn('PostGIS lookup failed or function missing. Falling back to default ward.');
      
      // Fallback: Return first ward available in DB for that tenant
      let query = supabase.from('wards').select('id, ward_name, ward_name_hi, ward_number, dept_id');
      if (tenantId) query = query.eq('tenant_id', tenantId);
      
      const { data: fallbackWards } = await query.limit(1);
      
      if (fallbackWards && fallbackWards.length > 0) {
        return NextResponse.json({
          success: true,
          fallback: true,
          ward: fallbackWards[0]
        });
      }
      
      return NextResponse.json({ error: 'No wards found / कोई वार्ड नहीं मिला' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ward
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
