/**
 * Personal Task Store — owner-managed, no CES coupling.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Task-System.md §2.2
 *       Builder/Compliance-Execution-Sprints/PM-Data-Model.md §3.3
 *
 * Personal tasks are written here only. They show up in PM views (My Tasks
 * → Personal tab, Kanban Personal lane, Gantt rows) but never count toward
 * compliance KPI.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PersonalTask, PmTaskStatus } from './types';
import { pmApi, mirror } from './api/pmApiClient';
import { inferSprintIdFromDate } from './sprintId';

const PERSONAL_PREFIX = 'personal:';
const STORAGE_KEY = 'pm-personal-tasks-v1';

const newId = () =>
  `${PERSONAL_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const nowISO = () => new Date().toISOString();
const todayIso = () => new Date().toISOString().slice(0, 10);

export interface CreatePersonalInput {
  owner_user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  sprint_id?: string;
  story_points?: number;
  is_weekend_ok?: boolean;
  linked_event_id?: string;
}

interface PersonalState {
  tasks: Record<string, PersonalTask>;
  /** Append-only audit. Bounded to last 1000 entries. */
  audit: { id: string; ts: string; actor: string; action: string; task_id: string }[];

  list: (ownerId?: string) => PersonalTask[];
  get: (taskId: string) => PersonalTask | undefined;
  create: (input: CreatePersonalInput, actor?: string) => PersonalTask;
  update: (
    taskId: string,
    patch: Partial<Omit<PersonalTask, 'task_id' | 'source' | 'owner_user_id'>>,
    actor?: string,
  ) => void;
  setStatus: (taskId: string, status: PmTaskStatus, actor?: string) => void;
  remove: (taskId: string, actor?: string) => void;
  resetAll: () => void;
  /** Replace local cache with the canonical server snapshot for `ownerId`. */
  hydrateFromApi: (ownerId?: string) => Promise<void>;
}

export const usePmPersonalStore = create<PersonalState>()(
  persist(
    (set, get) => {
      const audit = (taskId: string, actor: string | undefined, action: string) => {
        set(s => ({
          audit: [
            ...s.audit,
            {
              id: `pers-audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              ts: nowISO(),
              actor: actor ?? 'system',
              action,
              task_id: taskId,
            },
          ].slice(-1000),
        }));
      };

      return {
        tasks: {},
        audit: [],

        list: ownerId => {
          const all = Object.values(get().tasks);
          return ownerId ? all.filter(t => t.owner_user_id === ownerId) : all;
        },

        get: id => get().tasks[id],

        create: (input, actor) => {
          const dueDate = input.due_date ?? todayIso();
          const t: PersonalTask = {
            task_id: newId(),
            source: 'personal',
            task_type: 'personal',
            event_id: input.linked_event_id,
            event_title: input.linked_event_id,
            owner_user_id: input.owner_user_id,
            owner: input.owner_user_id,
            assignee: input.owner_user_id,
            title: input.title,
            description: input.description,
            status: 'todo',
            priority: 'medium',
            risk: 'low',
            policy_refs: [],
            form_refs: [],
            generated_form_instance_ids: [],
            blockers: [],
            start_date: dueDate,
            due_date: dueDate,
            sprint_id: input.sprint_id ?? inferSprintIdFromDate(dueDate),
            story_points: input.story_points,
            depends_on: [],
            dependencies: [],
            is_weekend_ok: input.is_weekend_ok,
            linked_event_id: input.linked_event_id,
          };
          set(s => ({ tasks: { ...s.tasks, [t.task_id]: t } }));
          audit(t.task_id, actor, 'create');
          mirror(pmApi.createPersonal({
            task_id: t.task_id,
            owner_user_id: t.owner_user_id,
            title: t.title,
            description: t.description,
            status: t.status,
            due_date: t.due_date,
            sprint_id: t.sprint_id,
            story_points: t.story_points,
            is_weekend_ok: t.is_weekend_ok,
            linked_event_id: t.linked_event_id,
          }));
          return t;
        },

        update: (taskId, patch, actor) => {
          const cur = get().tasks[taskId];
          if (!cur) return;
          const merged = { ...cur, ...patch };
          const dueDate = merged.due_date ?? cur.due_date;
          const next: PersonalTask = {
            ...merged,
            due_date: dueDate,
            start_date: merged.start_date ?? cur.start_date ?? dueDate,
            sprint_id: merged.sprint_id ?? cur.sprint_id ?? inferSprintIdFromDate(dueDate),
            depends_on: merged.depends_on ?? merged.dependencies ?? cur.depends_on ?? cur.dependencies ?? [],
            dependencies: merged.dependencies ?? merged.depends_on ?? cur.dependencies ?? cur.depends_on ?? [],
            event_id: merged.event_id ?? merged.linked_event_id ?? cur.event_id ?? cur.linked_event_id,
            owner: merged.owner ?? merged.owner_user_id ?? cur.owner ?? cur.owner_user_id,
            assignee: merged.assignee ?? merged.owner_user_id ?? cur.assignee ?? cur.owner_user_id,
          };
          set(s => ({ tasks: { ...s.tasks, [taskId]: next } }));
          audit(taskId, actor, 'update');
          mirror(pmApi.updatePersonal(taskId, patch as Record<string, unknown>));
        },

        setStatus: (taskId, status, actor) => {
          const cur = get().tasks[taskId];
          if (!cur || cur.status === status) return;
          set(s => ({ tasks: { ...s.tasks, [taskId]: { ...cur, status } } }));
          audit(taskId, actor, `status:${status}`);
          mirror(pmApi.updatePersonal(taskId, { status }));
        },

        remove: (taskId, actor) => {
          const cur = get().tasks[taskId];
          if (!cur) return;
          set(s => {
            const next = { ...s.tasks };
            delete next[taskId];
            return { tasks: next };
          });
          audit(taskId, actor, 'remove');
          mirror(pmApi.deletePersonal(taskId));
        },

        resetAll: () => set({ tasks: {}, audit: [] }),

        hydrateFromApi: async (ownerId) => {
          try {
            const { tasks } = await pmApi.listPersonal(ownerId);
            const next: Record<string, PersonalTask> = {};
            for (const raw of tasks) {
              // Server may return `id` (StoredPersonalTask) or `task_id` (PersonalTask);
              // accept both so hydration is robust against schema variance.
              const r = raw as Partial<PersonalTask> & { task_id?: string; id?: string };
              if (!r.task_id && r.id) (r as Record<string, unknown>).task_id = r.id;
              const tid = r.task_id;
              if (!tid) continue; // skip malformed rows
              next[tid] = {
                task_id: tid,
                source: 'personal',
                task_type: 'personal',
                event_id: (r.event_id as string | undefined) ?? (r.linked_event_id as string | undefined),
                event_title: (r.event_title as string | undefined) ?? (r.event_id as string | undefined) ?? (r.linked_event_id as string | undefined),
                workflow_id: r.workflow_id as string | undefined,
                workflow_title: r.workflow_title as string | undefined,
                owner_user_id: (r.owner_user_id as string) ?? 'me',
                owner: (r.owner as string | undefined) ?? (r.owner_user_id as string) ?? 'me',
                assignee: (r.assignee as string | undefined) ?? (r.owner_user_id as string) ?? 'me',
                title: (r.title as string) ?? '',
                description: r.description as string | undefined,
                status: ((r.status as PmTaskStatus) ?? 'todo'),
                priority: (r.priority as PersonalTask['priority'] | undefined) ?? 'medium',
                risk: (r.risk as PersonalTask['risk'] | undefined) ?? 'low',
                policy_refs: (r.policy_refs as string[] | undefined) ?? (r.policyRefs as string[] | undefined) ?? [],
                form_refs: (r.form_refs as string[] | undefined) ?? (r.form_ids as string[] | undefined) ?? [],
                generated_form_instance_ids: (r.generated_form_instance_ids as string[] | undefined) ?? [],
                source_form_id: r.source_form_id as string | undefined,
                blockers: (r.blockers as string[] | undefined) ?? [],
                start_date: (r.start_date as string | undefined) ?? (r.due_date as string | undefined) ?? todayIso(),
                due_date: (r.due_date as string | undefined) ?? todayIso(),
                sprint_id: (r.sprint_id as string | undefined) ?? inferSprintIdFromDate((r.due_date as string | undefined) ?? todayIso()),
                story_points: r.story_points as number | undefined,
                depends_on: (r.depends_on as string[] | undefined) ?? (r.dependencies as string[] | undefined) ?? [],
                dependencies: (r.dependencies as string[] | undefined) ?? (r.depends_on as string[] | undefined) ?? [],
                is_weekend_ok: r.is_weekend_ok as boolean | undefined,
                linked_event_id: r.linked_event_id as string | undefined,
              };
            }
            set({ tasks: next });
          } catch (err) {
            console.warn('[personalStore.hydrateFromApi] failed; keeping local cache.', err);
          }
        },
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? ({
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            } as unknown as Storage)
          : window.localStorage,
      ),
    },
  ),
);
