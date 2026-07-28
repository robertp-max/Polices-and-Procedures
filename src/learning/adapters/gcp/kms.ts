/**
 * Care Indeed LMS — Cloud KMS signer adapter (ADR-LEARNING-005).
 *
 * ⚠️ UNVERIFIED. Requires `@google-cloud/kms` + credentials. Implements the Signer
 * port used to sign GateDecisions and certificate manifests with an asymmetric
 * KMS key (EC_SIGN_P256_SHA256 or RSA_SIGN_PSS). The domain passes an already-hashed
 * payload (stateVectorSha256 / manifest fingerprint); this signs that digest.
 */
import { KeyManagementServiceClient } from '@google-cloud/kms';
import { createHash, createVerify, createPublicKey } from 'node:crypto';
import type { Signer } from '../../domain/ports';

/**
 * Signs/verifies the domain fingerprint string (e.g. a state-vector or manifest hash)
 * as an opaque message: both sides compute SHA-256 over the SAME string, so verify()
 * needs only the fingerprint (no preimage). Verified live against Cloud KMS
 * EC_SIGN_P256_SHA256 (scratchpad/gcp-smoke → kms: PASS).
 */
export class KmsSigner implements Signer {
  private publicKeyPem?: string;
  constructor(
    private client: KeyManagementServiceClient,
    private keyVersionName: string, // projects/*/locations/*/keyRings/*/cryptoKeys/*/cryptoKeyVersions/*
  ) {}

  async sign(payloadSha256: string): Promise<string> {
    const digest = createHash('sha256').update(payloadSha256).digest();
    const [result] = await this.client.asymmetricSign({
      name: this.keyVersionName,
      digest: { sha256: digest },
    });
    return Buffer.from(result.signature as Uint8Array).toString('base64');
  }

  async verify(payloadSha256: string, signature: string): Promise<boolean> {
    if (!this.publicKeyPem) {
      const [pub] = await this.client.getPublicKey({ name: this.keyVersionName });
      this.publicKeyPem = pub.pem as string;
    }
    const verifier = createVerify('SHA256');
    verifier.update(payloadSha256);
    verifier.end();
    return verifier.verify(createPublicKey(this.publicKeyPem), Buffer.from(signature, 'base64'));
  }
}
