import { useMemo } from 'react';
import { REGULATORY_EVENTS } from '../data/regulatoryEvents';
import { useAutogenStore } from '../stores/autogenStore';
import { useRegulatoryExecutionStore } from '../stores/regulatoryExecutionStore';
import { resolveFormInstances, type FormInstanceRecord } from './formInstancesCore';

export { resolveFormInstances, type FormInstanceRecord } from './formInstancesCore';

export function useFormInstances(): Record<string, FormInstanceRecord> {
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const formStates = useRegulatoryExecutionStore(s => s.formStates);

  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  return useMemo(() => resolveFormInstances(allEvents, formStates), [allEvents, formStates]);
}

export function useFormInstanceById(formInstanceId?: string): FormInstanceRecord | undefined {
  const all = useFormInstances();
  return formInstanceId ? all[formInstanceId] : undefined;
}
