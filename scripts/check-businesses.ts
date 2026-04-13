#!/usr/bin/env tsx
/**
 * Check and fix business transfer_phone_number
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkBusinesses() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log("❌ Missing Supabase credentials");
    return;
  }

  const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log("📊 Checking businesses...\n");

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, business_name, ringley_phone_number, transfer_phone_number, is_active");

  if (error) {
    console.log("❌ Error:", error);
    return;
  }

  console.log(`Found ${businesses.length} business(es):\n`);

  for (const biz of businesses) {
    const status = biz.is_active ? "✅ Active" : "⏸️ Inactive";
    const hasTransfer = biz.transfer_phone_number ? `✅ ${biz.transfer_phone_number}` : "❌ NOT SET";
    
    console.log(`${status} | ${biz.business_name}`);
    console.log(`   ID: ${biz.id}`);
    console.log(`   Ringley: ${biz.ringley_phone_number || "NOT SET"}`);
    console.log(`   Transfer: ${hasTransfer}`);
    console.log("");
  }

  // Show businesses that need transfer_phone_number
  const needsTransfer = businesses.filter(b => b.is_active && !b.transfer_phone_number);
  
  if (needsTransfer.length > 0) {
    console.log("⚠️  These active businesses need transfer_phone_number set:\n");
    for (const biz of needsTransfer) {
      console.log(`   UPDATE businesses SET transfer_phone_number='+1234567890' WHERE id=${biz.id};`);
    }
    console.log("\n💡 Run these SQL commands in Supabase SQL Editor to fix them.");
  } else {
    console.log("✅ All active businesses have transfer_phone_number set!");
  }
}

checkBusinesses().catch(console.error);
