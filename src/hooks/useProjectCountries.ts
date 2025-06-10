"use client";

import useSWR from "swr";

interface UseProjectCountriesOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  enabled?: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Ошибка загрузки списка стран");
  }
  return res.json();
};

/**
 * Хук для получения списка стран из проектов
 */
export function useProjectCountries(options: UseProjectCountriesOptions = {}) {
  const { enabled = true, ...restOptions } = options;
  
  const {
    data: countries,
    error,
    isLoading
  } = useSWR<string[]>(
    enabled ? "/api/projects/countries" : null,
    fetcher, 
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // кэшируем на 1 минуту
      ...restOptions
    }
  );

  return {
    countries,
    isLoading,
    error
  };
} 