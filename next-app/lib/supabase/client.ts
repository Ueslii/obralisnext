import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Support multiple env names to ease migration from Vite
const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""
).trim();

const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();

if (!SUPABASE_URL || !/^https?:\/\//.test(SUPABASE_URL) || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Variáveis do Supabase ausentes. Crie next-app/.env.local com:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave_anon>"
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
