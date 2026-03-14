import { useState, useEffect, useCallback } from 'react';

export interface Account {
  name: string;
  accessKeyId: string;
  secretAccessKey: string;
  defaultRegion?: string;
  roleArn?: string;
  sessionToken?: string;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setError(null);
    } catch {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(async (account: Account) => {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchAccounts();
  }, [fetchAccounts]);

  const updateAccount = useCallback(async (originalName: string, updates: Partial<Account>) => {
    const res = await fetch(`/api/accounts/${encodeURIComponent(originalName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchAccounts();
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (name: string) => {
    const res = await fetch(`/api/accounts/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: fetchAccounts,
  };
}
