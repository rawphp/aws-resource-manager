import { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { SummaryCards } from './components/SummaryCards';
import { ResourceTable } from './components/ResourceTable';
import { CostBreakdown } from './components/CostBreakdown';
import { CleanupPanel } from './components/CleanupPanel';
import { AccountsManager } from './components/AccountsManager';
import { ThemeSelector } from './components/ThemeSelector';
import { useReport } from './hooks/useReport';
import { useScan } from './hooks/useScan';
import { useAccounts } from './hooks/useAccounts';

type View = 'resources' | 'costs' | 'accounts';

export function App() {
  const [view, setView] = useState<View>('resources');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const {
    report,
    loading,
    loadReport,
    availableReports,
    currentReportName,
    selectReport,
    refreshReports,
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

  const { scanning, error: scanError, startScan } = useScan(refreshReports);
  const {
    accounts: accountsList,
    loading: accountsLoading,
    error: accountsError,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts();

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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--text-muted)',
        fontSize: '1.1rem',
      }}>
        Loading report...
      </div>
    );
  }

  if (!report) {
    return <FileUpload onFileLoad={loadReport} onScan={startScan} scanning={scanning} scanError={scanError} />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
          AWS Resource Manager
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={startScan}
            disabled={scanning}
            style={{
              padding: '8px 16px',
              background: scanning ? 'var(--bg-disabled)' : 'var(--success)',
              color: 'var(--text-on-accent)',
              border: 'none',
              borderRadius: '6px',
              cursor: scanning ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: scanning ? 0.7 : 1,
            }}
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
          {/* Report selector dropdown */}
          {availableReports.length > 0 && (
            <select
              value={currentReportName}
              onChange={(e) => {
                setSelectedIds(new Set());
                selectReport(e.target.value);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                maxWidth: '300px',
              }}
            >
              {availableReports.map((name) => (
                <option key={name} value={name}>{formatReportName(name)}</option>
              ))}
            </select>
          )}

          {(['resources', 'costs', 'accounts'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '8px 16px',
                background: view === v ? 'var(--accent)' : 'var(--bg-secondary)',
                color: view === v ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: view === v ? 600 : 400,
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <ThemeSelector />
        </div>
      </div>

      {scanError && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          background: 'var(--bg-waste)',
          border: '1px solid var(--danger)',
          borderRadius: '6px',
          color: 'var(--danger)',
          fontSize: '0.9rem',
        }}>
          {scanError}
        </div>
      )}

      {view !== 'accounts' && <SummaryCards summary={report.summary} />}

      {view === 'resources' && (
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
      )}
      {view === 'costs' && (
        <CostBreakdown summary={report.summary} allResources={allResources} />
      )}
      {view === 'accounts' && (
        <AccountsManager
          accounts={accountsList}
          loading={accountsLoading}
          error={accountsError}
          onAdd={addAccount}
          onUpdate={updateAccount}
          onDelete={deleteAccount}
        />
      )}

      <CleanupPanel
        selectedResources={selectedResources}
        onClearSelection={() => setSelectedIds(new Set())}
      />
    </div>
  );
}

/** Turns "report-2026-03-14T08-30-00.json" into "2026-03-14 08:30:00" */
function formatReportName(filename: string): string {
  const match = filename.match(/report-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]} ${match[2]}:${match[3]}:${match[4]}`;
  }
  return filename.replace('.json', '');
}
