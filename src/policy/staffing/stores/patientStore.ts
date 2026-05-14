import { create } from 'zustand';
import type { Patient, ShiftNeed, AcuityLevel } from '../types';
import { MOCK_PATIENTS, MOCK_SHIFT_NEEDS } from '../data/mockPatients';

interface PatientStoreState {
  patients: Patient[];
  shiftNeeds: ShiftNeed[];

  filterAcuity: AcuityLevel | null;
  filterAccm: string | null;
  filterSetting: 'home' | 'facility' | null;
  searchQuery: string;

  setFilterAcuity: (t: AcuityLevel | null) => void;
  setFilterAccm: (id: string | null) => void;
  setFilterSetting: (s: 'home' | 'facility' | null) => void;
  setSearchQuery: (q: string) => void;

  getPatientById: (id: string) => Patient | undefined;
  getShiftNeedsForPatient: (patientId: string) => ShiftNeed[];
  getFilteredPatients: () => Patient[];
}

export const usePatientStore = create<PatientStoreState>()((set, get) => ({
  patients: MOCK_PATIENTS,
  shiftNeeds: MOCK_SHIFT_NEEDS,

  filterAcuity: null,
  filterAccm: null,
  filterSetting: null,
  searchQuery: '',

  setFilterAcuity: (t) => set({ filterAcuity: t }),
  setFilterAccm: (id) => set({ filterAccm: id }),
  setFilterSetting: (s) => set({ filterSetting: s }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  getPatientById: (id) => get().patients.find((p) => p.id === id),

  getShiftNeedsForPatient: (patientId) =>
    get().shiftNeeds.filter((sn) => sn.patientId === patientId),

  getFilteredPatients: () => {
    const { patients, filterAcuity, filterAccm, filterSetting, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();

    return patients.filter((p) => {
      if (filterAcuity && p.acuityLevel !== filterAcuity) return false;
      if (filterAccm && p.accmOwnerId !== filterAccm) return false;
      if (filterSetting && p.serviceSetting !== filterSetting) return false;
      if (query) {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        if (!fullName.includes(query)) return false;
      }
      return true;
    });
  },
}));
