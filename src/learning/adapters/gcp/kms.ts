/**
 * Care Indeed LMS — Cloud KMS signer adapter (ADR-LEARNING-005).
 *
 * ⚠️ UNVERIFIED. Requires `@google-cloud/kms` + credentials. Implements the Signer
 * port used to sign GateDecisions and certificate manifests with an asymmetric
 * KMS key (EC_SIGN_P256_SHA256 or RSA_SIGN_PSS). The domain passes an already-hashed
 * payload (stateVectorSha256 / manifest fingerprint); this signs that digest.
 */
// @ts-nocheck — depends on @google-cloud/kms
import { KeyManagementServiceClient } from '@google-cloud/kms';
import { createVerify, createPublicKey } from 'node:crypto';
import type { Signer } from '../../domain/ports';

export class KmsSigner implements Signer {
  private publicKeyPem?: string;
  constructor(
    private client: KeyManagementServiceClient,
    private keyVersionName: string, // projects/*/locations/*/keyRings/*/cryptoKeys/*/cryptoKeyVersions/*
  ) {}

  async sign(payloadSha256: string): Promise<string> {
    const digest = Buffer.from(payloadSha256.replace(/^sha256:/, ''), 'hex');
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
    verifier.update(Buffer.from(payloadSha256.replace(/^sha256:/, ''), 'hex'));
    verifier.end();
    return verifier.verify(createPublicKey(this.publicKeyPem), Buffer.from(signature, 'base64'));
  }
}
