import { useQuery } from '@tanstack/react-query';
import type { School, SchoolDetail, SearchParams } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function fetchSchools(params: SearchParams): Promise<School[]> {
  const query = new URLSearchParams();
  if (params.postcode) query.set('postcode', params.postcode);
  if (params.radiusKm) query.set('radiusKm', String(params.radiusKm));
  if (params.phase) query.set('phase', params.phase);
  if (params.minRating) query.set('minRating', params.minRating);

  const res = await fetch(`${API_BASE}/schools/search?${query}`);
  if (!res.ok) throw new Error('Failed to fetch schools');
  return res.json();
}

async function fetchCompare(urns: number[]): Promise<SchoolDetail[]> {
  const res = await fetch(`${API_BASE}/schools/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urns }),
  });
  if (!res.ok) throw new Error('Failed to fetch comparison');
  return res.json();
}

export function useSearchSchools(params: SearchParams) {
  return useQuery({
    queryKey: ['schools', params],
    queryFn: () => fetchSchools(params),
    enabled: Boolean(params.postcode),
  });
}

export function useCompareSchools(urns: number[]) {
  return useQuery({
    queryKey: ['compare', urns],
    queryFn: () => fetchCompare(urns),
    enabled: urns.length >= 2,
  });
}

async function fetchSchoolDetail(urn: number): Promise<SchoolDetail> {
  const res = await fetch(`${API_BASE}/schools/${urn}`);
  if (!res.ok) throw new Error('Failed to fetch school detail');
  return res.json();
}

export function useSchoolDetail(urn: number | null) {
  return useQuery({
    queryKey: ['school', urn],
    queryFn: () => fetchSchoolDetail(urn!),
    enabled: urn != null,
  });
}
