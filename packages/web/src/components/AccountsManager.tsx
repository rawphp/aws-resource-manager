import { useState } from 'react';
import type { Account } from '../hooks/useAccounts';

interface AccountsManagerProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onAdd: (account: Account) => Promise<void>;
  onUpdate: (originalName: string, updates: Partial<Account>) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
}

const emptyForm: Account = {
  name: '',
  accessKeyId: '',
  secretAccessKey: '',
  defaultRegion: '',
  roleArn: '',
  sessionToken: '',
};

export function AccountsManager({ accounts, loading, error, onAdd, onUpdate, onDelete }: AccountsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [form, setForm] = useState<Account>({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAddForm = () => {
    setForm({ ...emptyForm });
    setEditingName(null);
    setShowForm(true);
    setFormError(null);
  };

  const openEditForm = (account: Account) => {
    setForm({ ...account });
    setEditingName(account.name);
    setShowForm(true);
    setFormError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingName(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.accessKeyId || !form.secretAccessKey) {
      setFormError('Name, Access Key ID, and Secret Access Key are required');
      return;
    }

    try {
      if (editingName) {
        await onUpdate(editingName, form);
      } else {
        await onAdd(form);
      }
      closeForm();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await onDelete(name);
      setConfirmDelete(null);
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading accounts...</div>;
  }

  return (
    <div>
      {error && <div style={{ color: '#dc3545', marginBottom: '16px' }}>{error}</div>}

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={openAddForm}
          style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          Add Account
        </button>
      </div>

      {accounts.length === 0 && !showForm && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#999',
          border: '2px dashed #ddd',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>No accounts configured</p>
          <p style={{ margin: 0 }}>Add an AWS account to get started with scanning.</p>
        </div>
      )}

      {accounts.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Access Key ID</th>
              <th style={thStyle}>Region</th>
              <th style={thStyle}>Role ARN</th>
              <th style={{ ...thStyle, width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.name} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{account.name}</td>
                <td style={tdStyle}><code style={{ fontSize: '0.8rem' }}>{account.accessKeyId}</code></td>
                <td style={tdStyle}>{account.defaultRegion || '—'}</td>
                <td style={tdStyle}>{account.roleArn ? 'Yes' : '—'}</td>
                <td style={tdStyle}>
                  <button onClick={() => openEditForm(account)} style={actionBtnStyle}>Edit</button>
                  {confirmDelete === account.name ? (
                    <>
                      <button onClick={() => handleDelete(account.name)} style={{ ...actionBtnStyle, color: '#dc3545', fontWeight: 600 }}>Confirm</button>
                      <button onClick={() => setConfirmDelete(null)} style={actionBtnStyle}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(account.name)} style={{ ...actionBtnStyle, color: '#dc3545' }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={{
          marginTop: '16px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem' }}>
            {editingName ? `Edit: ${editingName}` : 'Add Account'}
          </h3>

          {formError && <div style={{ color: '#dc3545', marginBottom: '12px', fontSize: '0.85rem' }}>{formError}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                placeholder="e.g., production"
              />
            </div>
            <div>
              <label style={labelStyle}>Access Key ID *</label>
              <input
                value={form.accessKeyId}
                onChange={(e) => setForm({ ...form, accessKeyId: e.target.value })}
                style={inputStyle}
                placeholder="AKIA..."
              />
            </div>
            <div>
              <label style={labelStyle}>Secret Access Key *</label>
              <input
                type="password"
                value={form.secretAccessKey}
                onChange={(e) => setForm({ ...form, secretAccessKey: e.target.value })}
                style={inputStyle}
                placeholder={editingName ? '(unchanged if empty)' : 'Enter secret key'}
              />
            </div>
            <div>
              <label style={labelStyle}>Default Region</label>
              <input
                value={form.defaultRegion || ''}
                onChange={(e) => setForm({ ...form, defaultRegion: e.target.value })}
                style={inputStyle}
                placeholder="e.g., us-east-1"
              />
            </div>
            <div>
              <label style={labelStyle}>Role ARN</label>
              <input
                value={form.roleArn || ''}
                onChange={(e) => setForm({ ...form, roleArn: e.target.value })}
                style={inputStyle}
                placeholder="arn:aws:iam::..."
              />
            </div>
            <div>
              <label style={labelStyle}>Session Token</label>
              <input
                type="password"
                value={form.sessionToken || ''}
                onChange={(e) => setForm({ ...form, sessionToken: e.target.value })}
                style={inputStyle}
                placeholder={editingName ? '(unchanged if empty)' : 'Optional'}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={handleSubmit} style={{
              padding: '8px 20px',
              background: '#4361ee',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
              {editingName ? 'Save Changes' : 'Add Account'}
            </button>
            <button onClick={closeForm} style={{
              padding: '8px 20px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '0.8rem',
  color: '#666',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '0.9rem',
};

const actionBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  background: 'none',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  marginRight: '4px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#555',
  marginBottom: '4px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '0.85rem',
  boxSizing: 'border-box',
};
