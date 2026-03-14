import { useState } from 'react';
import type { DiscoveredResource } from '@aws-resource-manager/shared';

interface DeleteResult {
  resourceId: string;
  service: string;
  success: boolean;
  error?: string;
}

interface CleanupPanelProps {
  selectedResources: (DiscoveredResource & { account: string })[];
  onClearSelection: () => void;
}

export function CleanupPanel({ selectedResources, onClearSelection }: CleanupPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [results, setResults] = useState<DeleteResult[] | null>(null);

  if (selectedResources.length === 0 && !results) return null;

  const totalCostSavings = selectedResources.reduce(
    (sum, r) => sum + (r.estimatedMonthlyCost || 0),
    0,
  );

  const handleDelete = async () => {
    setDeleting(true);
    setResults(null);

    try {
      // Group resources by account
      const byAccount = new Map<string, typeof selectedResources>();
      for (const r of selectedResources) {
        const existing = byAccount.get(r.account) || [];
        existing.push(r);
        byAccount.set(r.account, existing);
      }

      const allResults: DeleteResult[] = [];

      for (const [accountName, resources] of byAccount) {
        const response = await fetch('/api/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountName, resources }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Mark all resources in this account as failed
          for (const r of resources) {
            allResults.push({
              resourceId: r.id,
              service: r.service,
              success: false,
              error: data.error || `HTTP ${response.status}`,
            });
          }
        } else {
          allResults.push(...data.results);
        }
      }

      setResults(allResults);
    } catch (err: unknown) {
      setResults(
        selectedResources.map((r) => ({
          resourceId: r.id,
          service: r.service,
          success: false,
          error: (err as Error).message,
        })),
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDismissResults = () => {
    setResults(null);
    setShowConfirm(false);
    setConfirmText('');
    onClearSelection();
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <>
      {/* Floating cleanup bar */}
      {selectedResources.length > 0 && !results && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1a2e',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 100,
        }}>
          <span style={{ fontWeight: 600 }}>
            {selectedResources.length} resource{selectedResources.length !== 1 ? 's' : ''} selected
          </span>
          {totalCostSavings > 0 && (
            <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>
              ~${totalCostSavings.toFixed(2)}/mo savings
            </span>
          )}
          <button
            onClick={onClearSelection}
            style={{
              padding: '6px 12px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              padding: '6px 16px',
              background: '#e63946',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Review & Delete
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            {/* Results view */}
            {results ? (
              <>
                <h2 style={{ margin: '0 0 8px', color: failCount > 0 ? '#e63946' : '#2d6a4f' }}>
                  Deletion {failCount > 0 ? 'Completed with Errors' : 'Complete'}
                </h2>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  {successCount} succeeded, {failCount} failed
                </p>

                <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
                  {results.map((r) => (
                    <div key={r.resourceId} style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: r.success ? '#2d6a4f' : '#e63946' }}>
                          {r.success ? 'Deleted' : 'Failed'}
                        </span>
                        <span style={{ fontWeight: 500 }}>{r.resourceId}</span>
                        <span style={{ color: '#999' }}>({r.service})</span>
                      </div>
                      {r.error && (
                        <div style={{ color: '#e63946', fontSize: '0.8rem', marginTop: '4px' }}>
                          {r.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleDismissResults}
                    style={{
                      padding: '10px 20px',
                      background: '#4361ee',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 8px', color: '#e63946' }}>Confirm Resource Deletion</h2>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  You are about to delete {selectedResources.length} resource{selectedResources.length !== 1 ? 's' : ''}.
                  This action cannot be undone.
                </p>

                <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
                  {selectedResources.map((r) => (
                    <div key={r.id} style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ fontWeight: 500 }}>{r.name || r.id}</div>
                      <div style={{ color: '#666', fontSize: '0.8rem' }}>
                        {r.service} / {r.type} / {r.region}
                        {r.estimatedMonthlyCost !== undefined && ` — $${r.estimatedMonthlyCost.toFixed(2)}/mo`}
                      </div>
                    </div>
                  ))}
                </div>

                {totalCostSavings > 0 && (
                  <div style={{
                    padding: '12px',
                    background: '#d4edda',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '0.9rem',
                  }}>
                    Estimated monthly savings: <strong>${totalCostSavings.toFixed(2)}</strong>
                  </div>
                )}

                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  disabled={deleting}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    marginBottom: '16px',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowConfirm(false); setConfirmText(''); }}
                    disabled={deleting}
                    style={{
                      padding: '10px 20px',
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={confirmText !== 'DELETE' || deleting}
                    onClick={handleDelete}
                    style={{
                      padding: '10px 20px',
                      background: confirmText === 'DELETE' && !deleting ? '#e63946' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: confirmText === 'DELETE' && !deleting ? 'pointer' : 'not-allowed',
                      fontWeight: 600,
                    }}
                  >
                    {deleting
                      ? 'Deleting...'
                      : `Delete ${selectedResources.length} Resource${selectedResources.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
