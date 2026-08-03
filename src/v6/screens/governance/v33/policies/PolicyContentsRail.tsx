import { useMemo, useState } from 'react';
import { Check, FolderClosed, History, Library, Search } from 'lucide-react';
import type { PolicyContentSection } from '../types';
import { cleanTitle } from './policyTextUtils';

interface ChapterNode {
  head: PolicyContentSection;
  headIndex: number;
  children: { section: PolicyContentSection; index: number }[];
}

function buildChapters(sections: readonly PolicyContentSection[]): ChapterNode[] {
  const chapters: ChapterNode[] = [];
  sections.forEach((section, index) => {
    if (section.level <= 2 || chapters.length === 0) {
      chapters.push({ head: section, headIndex: index, children: [] });
    } else {
      chapters[chapters.length - 1].children.push({ section, index });
    }
  });
  return chapters;
}

export default function PolicyContentsRail({
  policyId,
  policyVersion,
  courseTitle,
  sections,
  activeIndex,
  visited,
  resumeIndex,
  formsPageIndex,
  onSelect,
}: {
  policyId: string;
  policyVersion: string | null;
  courseTitle: string;
  sections: readonly PolicyContentSection[];
  activeIndex: number;
  visited: ReadonlySet<number>;
  resumeIndex: number | null;
  formsPageIndex: number;
  onSelect: (index: number) => void;
}) {
  const [query, setQuery] = useState('');
  const chapters = useMemo(() => buildChapters(sections), [sections]);
  const readPercent = sections.length ? Math.round((visited.size / sections.length) * 100) : 0;

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return null;
    return sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => cleanTitle(section.title).toLowerCase().includes(term) || section.body.toLowerCase().includes(term));
  }, [query, sections]);

  return (
    <aside className="pv3-rail" aria-label="Policy contents">
      <div className="pv3-rail-head">
        <span>CONTROLLED READING</span>
        <strong>{policyId}</strong>
        <small>{policyVersion ? `Version ${policyVersion}` : 'Source-restored version'} · {courseTitle}</small>
      </div>

      {resumeIndex !== null && resumeIndex !== activeIndex && (
        <button className="pv3-resume-marker" onClick={() => onSelect(resumeIndex)}>
          <History size={13} />
          <span>Resume where you left off — section {String(resumeIndex + 1).padStart(2, '0')}</span>
        </button>
      )}

      <label className="pv3-rail-search">
        <Search size={13} />
        <input
          type="search"
          placeholder="Search this policy…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={`Search within ${policyId}`}
        />
      </label>

      <nav aria-label="Policy section index">
        {searchResults ? (
          searchResults.length ? (
            <ul className="pv3-search-results">
              {searchResults.map(({ section, index }) => (
                <li key={section.id}>
                  <button className={index === activeIndex ? 'active' : ''} aria-current={index === activeIndex ? 'true' : undefined} onClick={() => onSelect(index)}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{cleanTitle(section.title)}</strong>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pv3-search-empty">No sections match “{query}”.</p>
          )
        ) : (
          <ul className="pv3-chapter-list">
            {chapters.map((chapter) => (
              <li key={chapter.head.id}>
                <button
                  className={`pv3-chapter-head ${chapter.headIndex === activeIndex ? 'active' : visited.has(chapter.headIndex) ? 'visited' : ''}`}
                  onClick={() => onSelect(chapter.headIndex)}
                >
                  <FolderClosed size={12} />
                  <strong>{cleanTitle(chapter.head.title)}</strong>
                  {visited.has(chapter.headIndex) && <Check size={12} />}
                </button>
                {chapter.children.length > 0 && (
                  <ul className="pv3-chapter-children">
                    {chapter.children.map(({ section, index }) => (
                      <li key={section.id}>
                        <button
                          className={index === activeIndex ? 'active' : visited.has(index) ? 'visited' : ''}
                          onClick={() => onSelect(index)}
                        >
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <em>{cleanTitle(section.title)}</em>
                          {visited.has(index) && <Check size={11} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>

      <button className={`pv3-forms-shortcut ${activeIndex === formsPageIndex ? 'active' : ''}`} onClick={() => onSelect(formsPageIndex)}>
        <Library size={13} />
        <span>Related forms &amp; records</span>
      </button>

      <footer className="pv3-rail-footer">
        <div><span>READING PROGRESS</span><strong>{readPercent}%</strong></div>
        <i><b style={{ width: `${readPercent}%` }} /></i>
        <small>{visited.size} of {sections.length} sections visited</small>
      </footer>
    </aside>
  );
}
