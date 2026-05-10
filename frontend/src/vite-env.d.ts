/// <reference types="vite/client" />

type ImportMetaEnv = {
  /**
   * Public API origin for production. Examples:
   * - `https://your-api.example.com` (we append `/api` if missing)
   * - `https://your-api.example.com/api`
   */
  readonly VITE_API_BASE_URL?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
