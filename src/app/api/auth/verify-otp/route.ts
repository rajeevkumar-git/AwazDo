import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Mock endpoint to verify SMS OTP and return citizen credentials.
 */
export async function POST(request: Request) {
  try {
    const { phone, token } = await request.json();

    if (!phone || !token) {
      return NextResponse.json(
        { error: 'Phone and token are required / फोन और टोकन आवश्यक हैं' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    
    // 1. Get or create citizen record in our DB
    const formattedPhone = `+91${phone}`;
    let { data: citizen, error: fetchError } = await supabase
      .from('citizens')
      .select('*')
      .eq('phone', formattedPhone)
      .single();

    let isNewUser = false;

    if (fetchError && fetchError.code === 'PGRST116') {
      // Citizen does not exist, create profile
      const { data: newCitizen, error: insertError } = await supabase
        .from('citizens')
        .insert({
          phone: formattedPhone,
          name: `User ${phone.substring(6)}`, // generate default name
          preferred_lang: 'hi'
        })
        .select('*')
        .single();

      if (insertError) {
        throw insertError;
      }
      citizen = newCitizen;
      isNewUser = true;
    } else if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({
      success: true,
      is_new_user: isNewUser,
      citizen,
      token: 'mock-session-token-for-dev'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
