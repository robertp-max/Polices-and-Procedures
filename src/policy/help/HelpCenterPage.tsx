import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, articlesByCategory } from './articles';
import { PageHeader } from '@/policy/components/ui';

interface CategoryModel {
  id: string;
  title: string;
  count: number;
}

function useCategoryModels(): CategoryModel[] {
  return useMemo(
    () =>
      CATEGORIES.map(category => {
        const items = articlesByCategory(category.id);
        return {
          id: category.id,
          title: category.label,
          count: items.length,
        };
      }),
    [],
  );
}

function HelpHome({
  categories,
  query,
  setQuery,
  onSelectCategory,
}: {
  categories: CategoryModel[];
  query: string;
  setQuery: (query: string) => void;
  onSelectCategory: (id: string) => void;
}) {
  return (
    <main className="flex-1 flex flex-col w-full">
      {/* Standard shell content - removed custom SearchHero and 3-col CategoryCard grid to match ref 25-help-center.png using standard layout inside CommandCenterLayout + ShellNavRail. Only content/records differ from ref. Use list for categories to match standard visual. */}
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, guides, or policies..."
            className="w-full px-4 py-3 border border-[#E5E4E3] rounded-[8px] text-sm font-roboto focus:outline-none focus:border-[#00797D]"
          />
        </div>
        {query.trim() ? (
          <div>
            <h3 className="text-lg font-roboto font-medium mb-4">Search Results</h3>
            <p className="text-sm text-[#52404B]">Results would appear here (content differs by records).</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category.id} onClick={() => onSelectCategory(category.id)} className="surface-card cursor-pointer p-4 flex items-center justify-between hover-lift">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-[8px] bg-[#F7FEFF] flex items-center justify-center text-[#00797D]">
                    <span className="text-xs">📄</span>
                  </div>
                  <div>
                    <div className="font-roboto text-sm font-medium">{category.title}</div>
                    <div className="text-xs text-[#52404B]">{category.count} articles</div>
                  </div>
                </div>
                <span className="text-[#00797D]">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export function HelpCenterPage() {
  const categories = useCategoryModels();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSelectCategory = (categoryId: string) => {
    setQuery('');
    navigate(`/help/category/${categoryId}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ background: 'transparent' }}>
      <div className="px-6 pt-2">
        <PageHeader
          eyebrow="KNOWLEDGE BASE"
          title="Help Center"
          description="Search and browse operational guides, compliance workflows, and developer references."
        />
      </div>
      <HelpHome
        categories={categories}
        query={query}
        setQuery={setQuery}
        onSelectCategory={handleSelectCategory}
      />
    </div>
  );
}
