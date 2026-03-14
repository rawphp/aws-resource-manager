import type { DiscoveredResource } from '@aws-resource-manager/shared';
import type { Filters, SortConfig } from '../hooks/useReport';
import { getAwsConsoleUrl } from '../utils/awsConsoleUrl';

interface ResourceTableProps {
  resources: (DiscoveredResource & { account: string })[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  sort: SortConfig;
  onSort: (key: SortConfig['key']) => void;
  services: string[];
  regions: string[];
  accounts: string[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  borderBottom: '2px solid var(--border-header)',
  cursor: 'pointer',
  userSelect: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border-row)',
  fontSize: '0.9rem',
};

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  fontSize: '0.85rem',
  background: 'var(--bg-primary)',
};

export function ResourceTable({
  resources,
  filters,
  onFilterChange,
  sort,
  onSort,
  services,
  regions,
  accounts,
  selectable,
  selectedIds,
  onToggleSelect,
}: ResourceTableProps) {
  const sortIndicator = (key: string) => {
    if (sort.key !== key) return '';
    return sort.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      {/* Filters */}
      <div style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-row)' }}>
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          style={{ ...selectStyle, minWidth: '200px', flex: 1 }}
        />
        {accounts.length > 1 && (
          <select
            value={filters.account}
            onChange={(e) => onFilterChange({ ...filters, account: e.target.value })}
            style={selectStyle}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}
        <select
          value={filters.service}
          onChange={(e) => onFilterChange({ ...filters, service: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.region}
          onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {selectable && <th style={thStyle}></th>}
              <th style={thStyle} onClick={() => onSort('name')}>
                Name{sortIndicator('name')}
              </th>
              <th style={thStyle} onClick={() => onSort('service')}>
                Service{sortIndicator('service')}
              </th>
              <th style={thStyle} onClick={() => onSort('type')}>
                Type{sortIndicator('type')}
              </th>
              <th style={thStyle} onClick={() => onSort('region')}>
                Region{sortIndicator('region')}
              </th>
              <th style={thStyle} onClick={() => onSort('state')}>
                State{sortIndicator('state')}
              </th>
              <th style={thStyle} onClick={() => onSort('estimatedMonthlyCost')}>
                Est. Cost{sortIndicator('estimatedMonthlyCost')}
              </th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={`${r.account}-${r.id}`} style={{ background: selectedIds?.has(r.id) ? 'var(--bg-selected)' : undefined }}>
                {selectable && (
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(r.id) || false}
                      onChange={() => onToggleSelect?.(r.id)}
                    />
                  </td>
                )}
                <td style={tdStyle}>
                  {(() => {
                    const consoleUrl = getAwsConsoleUrl(r);
                    const displayName = r.name || r.id;
                    return consoleUrl ? (
                      <div style={{ fontWeight: 500 }}>
                        <a
                          href={consoleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--text-link)', textDecoration: 'none' }}
                          onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = 'underline'; }}
                          onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = 'none'; }}
                        >
                          {displayName}
                        </a>
                      </div>
                    ) : (
                      <div style={{ fontWeight: 500 }}>{displayName}</div>
                    );
                  })()}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{r.id}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}>
                    {r.service}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.type}</td>
                <td style={tdStyle}>{r.region}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    background: r.state === 'running' || r.state === 'active' || r.state === 'available'
                      ? 'var(--state-running-bg)'
                      : r.state === 'stopped'
                        ? 'var(--state-stopped-bg)'
                        : 'var(--state-other-bg)',
                    color: r.state === 'running' || r.state === 'active' || r.state === 'available'
                      ? 'var(--state-running-text)'
                      : r.state === 'stopped'
                        ? 'var(--state-stopped-text)'
                        : 'var(--state-other-text)',
                  }}>
                    {r.state}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 500 }}>
                  {r.estimatedMonthlyCost !== undefined
                    ? `$${r.estimatedMonthlyCost.toFixed(2)}`
                    : '-'}
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td colSpan={selectable ? 7 : 6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-faint)', padding: '40px' }}>
                  No resources found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border-row)' }}>
        Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
