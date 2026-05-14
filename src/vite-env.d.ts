/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_BASE_URL?: string;
  readonly VITE_LOCAL_DEMO_AUTH_BYPASS?: string;
  readonly VITE_EVIDENCE_STORAGE_MODE?: 'local-demo' | 'aws-staging';
  readonly VITE_AWS_API_BASE_URL?: string;
  readonly VITE_AWS_REGION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.csv?raw' {
  const content: string;
  export default content;
}
