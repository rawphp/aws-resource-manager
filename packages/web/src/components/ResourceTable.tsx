import type { DiscoveredResource } from '@aws-resource-manager/shared';
import type { Filters, SortConfig } from '../hooks/useReport';

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
  color: '#666',
  borderBottom: '2px solid #e9ecef',
  cursor: 'pointer',
  userSelect: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '0.9rem',
};

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '0.85rem',
  background: 'white',
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
    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      {/* Filters */}
      <div style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
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
              <tr key={`${r.account}-${r.id}`} style={{ background: selectedIds?.has(r.id) ? '#e8f0fe' : undefined }}>
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
                  <div style={{ fontWeight: 500 }}>{r.name || r.id}</div>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>{r.id}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#f0f0f0',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}>
                    {r.service}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#666' }}>{r.type}</td>
                <td style={tdStyle}>{r.region}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    background: r.state === 'running' || r.state === 'active' || r.state === 'available'
                      ? '#d4edda'
                      : r.state === 'stopped'
                        ? '#f8d7da'
                        : '#fff3cd',
                    color: r.state === 'running' || r.state === 'active' || r.state === 'available'
                      ? '#155724'
                      : r.state === 'stopped'
                        ? '#721c24'
                        : '#856404',
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
                <td colSpan={selectable ? 7 : 6} style={{ ...tdStyle, textAlign: 'center', color: '#999', padding: '40px' }}>
                  No resources found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px 16px', color: '#666', fontSize: '0.85rem', borderTop: '1px solid #f0f0f0' }}>
        Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
