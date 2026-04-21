import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { User } from 'lucide-react';

/**
 * Zustand v5 enforces Object.is on selector output, so we MUST return
 * stable primitives / references. Returning a fresh object literal here
 * would produce a new snapshot on every render and trigger React 18's
 * "The result of getSnapshot should be cached" infinite loop. Use one
 * selector per field instead.
 */
export function EmployeePicker() {
  const employees          = useJourneyStore(s => s.employees);
  const currentEmployeeId  = useJourneyStore(s => s.currentEmployeeId);
  const setCurrentEmployee = useJourneyStore(s => s.setCurrentEmployee);

  return (
    <label className="glass-interactive flex items-center gap-2 border border-white/10 rounded-full px-4 py-2">
      <User size={14} className="text-[#FFC107]/80" />
      <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.25em] text-white/50">Learner</span>
      <select
        value={currentEmployeeId}
        onChange={e => setCurrentEmployee(e.target.value)}
        className="bg-transparent text-sm text-white outline-none cursor-pointer"
      >
        {employees.map(emp => (
          <option key={emp.id} value={emp.id} style={{ background: '#310707' }}>
            {emp.name} · {emp.role}
          </option>
        ))}
      </select>
    </label>
  );
}
