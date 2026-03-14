import { useState, useCallback } from 'react';

export interface ScanState {
  scanning: boolean;
  error: string | null;
}

export function useScan(onComplete?: () => void) {
  const [state, setState] = useState<ScanState>({ scanning: false, error: null });

  const startScan = useCallback(async () => {
    setState({ scanning: true, error: null });

    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setState({ scanning: false, error: data.error || 'Scan failed' });
        return;
      }

      // Scan completed synchronously (server responds when done)
      setState({ scanning: false, error: null });
      onComplete?.();
    } catch (err: unknown) {
      setState({ scanning: false, error: (err as Error).message });
    }
  }, [onComplete]);

  return {
    scanning: state.scanning,
    error: state.error,
    startScan,
  };
}
