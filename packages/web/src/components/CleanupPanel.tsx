import { useState } from 'react';
import type { DiscoveredResource } from '@aws-resource-manager/shared';

interface CleanupPanelProps {
  selectedResources: DiscoveredResource[];
  onClearSelection: () => void;
}

export function CleanupPanel({ selectedResources, onClearSelection }: CleanupPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (selectedResources.length === 0) return null;

  const totalCostSavings = selectedResources.reduce(
    (sum, r) => sum + (r.estimatedMonthlyCost || 0),
    0,
  );

  return (
    <>
      {/* Floating cleanup bar */}
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
                style={{
                  padding: '10px 20px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== 'DELETE'}
                onClick={() => {
                  alert('Deletion would execute here with real AWS credentials.\nThis UI demonstration shows the confirmation flow.');
                  setShowConfirm(false);
                  setConfirmText('');
                  onClearSelection();
                }}
                style={{
                  padding: '10px 20px',
                  background: confirmText === 'DELETE' ? '#e63946' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: confirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                }}
              >
                Delete {selectedResources.length} Resource{selectedResources.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
