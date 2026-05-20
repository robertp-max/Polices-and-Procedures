import { useState } from 'react'
import { V3PageWrapper } from './components/V3PageWrapper'

// ============================================================
// V3ClinicianListPreview — Exact match to PDF screenshot
// Includes full V3WorkbenchShell + navbar/sidebar, 3 filters (incl. employment),
// 7-col table (NAME/DISCIPLINE/STATUS/EMPLOYMENT/COMPETENCIES/ASSIGNMENTS/→),
// V3 classes, teal pills, status colors, correct data/layout.
// ============================================================

interface Clinician {
  id: string; name: string; discipline: string; status: string;
  employment: string; competencies: number; assignments: number;
  credentials?: number; hasFEHA?: boolean;
}

const CLINICIANS: Clinician[] = [
  { id: 'clin-001', name: 'Amara Okonkwo', discipline: 'RN', status: 'Active', employment: 'W2', competencies: 2, assignments: 1, credentials: 2, hasFEHA: true },
  { id: 'clin-002', name: 'Takeshi Nakamura', discipline: 'RN', status: 'Active', employment: 'contractor', competencies: 2, assignments: 0, credentials: 1, hasFEHA: false },
  { id: 'clin-003', name: 'Valentina Ramirez-Cruz', discipline: 'LVN', status: 'Active', employment: 'W2', competencies: 2, assignments: 1, credentials: 3, hasFEHA: false },
  { id: 'clin-004', name: 'Priya Patel', discipline: 'LVN', status: 'Pending', employment: 'W2', competencies: 1, assignments: 0, credentials: 1, hasFEHA: false },
  { id: 'clin-005', name: 'Erik Johansson', discipline: 'PT', status: 'Active', employment: 'contractor', competencies: 2, assignments: 1, credentials: 2, hasFEHA: true },
  { id: 'clin-006', name: 'Fatima Adekoya', discipline: 'OT', status: 'Active', employment: 'W2', competencies: 2, assignments: 1, credentials: 2, hasFEHA: false },
  { id: 'clin-007', name: 'Marcus Vasquez', discipline: 'HHA', status: 'Active', employment: 'W2', competencies: 2, assignments: 1, credentials: 1, hasFEHA: false },
  { id: 'clin-008', name: 'Lena Quiñones', discipline: 'HHA', status: 'On Leave', employment: 'W2', competencies: 1, assignments: 0, credentials: 1, hasFEHA: true },
  { id: 'clin-009', name: 'Yemi Mwangi', discipline: 'CNA', status: 'Active', employment: 'W2', competencies: 1, assignments: 0, credentials: 1, hasFEHA: false },
  { id: 'clin-010', name: 'Pierre Lemoine', discipline: 'Caregiver', status: 'Inactive', employment: 'contractor', competencies: 1, assignments: 0, credentials: 0, hasFEHA: false },
];

export function V3ClinicianListPreview() {
  const [search, setSearch] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [employmentFilter, setEmploymentFilter] = useState('All');

  const disciplines = ['All', ...new Set(CLINICIANS.map(c => c.discipline))];
  const statuses = ['All', ...new Set(CLINICIANS.map(c => c.status))];
  const employments = ['All', ...new Set(CLINICIANS.map(c => c.employment))];

  const filtered = CLINICIANS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchDiscipline = disciplineFilter === 'All' || c.discipline === disciplineFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchEmployment = employmentFilter === 'All' || c.employment === employmentFilter;
    return matchSearch && matchDiscipline && matchStatus && matchEmployment;
  });

  return (
    <V3PageWrapper transitionKey="clinician-list">
        <div className="p-4 text-[var(--v3-text-primary)]">
          {/* Description below shell-provided title + full navbar (exact to PDF screenshot) */}
          <p className="text-[13px] text-[var(--v3-text-secondary)] mb-4">
            Management of clinical and administrative practitioners.
          </p>

        {/* Filters — V3 input + selects (search + discipline + status + employment to match PDF screenshot) */}
        <div className="flex flex-wrap gap-3 items-center mt-5">
          <div className="v3-input-wrapper flex-1 min-w-[240px]">
            <span className="mr-2 text-[var(--v3-text-tertiary)]">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="v3-search w-full bg-transparent border-none outline-none text-sm"
            />
          </div>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="v3-input-wrapper px-4 py-2 text-sm cursor-pointer"
          >
            {disciplines.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Disciplines' : d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="v3-input-wrapper px-4 py-2 text-sm cursor-pointer"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>

          <select
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
            className="v3-input-wrapper px-4 py-2 text-sm cursor-pointer"
          >
            {employments.map(e => (
              <option key={e} value={e}>{e === 'All' ? 'All Employment' : e}</option>
            ))}
          </select>
        </div>

        {/* Table — using .v3-table rules from injected CSS (7 cols exact match to PDF screenshot) */}
        <div className="mt-5 rounded-2xl border border-[var(--v3-border)] overflow-hidden v3-card">
          <table className="v3-table w-full">
            <thead>
              <tr>
                {['NAME', 'DISCIPLINE', 'STATUS', 'EMPLOYMENT', 'COMPETENCIES', 'ASSIGNMENTS', ''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => alert(`(Preview) Would navigate to detail for ${c.name}`)}
                  className="cursor-pointer"
                >
                  <td className="font-medium">{c.name}</td>
                  <td>
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-[rgba(0,209,193,0.08)] text-[#00D1C1]">
                      {c.discipline}
                    </span>
                  </td>
                  <td className="font-semibold text-sm" style={{
                    color: c.status === 'Active' ? '#00D1C1' :
                          c.status === 'Pending' ? 'var(--v3-text-secondary)' : 'var(--v3-text-tertiary)'
                  }}>
                    {c.status.toUpperCase()}
                  </td>
                  <td className="text-[var(--v3-text-secondary)] text-sm">{c.employment}</td>
                  <td className="text-center text-[var(--v3-text-secondary)] text-sm">{c.competencies}</td>
                  <td className="text-center text-[var(--v3-text-secondary)] text-sm">{c.assignments}</td>
                  <td className="text-[var(--v3-text-tertiary)] text-right">→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
      </V3PageWrapper>
  );
}
