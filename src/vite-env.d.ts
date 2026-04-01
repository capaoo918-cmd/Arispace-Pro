/// <reference types="vite/client" />

interface ImportMetaEnv {
  // --- AI Services ---
  readonly VITE_HUGGINGFACE_API_KEY: string;

  // --- Supabase ---
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // --- Gemini (via Vite define, also exposed as process.env in vite.config) ---
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
