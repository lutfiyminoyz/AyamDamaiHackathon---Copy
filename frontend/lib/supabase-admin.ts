import "server-only"; // npm install server-only
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
    "supabaseAdmin must only be used server-side."
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});