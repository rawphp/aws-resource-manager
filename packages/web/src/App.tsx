import { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { SummaryCards } from './components/SummaryCards';
import { ResourceTable } from './components/ResourceTable';
import { CostBreakdown } from './components/CostBreakdown';
import { CleanupPanel } from './components/CleanupPanel';
import { useReport } from './hooks/useReport';

type View = 'resources' | 'costs';

export function App() {
  const [view, setView] = useState<View>('resources');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const {
    report,
    loadReport,
    filters,
    setFilters,
    sort,
    toggleSort,
    allResources,
    filteredResources,
    services,
    regions,
    accounts,
  } = useReport();

  const selectedResources = useMemo(
    () => allResources.filter((r) => selectedIds.has(r.id)),
    [allResources, selectedIds],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!report) {
    return <FileUpload onFileLoad={loadReport} />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', paddingBottom: '100px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#1a1a2e', margin: 0 }}>
          AWS Resource Manager
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['resources', 'costs'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '8px 16px',
                background: view === v ? '#4361ee' : '#f0f0f0',
                color: view === v ? 'white' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: view === v ? 600 : 400,
              }}
            >
              {v === 'resources' ? 'Resources' : 'Costs'}
            </button>
          ))}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Load New Report
          </button>
        </div>
      </div>

      <SummaryCards summary={report.summary} />

      {view === 'resources' ? (
        <ResourceTable
          resources={filteredResources}
          filters={filters}
          onFilterChange={setFilters}
          sort={sort}
          onSort={toggleSort}
          services={services}
          regions={regions}
          accounts={accounts}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      ) : (
        <CostBreakdown summary={report.summary} allResources={allResources} />
      )}

      <CleanupPanel
        selectedResources={selectedResources}
        onClearSelection={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
