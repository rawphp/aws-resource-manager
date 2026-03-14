import type { ReportSummary, DiscoveredResource } from '@aws-resource-manager/shared';

interface CostBreakdownProps {
  summary: ReportSummary;
  allResources: (DiscoveredResource & { account: string })[];
}

function BarChart({ data, label }: { data: [string, number][]; label: string }) {
  const max = Math.max(...data.map(([, v]) => v), 1);

  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-primary)' }}>{label}</h3>
      {data.map(([name, value]) => (
        <div key={name} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
            <span style={{ fontWeight: 600 }}>${value.toFixed(2)}</span>
          </div>
          <div style={{ background: 'var(--bg-bar)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(value / max) * 100}%`,
                height: '100%',
                background: 'var(--accent)',
                borderRadius: '4px',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No cost data available</p>
      )}
    </div>
  );
}

function WasteDetection({ resources }: { resources: (DiscoveredResource & { account: string })[] }) {
  const wasteIndicators = [
    {
      label: 'Stopped EC2 Instances',
      description: 'Instances that are stopped but still have attached EBS volumes generating charges',
      items: resources.filter((r) => r.service === 'ec2' && r.type.includes('instance') && r.state === 'stopped'),
    },
    {
      label: 'Unattached EBS Volumes',
      description: 'EBS volumes not attached to any instance',
      items: resources.filter((r) => r.service === 'ec2' && r.type.includes('volume') && r.state === 'unattached'),
    },
    {
      label: 'Unused Elastic IPs',
      description: 'Elastic IPs not associated with any instance ($3.60/month each)',
      items: resources.filter((r) => r.service === 'ec2' && r.type.includes('elastic-ip') && r.state === 'unassociated'),
    },
  ];

  const hasWaste = wasteIndicators.some((w) => w.items.length > 0);

  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-primary)' }}>Potential Waste</h3>
      {!hasWaste && (
        <p style={{ color: 'var(--no-waste)', fontSize: '0.9rem' }}>No obvious waste detected.</p>
      )}
      {wasteIndicators.map((indicator) => {
        if (indicator.items.length === 0) return null;
        return (
          <div key={indicator.label} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, color: 'var(--danger-strong)', fontSize: '0.9rem' }}>
                {indicator.label}
              </span>
              <span style={{
                background: 'var(--bg-waste-badge)',
                color: 'var(--text-waste)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}>
                {indicator.items.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 8px' }}>{indicator.description}</p>
            {indicator.items.slice(0, 5).map((item) => (
              <div key={item.id} style={{
                padding: '6px 10px',
                background: 'var(--bg-waste)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                marginBottom: '4px',
              }}>
                {item.name || item.id} — {item.region}
              </div>
            ))}
            {indicator.items.length > 5 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                ...and {indicator.items.length - 5} more
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CostBreakdown({ summary, allResources }: CostBreakdownProps) {
  const costByService = Object.entries(summary.costByService)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const costByRegion = Object.entries(summary.costByRegion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Cost Breakdown</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <BarChart data={costByService} label="Cost by Service" />
        <BarChart data={costByRegion} label="Cost by Region" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
        {/* Top Spenders */}
        <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-primary)' }}>Top 10 Most Expensive</h3>
          {summary.topResources.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < summary.topResources.length - 1 ? '1px solid var(--border-row)' : 'none',
              fontSize: '0.85rem',
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{r.name || r.id}</div>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>{r.service} — {r.region}</div>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--danger-strong)' }}>
                ${(r.estimatedMonthlyCost || 0).toFixed(2)}
              </div>
            </div>
          ))}
          {summary.topResources.length === 0 && (
            <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No cost data available</p>
          )}
        </div>

        <WasteDetection resources={allResources} />
      </div>
    </div>
  );
}
