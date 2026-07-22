/* ─────────────────────────────────────────────────────────────────────────────
   UI-PREVIEW MOCK CLIENT — NOT wired to any backend.
   Returns the synthetic demo records in ./mockData so the Vendor and Contractor
   Management screens render fully populated for design review. When the feature
   is wired, replace this with the fetch-based client that hits /api/vendors and
   /api/contractors behind the auth boundary.
   ───────────────────────────────────────────────────────────────────────────── */
import type { ContractorRecord, ContractorVendorStatus, VendorRecord } from './types';
import { MOCK_VENDORS, MOCK_CONTRACTORS, MOCK_VENDOR_STATUS } from './mockData';

const ok = <T>(value: T): Promise<T> => Promise.resolve(value);
const findVendor = (id: string): VendorRecord => MOCK_VENDORS.find((v) => v.id === id) ?? MOCK_VENDORS[0];
const findContractor = (id: string): ContractorRecord => MOCK_CONTRACTORS.find((c) => c.id === id) ?? MOCK_CONTRACTORS[0];

export const ComplianceManagementApi = {
  listVendors: (_token: string) => ok<{ vendors: VendorRecord[] }>({ vendors: MOCK_VENDORS }),
  getVendor: (_token: string, id: string) => ok<{ vendor: VendorRecord }>({ vendor: findVendor(id) }),
  createVendor: (_token: string, _value: unknown) => ok<{ vendor: VendorRecord }>({ vendor: MOCK_VENDORS[0] }),
  listContractors: (_token: string) => ok<{ contractors: ContractorRecord[] }>({ contractors: MOCK_CONTRACTORS }),
  getContractor: (_token: string, id: string) =>
    ok<{ contractor: ContractorRecord; vendor?: ContractorVendorStatus }>({ contractor: findContractor(id), vendor: MOCK_VENDOR_STATUS }),
  createContractor: (_token: string, _value: unknown) => ok<{ contractor: ContractorRecord }>({ contractor: MOCK_CONTRACTORS[0] }),
};
