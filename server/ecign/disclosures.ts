/** Versioned ESIGN/UETA disclosure text, hashed for binding. */
import { sha256 } from './hashChain.js';

export const CURRENT_DISCLOSURE_VERSION = 'v1.0.0';

export const DISCLOSURE_TEXT = `\
ELECTRONIC RECORDS & SIGNATURES DISCLOSURE (CARE INDEED — eCIgn)

By accepting this disclosure you agree:

1. To conduct this transaction by electronic means as permitted by the federal
   ESIGN Act (15 U.S.C. §§ 7001–7031) and the Uniform Electronic Transactions
   Act as adopted in your state.
2. That an electronic signature you apply through eCIgn is legally equivalent
   to your handwritten signature for the documents you sign.
3. That records signed through eCIgn will be retained electronically for at
   least seven (7) years from the date of signature, and that you may request
   a paper copy of any record at no charge.
4. That you can access records in PDF format and have the hardware/software
   needed to view and retain them.
5. That you may withdraw consent for future signings by contacting your
   administrator; withdrawal does not affect documents already signed.

Disclosure version: ${'__DISCLOSURE_VERSION__'}
`;

export const DISCLOSURE_TEXT_HASH = sha256(
  DISCLOSURE_TEXT.replace('__DISCLOSURE_VERSION__', CURRENT_DISCLOSURE_VERSION),
);
