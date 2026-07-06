import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ComplaintStatus } from '@/lib/types';

// Valid status transitions state machine
const VALID_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  submitted: ['acknowledged', 'rejected'],
  acknowledged: ['in_progress', 'rejected', 'escalated'],
  in_progress: ['resolved', 'escalated'],
  resolved: ['closed', 'in_progress'], // can reopen back to in_progress
  closed: [], // Terminal state
  rejected: [], // Terminal state
  escalated: ['resolved', 'rejected']
};

/**
 * Update complaint status (PATCH)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, note, officer_id } = await request.json();
    const complaintId = params.id;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch current status
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('status, ticket_id, citizen_id')
      .eq('id', complaintId)
      .single();

    if (fetchError || !complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const currentStatus = complaint.status as ComplaintStatus;
    const nextStatus = status as ComplaintStatus;

    // 2. Validate state machine transition
    const allowed = VALID_TRANSITIONS[currentStatus]?.includes(nextStatus);
    if (!allowed) {
      return NextResponse.json(
        { error: `Invalid transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 }
      );
    }

    // 3. Update status in database
    const updatePayload: any = {
      status: nextStatus,
      updated_at: new Date().toISOString()
    };

    if (nextStatus === 'resolved') {
      updatePayload.resolved_at = new Date().toISOString();
    }

    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', complaintId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    // 4. Trigger Notification (SMS / WhatsApp)
    console.log(`[Notification Engine] Status update on ${complaint.ticket_id}: ${currentStatus} -> ${nextStatus}. Note: ${note || 'none'}`);

    return NextResponse.json({
      success: true,
      complaint: updatedComplaint
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
