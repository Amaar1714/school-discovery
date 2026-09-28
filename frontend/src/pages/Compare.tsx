import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingBadge } from '@/components/RatingBadge';
import { useCompareSchools } from '@/api';
import type { SchoolDetail } from '@/types';

const metricRow = (label: string, values: (string | number | null | undefined)[]) => (
  <tr className="border-b border-border">
    <td className="py-3 px-4 text-sm font-medium text-muted-foreground bg-muted/30 w-[180px]">{label}</td>
    {values.map((val, i) => (
      <td key={i} className="py-3 px-4 text-sm text-card-foreground text-center">
        {val != null && val !== '' ? (
          <span className="font-medium">{val}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    ))}
  </tr>
);

const Compare = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') ?? [];
  const urns = ids.map(Number).filter(Boolean);

  const { data: schools = [], isLoading } = useCompareSchools(urns);

  const removeSchool = (urn: number) => {
    const remaining = urns.filter((u) => u !== urn);
    if (remaining.length < 2) {
      navigate(-1);
    } else {
      navigate(`/compare?ids=${remaining.join(',')}`);
    }
  };

  if (urns.length < 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Select at least 2 schools to compare.</p>
          <Button onClick={() => navigate('/explore')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <MapPin className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-foreground">Side-by-Side Comparison</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading comparison...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-[180px]" />
                  {schools.map((school) => (
                    <th key={school.urn} className="py-4 px-4 text-center">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/schools/${school.urn}`}
                            className="font-heading font-semibold text-base text-card-foreground hover:text-primary hover:underline"
                          >
                            {school.name}
                          </Link>
                          <button
                            onClick={() => removeSchool(school.urn)}
                            className="ml-1 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <RatingBadge rating={school.overallEffectiveness} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricRow('School Type', schools.map((s) => s.phaseOfEducation || s.type))}
                {metricRow('Address', schools.map((s) => s.address))}
                {metricRow('Local Authority', schools.map((s: SchoolDetail) => s.localAuthority))}
                {metricRow('Ofsted Rating', schools.map((s) => s.overallEffectiveness))}
                {metricRow(
                  'Last Inspection',
                  schools.map((s: SchoolDetail) =>
                    s.inspectionDate
                      ? new Date(s.inspectionDate).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : null
                  )
                )}
                {metricRow('Inspection Type', schools.map((s: SchoolDetail) => s.inspectionType))}
                {metricRow('Quality of Education', schools.map((s: SchoolDetail) => s.qualityOfEducation))}
                {metricRow('Behaviour & Attitudes', schools.map((s: SchoolDetail) => s.behaviourAndAttitudes))}
                {metricRow('Personal Development', schools.map((s: SchoolDetail) => s.personalDevelopment))}
                {metricRow('Leadership & Management', schools.map((s: SchoolDetail) => s.leadershipAndManagement))}

                {schools.some((s: SchoolDetail) => s.academicMetrics?.length > 0) && (
                  <>
                    <tr>
                      <td colSpan={schools.length + 1} className="pt-6 pb-2 px-4">
                        <h4 className="font-heading font-semibold text-sm text-foreground">Academic Performance</h4>
                      </td>
                    </tr>
                    {(() => {
                      const allMetricNames = Array.from(
                        new Set(
                          (schools as SchoolDetail[]).flatMap((s) =>
                            (s.academicMetrics ?? []).map((m) => m.metricName)
                          )
                        )
                      );
                      return allMetricNames.map((metricName) =>
                        metricRow(
                          metricName,
                          (schools as SchoolDetail[]).map((s) => {
                            const m = s.academicMetrics?.find((x) => x.metricName === metricName);
                            return m ? `${m.value} (${m.year})` : null;
                          })
                        )
                      );
                    })()}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
