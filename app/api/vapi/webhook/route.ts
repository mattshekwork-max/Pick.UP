import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VAPI_WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Verify webhook (in production, verify the signature)
    // TODO: Implement proper webhook signature verification
    // Vapi sends signature in x-vapi-signature header, needs HMAC verification
    
    const { call_id, business_id, status, transcript, recording_url, duration, appointment } = payload;
    
    // Log the call to Supabase
    const supabase = await createClient();
    const { error: callError } = await supabase.from('calls').insert({
      business_id,
      caller_phone_number: payload.caller?.phone_number || payload.customer_phone,
      caller_name: payload.caller?.name || payload.customer_name,
      call_summary: transcript ? 'AI answered and summarized' : 'Handled by AI',
      call_duration_seconds: Math.round(duration || 0),
      call_status: status || 'completed',
      was_transferred: payload.transfer?.to_squad || false,
      transcript: transcript || null,
      external_call_id: call_id,
    });
    
    if (callError) {
      console.error('Failed to log call:', callError);
    }
    
    // Create appointment if requested
    let appointmentId = null;
    if (appointment) {
      const { data: appt, error: apptError } = await supabase.from('appointments').insert({
        business_id,
        customer_name: payload.customer?.name || 'Unknown',
        customer_phone: payload.customer?.phone || payload.caller?.phone_number,
        service: appointment.service || 'General',
        starts_at: new Date(appointment.time).toISOString(),
        ends_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: 'confirmed',
      }).select('id').single();
      
      if (apptError) {
        console.error('Failed to book appointment:', apptError);
      } else {
        appointmentId = appt?.id;
      }
    }
    
    // Return AI assistant config for Vapi to continue the call
    return NextResponse.json({
      assistant: {
        firstMessage: await getBusinessGreeting(business_id),
        model: 'gpt-4',
        voice: 'alloy',
        language: 'en',
        // If transfer requested, include transfer destination
        ...(payload.transfer?.to_squad ? {
          transferConfig: {
            mode: 'transfer',
            message: 'Please hold while I connect you...',
            destination: payload.transfer.phone_number
          }
        } : {}),
        // If appointment booked, include confirmation
        ...(appointment ? {
          appointmentConfirmation: {
            id: appointmentId,
            time: appointment.time,
            service: appointment.service
          }
        } : {})
      }
    });
    
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function getBusinessGreeting(business_id: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from('businesses').select('greeting_message,faqs,services').eq('id', business_id).single();
  
  if (data?.greeting_message) {
    return data.greeting_message;
  }
  
  // Use business context for greeting
  const faqs = data?.faqs || [];
  const services = data?.services || [];
   
  if (faqs.length > 0) {
    return `Hello! I'm ${data.greeting_message || 'your AI assistant'}. I can help with ${services.join(', ')} or answer questions. What do you need help with?`;
  }
  
  return data.greeting_message || "Hello! Thanks for calling. How can I help you today?";
}