import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Globe, Building2, GraduationCap, Calendar, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingBadge } from '@/components/RatingBadge';
import { useSchoolDetail } from '@/api';
import type { AcademicMetric } from '@/types';

const SchoolDetail = () => {
  const { urn } = useParams<{ urn: string }>();
  const navigate = useNavigate();
  const { data: school, isLoading, isError } = useSchoolDetail(urn ? Number(urn) : null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading school details...</p>
      </div>
    );
  }

  if (isError || !school) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">School not found.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const hasMetrics = school.academicMetrics && school.academicMetrics.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <MapPin className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-foreground">School Details</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

        {/* School name + Ofsted badge */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-2xl font-bold text-foreground">{school.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {school.address}
              </p>
            </div>
            <RatingBadge rating={school.overallEffectiveness} className="text-sm px-3 py-1" />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {school.type && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {school.type}
              </span>
            )}
            {school.phaseOfEducation && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                {school.phaseOfEducation}
              </span>
            )}
            {school.status && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                {school.status}
              </span>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {school.localAuthority && (
            <InfoCard icon={<Building2 className="h-4 w-4" />} label="Local Authority" value={school.localAuthority} />
          )}
          {school.phone && (
            <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value={school.phone} />
          )}
          {school.schoolWebsite && (
            <InfoCard
              icon={<Globe className="h-4 w-4" />}
              label="Website"
              value={
                <a
                  href={school.schoolWebsite.startsWith('http') ? school.schoolWebsite : `https://${school.schoolWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate block"
                >
                  {school.schoolWebsite}
                </a>
              }
            />
          )}
        </div>

        {/* Ofsted inspection */}
        {(school.overallEffectiveness || school.inspectionDate || school.inspectionType) && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Ofsted Inspection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Overall Rating</p>
                <RatingBadge rating={school.overallEffectiveness} />
              </div>
              {school.inspectionDate && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Last Inspection</p>
                  <p className="font-medium text-card-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(school.inspectionDate).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {school.inspectionType && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Inspection Type</p>
                  <p className="font-medium text-card-foreground">{school.inspectionType}</p>
                </div>
              )}
            </div>

            {(school.qualityOfEducation || school.behaviourAndAttitudes || school.personalDevelopment || school.leadershipAndManagement) && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Sub-judgements</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {school.qualityOfEducation && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Quality of education</span>
                      <RatingBadge rating={school.qualityOfEducation} />
                    </div>
                  )}
                  {school.behaviourAndAttitudes && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Behaviour and attitudes</span>
                      <RatingBadge rating={school.behaviourAndAttitudes} />
                    </div>
                  )}
                  {school.personalDevelopment && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Personal development</span>
                      <RatingBadge rating={school.personalDevelopment} />
                    </div>
                  )}
                  {school.leadershipAndManagement && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Leadership and management</span>
                      <RatingBadge rating={school.leadershipAndManagement} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Academic Results */}
        {hasMetrics ? (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Academic Results
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Measure</th>
                    <th className="py-2 px-3 text-right text-muted-foreground font-medium">Result</th>
                    <th className="py-2 px-3 text-right text-muted-foreground font-medium">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {school.academicMetrics.map((m: AcademicMetric, i: number) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-2.5 px-3 text-card-foreground">{m.metricName}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-card-foreground">{m.value}</td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">{m.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Source: Department for Education — Explore Education Statistics
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4" />
              Academic Results
            </h2>
            <p className="text-sm text-muted-foreground">
              No academic results available for this school yet. Run ingestion to load performance data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm font-medium text-card-foreground">{value}</div>
    </div>
  </div>
);

export default SchoolDetail;
