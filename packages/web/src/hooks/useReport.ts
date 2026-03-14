import { useState, useMemo, useEffect, useCallback } from 'react';
import type { ScanReport, DiscoveredResource } from '@aws-resource-manager/shared';

export interface Filters {
  search: string;
  service: string;
  region: string;
  state: string;
  account: string;
}

export interface SortConfig {
  key: keyof DiscoveredResource | 'estimatedMonthlyCost';
  direction: 'asc' | 'desc';
}

export function useReport() {
  const [report, setReport] = useState<ScanReport | null>(null);
  const [availableReports, setAvailableReports] = useState<string[]>([]);
  const [currentReportName, setCurrentReportName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    service: '',
    region: '',
    state: '',
    account: '',
  });
  const [sort, setSort] = useState<SortConfig>({
    key: 'service',
    direction: 'asc',
  });

  // Fetch available reports on mount
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((files: string[]) => {
        setAvailableReports(files);
        // Auto-load the latest (first in the list, sorted newest-first)
        if (files.length > 0) {
          selectReport(files[0]);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const selectReport = useCallback((filename: string) => {
    setLoading(true);
    fetch(`/api/reports/${filename}`)
      .then((res) => res.json())
      .then((data: ScanReport) => {
        setReport(data);
        setCurrentReportName(filename);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const loadReport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string) as ScanReport;
      setReport(data);
      setCurrentReportName(file.name);
    };
    reader.readAsText(file);
  };

  const allResources = useMemo(() => {
    if (!report) return [];
    const resources: (DiscoveredResource & { account: string })[] = [];
    for (const account of report.accounts) {
      for (const regionResults of Object.values(account.regions)) {
        for (const scanResult of Object.values(regionResults)) {
          for (const r of scanResult.resources) {
            resources.push({ ...r, account: account.account });
          }
        }
      }
    }
    return resources;
  }, [report]);

  const accounts = useMemo(
    () => [...new Set(report?.accounts.map((a) => a.account) || [])],
    [report],
  );

  const services = useMemo(
    () => [...new Set(allResources.map((r) => r.service))].sort(),
    [allResources],
  );

  const regions = useMemo(
    () => [...new Set(allResources.map((r) => r.region))].sort(),
    [allResources],
  );

  const filteredResources = useMemo(() => {
    let result = allResources;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.arn.toLowerCase().includes(q),
      );
    }
    if (filters.service) {
      result = result.filter((r) => r.service === filters.service);
    }
    if (filters.region) {
      result = result.filter((r) => r.region === filters.region);
    }
    if (filters.state) {
      result = result.filter((r) => r.state === filters.state);
    }
    if (filters.account) {
      result = result.filter((r) => r.account === filters.account);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sort.key] ?? '';
      const bVal = b[sort.key] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sort.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allResources, filters, sort]);

  const toggleSort = (key: SortConfig['key']) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const refreshReports = useCallback(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((files: string[]) => {
        setAvailableReports(files);
        if (files.length > 0) {
          selectReport(files[0]);
        }
      })
      .catch(() => { /* silently fail */ });
  }, [selectReport]);

  return {
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
    accounts,
    services,
    regions,
  };
}
