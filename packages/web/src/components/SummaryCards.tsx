import type { ReportSummary } from '@aws-resource-manager/shared';

interface SummaryCardsProps {
  summary: ReportSummary;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '20px 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  minWidth: '200px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#666',
  marginBottom: '4px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '1.8rem',
  fontWeight: 700,
  color: '#1a1a2e',
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const serviceCount = Object.keys(summary.resourcesByService).length;

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
      <div style={cardStyle}>
        <div style={labelStyle}>Total Resources</div>
        <div style={valueStyle}>{summary.totalResources.toLocaleString()}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Est. Monthly Cost</div>
        <div style={{ ...valueStyle, color: '#e63946' }}>
          ${summary.totalEstimatedMonthlyCost.toFixed(2)}
        </div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Services Active</div>
        <div style={valueStyle}>{serviceCount}</div>
      </div>
    </div>
  );
}
