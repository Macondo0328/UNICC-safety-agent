/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_AGENT_API_URL?: string;
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

