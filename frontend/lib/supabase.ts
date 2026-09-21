import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check frontend/.env.local.",
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});


const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  // Warn instead of throwing, so importing this file in a client component
  // doesn't crash the whole page. The error will surface clearly at the
  // point where supabaseAdmin is actually used.
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY not set. Server uploads will fail with RLS errors.",
  );
}

export const supabaseAdmin = createClient(
  url,
  serviceRoleKey ?? "",           // empty string → calls will fail loudly
  { auth: { persistSession: false } },
);