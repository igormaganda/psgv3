import { useState, useEffect } from 'react';

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const goToPage = (pageNumber: number) => {
    setPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
    goToPage
  };
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface FilterOptions {
  role?: string;
  status?: boolean;
  department?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function useFilters(initialFilters: FilterOptions = {}) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const setFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  };
}
