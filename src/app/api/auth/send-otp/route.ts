import { NextResponse } from 'next/server';

/**
 * Mock endpoint to send SMS OTP for login verification.
 * In production, it connects to Supabase Auth / MSG91.
 */
export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number / अमान्य फोन नंबर' },
        { status: 400 }
      );
    }

    // Mock OTP generation (always print to server console for testing)
    const mockOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(`\n[SMS Gateway Mock] OTP for +91${phone}: ${mockOtp} (valid for 5 mins)\n`);

    // In a real implementation:
    // const { data, error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` })

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully / ओटीपी सफलतापूर्वक भेजा गया।',
      // We pass it in local dev response only to make it easy to copy-paste
      dev_otp: mockOtp 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
