#!/usr/bin/env tsx
/**
 * Fix phone number formats in database
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function formatPhone(phone: string): string {
  if (!phone) return null;
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  // Add +1 if it's a US number
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return phone; // Already formatted or unknown
}

async function fixPhones() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log("❌ Missing Supabase credentials");
    return;
  }

  const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log("📊 Checking phone number formats...\n");

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, business_name, ringley_phone_number, transfer_phone_number");

  if (error) {
    console.log("❌ Error:", error);
    return;
  }

  for (const biz of businesses) {
    const oldRingley = biz.ringley_phone_number;
    const oldTransfer = biz.transfer_phone_number;
    
    const newRingley = formatPhone(oldRingley);
    const newTransfer = formatPhone(oldTransfer);
    
    const needsUpdate = oldRingley !== newRingley || oldTransfer !== newTransfer;
    
    if (needsUpdate) {
      console.log(`📝 Fixing: ${biz.business_name}`);
      console.log(`   Ringley: ${oldRingley} → ${newRingley}`);
      console.log(`   Transfer: ${oldTransfer} → ${newTransfer}`);
      
      const { error } = await supabase
        .from("businesses")
        .update({
          ringley_phone_number: newRingley,
          transfer_phone_number: newTransfer,
        })
        .eq("id", biz.id);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Updated`);
      }
      console.log("");
    } else {
      console.log(`✅ OK: ${biz.business_name} (${oldRingley})`);
    }
  }
}

fixPhones().catch(console.error);
