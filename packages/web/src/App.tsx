import { FileUpload } from './components/FileUpload';
import { SummaryCards } from './components/SummaryCards';
import { ResourceTable } from './components/ResourceTable';
import { useReport } from './hooks/useReport';

export function App() {
  const {
    report,
    loadReport,
    filters,
    setFilters,
    sort,
    toggleSort,
    filteredResources,
    services,
    regions,
    accounts,
  } = useReport();

  if (!report) {
    return <FileUpload onFileLoad={loadReport} />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#1a1a2e', margin: 0 }}>
          AWS Resource Manager
        </h1>
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

      <SummaryCards summary={report.summary} />

      <ResourceTable
        resources={filteredResources}
        filters={filters}
        onFilterChange={setFilters}
        sort={sort}
        onSort={toggleSort}
        services={services}
        regions={regions}
        accounts={accounts}
      />
    </div>
  );
}
