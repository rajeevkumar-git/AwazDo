import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { encodeGeohash } from '@/lib/geo';

/**
 * Handle complaint submission (POST) and list complaints (GET)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      tenant_id, 
      citizen_id, 
      category, 
      sub_category, 
      description, 
      lat, 
      lng, 
      address_text, 
      media_urls = [], 
      channel = 'web' 
    } = body;

    if (!tenant_id || !category || !description || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields / आवश्यक फ़ील्ड गुम हैं' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    
    // 1. Calculate Geohash for fast indexing
    const geohash = encodeGeohash(lat, lng, 7);

    // 2. Perform Deduplication check
    // Find open complaints within same 1km geohash prefix
    const { data: duplicates } = await supabase
      .from('complaints')
      .select('id, category, location')
      .eq('tenant_id', tenant_id)
      .eq('category', category)
      .eq('status', 'submitted')
      .like('geohash', `${geohash.substring(0, 5)}%`);

    let masterId = null;
    
    // If a nearby matching ticket is found, tag as child
    if (duplicates && duplicates.length > 0) {
      masterId = duplicates[0].id;
    }

    // 3. Format point geometry for PostGIS
    const locationGeoJSON = {
      type: 'Point',
      coordinates: [lng, lat]
    };

    // 4. Insert into complaints table
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        tenant_id,
        citizen_id: citizen_id || null,
        master_id: masterId,
        category,
        sub_category: sub_category || null,
        description,
        address_text,
        geohash,
        location: locationGeoJSON,
        media_before: media_urls,
        channel
      })
      .select('id, ticket_id, status, created_at, ward_id, dept_id')
      .single();

    if (error) {
      throw error;
    }

    // 5. In production, notify citizen and ward supervisors here
    console.log(`[Notification Engine] Created Ticket ${complaint.ticket_id} for Citizen ${citizen_id}. Master: ${masterId}`);

    return NextResponse.json({
      success: true,
      complaint: {
        id: complaint.id,
        ticket_id: complaint.ticket_id,
        status: complaint.status,
        created_at: complaint.created_at,
        is_duplicate: !!masterId,
        master_id: masterId
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticket_id');
    const tenantId = searchParams.get('tenant_id');
    
    const supabase = getSupabaseAdmin();

    let query = supabase.from('complaints').select(`
      *,
      wards (ward_name, ward_name_hi, ward_number),
      departments (name, name_hi)
    `);

    if (ticketId) {
      query = query.eq('ticket_id', ticketId.toUpperCase());
    }
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data: complaints, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      complaints
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
