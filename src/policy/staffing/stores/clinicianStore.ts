import { create } from 'zustand';
import type { Clinician, ClinicianPatientConnection, Discipline, ClinicianStatus } from '../types';
import { MOCK_CLINICIANS, MOCK_CONNECTIONS } from '../data/mockClinicians';

interface ClinicianStoreState {
  clinicians: Clinician[];
  connections: ClinicianPatientConnection[];

  filterDiscipline: Discipline | null;
  filterStatus: ClinicianStatus | null;
  searchQuery: string;

  setFilterDiscipline: (d: Discipline | null) => void;
  setFilterStatus: (s: ClinicianStatus | null) => void;
  setSearchQuery: (q: string) => void;

  getClinicianById: (id: string) => Clinician | undefined;
  getConnectionsForClinician: (clinicianId: string) => ClinicianPatientConnection[];
  getFilteredClinicians: () => Clinician[];
}

export const useClinicianStore = create<ClinicianStoreState>()((set, get) => ({
  clinicians: MOCK_CLINICIANS,
  connections: MOCK_CONNECTIONS,

  filterDiscipline: null,
  filterStatus: null,
  searchQuery: '',

  setFilterDiscipline: (d) => set({ filterDiscipline: d }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  getClinicianById: (id) => get().clinicians.find((c) => c.id === id),

  getConnectionsForClinician: (clinicianId) =>
    get().connections.filter((conn) => conn.clinicianId === clinicianId),

  getFilteredClinicians: () => {
    const { clinicians, filterDiscipline, filterStatus, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();

    return clinicians.filter((c) => {
      if (filterDiscipline && c.primaryDiscipline !== filterDiscipline) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (query) {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        if (!fullName.includes(query)) return false;
      }
      return true;
    });
  },
}));
