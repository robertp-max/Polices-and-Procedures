/* Minimal form-signature module. Restores a latent missing module
   (`@/policy/components/FormSignatureContext`) that policy-layer files import
   (`DEMO_SESSION`, and the `FormSignerSlot` / `SignerTask` shapes) but which was
   never present in the tree — only surfaced once these files entered the build
   graph. Kept intentionally small/permissive; a full signature context can
   replace this later without changing import sites. */

export const DEMO_SESSION = {
  id: 'demo-session-careindeed',
  userId: 'demo-user-careindeed',
  displayName: 'Care Indeed Demo',
  email: 'robertp@careindeed.com',
  role: 'administrator',
} as const;

export type DemoSession = typeof DEMO_SESSION;

/** A signer slot on a form (role/name/signed state + open fields). */
export interface FormSignerSlot {
  role?: string;
  name?: string;
  signerId?: string;
  signed?: boolean;
  signedAt?: string;
  order?: number;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** A pending signature task. */
export interface SignerTask {
  id?: string;
  formId?: string;
  role?: string;
  status?: string;
  dueDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
