import { create } from 'zustand';
import type { Shift, ShiftStatus, CalendarFilterState } from '../types-calendar';
import { mockShifts } from '../data/mockShifts';

// READ-ONLY store — no setter actions. All mutations are forbidden in Step 2.
interface ShiftStoreState {
  shifts: Shift[];
  getShiftById: (id: string) => Shift | undefined;
  getShiftsByStatus: (status: ShiftStatus) => Shift[];
  getShiftsByPatientId: (patientId: string) => Shift[];
  getShiftsByClinicianId: (clinicianId: string) => Shift[];
  filterShifts: (filter: CalendarFilterState) => Shift[];
}

export const useShiftStore = create<ShiftStoreState>()((_, get) => ({
  shifts: mockShifts,

  getShiftById: (id) => get().shifts.find((s) => s.id === id),

  getShiftsByStatus: (status) => get().shifts.filter((s) => s.status === status),

  getShiftsByPatientId: (patientId) =>
    get().shifts.filter((s) => s.patientId === patientId),

  getShiftsByClinicianId: (clinicianId) =>
    get().shifts.filter((s) => s.clinicianId === clinicianId),

  filterShifts: (filter) => {
    const { shifts } = get();
    return shifts.filter((s) => {
      if (filter.status !== 'all' && s.status !== filter.status) return false;
      if (filter.discipline !== 'all' && s.requiredDiscipline !== filter.discipline) return false;
      if (filter.dateFrom && s.date < filter.dateFrom) return false;
      if (filter.dateTo && s.date > filter.dateTo) return false;
      return true;
    });
  },
}));
