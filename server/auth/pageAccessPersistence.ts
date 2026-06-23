import fs from 'node:fs';
import path from 'node:path';
import { env } from '../env.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';

export type StoredPageAccessMap = Record<string, unknown>;

interface PageAccessPersistence {
  provider: 'file_local' | 'dynamodb_registration';
  getAll(): Promise<StoredPageAccessMap>;
  putAll(access: StoredPageAccessMap): Promise<StoredPageAccessMap>;
}

class FilePageAccessPersistence implements PageAccessPersistence {
  readonly provider = 'file_local' as const;
  private dir = path.join(env.repoRoot, '.cache', 'page-access');
  private file = path.join(this.dir, 'access.json');

  private ensure() {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  async getAll(): Promise<StoredPageAccessMap> {
    this.ensure();
    try {
      if (!fs.existsSync(this.file)) return {};
      const raw = fs.readFileSync(this.file, 'utf8');
      const parsed = JSON.parse(raw) as StoredPageAccessMap;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      log.warn('page_access.file.read_failed', { error: (err as Error).message });
      return {};
    }
  }

  async putAll(access: StoredPageAccessMap): Promise<StoredPageAccessMap> {
    this.ensure();
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(access, null, 2), 'utf8');
    fs.renameSync(tmp, this.file);
    return access;
  }
}

class DynamoPageAccessPersistence implements PageAccessPersistence {
  readonly provider = 'dynamodb_registration' as const;
  private table = env.registrationTableName;
  private doc: { send: (cmd: unknown) => Promise<unknown> } | null = null;
  private cmds: Record<string, new (input: unknown) => unknown> | null = null;

  private async client() {
    if (this.doc && this.cmds) return { doc: this.doc, cmds: this.cmds };
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const lib = await import('@aws-sdk/lib-dynamodb');
    const base = new DynamoDBClient({ region: env.awsRegion || 'us-west-1' });
    this.doc = lib.DynamoDBDocumentClient.from(base) as unknown as { send: (cmd: unknown) => Promise<unknown> };
    this.cmds = {
      Get: lib.GetCommand as unknown as new (input: unknown) => unknown,
      Put: lib.PutCommand as unknown as new (input: unknown) => unknown,
    };
    return { doc: this.doc, cmds: this.cmds };
  }

  async getAll(): Promise<StoredPageAccessMap> {
    if (!this.table) {
      throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    }
    const { doc, cmds } = await this.client();
    const res = (await doc.send(new cmds.Get({
      TableName: this.table,
      Key: { pk: 'PAGE_ACCESS', sk: 'STATE' },
    }))) as { Item?: { access?: StoredPageAccessMap } };
    const access = res.Item?.access;
    return access && typeof access === 'object' ? access : {};
  }

  async putAll(access: StoredPageAccessMap): Promise<StoredPageAccessMap> {
    if (!this.table) {
      throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    }
    const { doc, cmds } = await this.client();
    await doc.send(new cmds.Put({
      TableName: this.table,
      Item: {
        pk: 'PAGE_ACCESS',
        sk: 'STATE',
        updatedAt: new Date().toISOString(),
        access,
      },
    }));
    return access;
  }
}

let cached: PageAccessPersistence | null = null;

export function getPageAccessPersistence(): PageAccessPersistence {
  if (cached) return cached;
  cached = env.registrationTableName
    ? new DynamoPageAccessPersistence()
    : new FilePageAccessPersistence();
  log.info('page_access.provider.ready', { provider: cached.provider });
  return cached;
}
