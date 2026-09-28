export type OfstedRating = 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate';
export type SchoolPhase = 'Primary' | 'Secondary' | 'All-through' | 'Special';

export interface School {
  urn: number;
  name: string;
  type: string;
  phaseOfEducation: string;
  postcode: string;
  address: string;
  latitude: number;
  longitude: number;
  overallEffectiveness: string | null;
  capacity: number | null;
}

export interface SchoolDetail extends School {
  status: string;
  schoolWebsite: string;
  phone: string;
  localAuthority: string;
  inspectionDate: string | null;
  inspectionType: string | null;
  qualityOfEducation: string | null;
  behaviourAndAttitudes: string | null;
  personalDevelopment: string | null;
  leadershipAndManagement: string | null;
  academicMetrics: AcademicMetric[];
}

export interface AcademicMetric {
  metricName: string;
  value: string;
  year: string;
}

export interface SearchParams {
  postcode?: string;
  radiusKm?: number;
  phase?: string;
  minRating?: string;
}
