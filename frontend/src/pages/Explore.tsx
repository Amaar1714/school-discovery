import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, ArrowLeft, Search, GitCompareArrows, X, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolMap } from '@/components/SchoolMap';
import { SchoolCard } from '@/components/SchoolCard';
import { FilterPanel } from '@/components/FilterPanel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSearchSchools } from '@/api';
import type { School, SchoolPhase, OfstedRating } from '@/types';

const MAX_COMPARE = 4;

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postcodeFromUrl = searchParams.get('postcode') ?? '';

  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [nameQuery, setNameQuery] = useState('');
  const [selectedPhases, setSelectedPhases] = useState<SchoolPhase[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<OfstedRating[]>([]);
  const [compareList, setCompareList] = useState<School[]>([]);
  const [radiusMiles, setRadiusMiles] = useState<number | null>(null);

  const MILES_TO_KM = 1.60934;
  const radiusOptions: { label: string; value: number | null }[] = [
    { label: 'Any distance', value: null },
    { label: 'Within 1 mile', value: 1 },
    { label: 'Within 3 miles', value: 3 },
    { label: 'Within 5 miles', value: 5 },
    { label: 'Within 10 miles', value: 10 },
    { label: 'Within 15 miles', value: 15 },
    { label: 'Within 20 miles', value: 20 },
    { label: 'Within 25 miles', value: 25 },
  ];

  const { data: schools = [], isLoading } = useSearchSchools({
    postcode: postcodeFromUrl || undefined,
    radiusKm: radiusMiles != null ? radiusMiles * MILES_TO_KM : 50,
    phase: selectedPhases.length === 1 ? selectedPhases[0] : undefined,
    minRating: selectedRatings.length === 1 ? selectedRatings[0] : undefined,
  });

  const toggleCompare = useCallback((school: School) => {
    setCompareList((prev) =>
      prev.some((s) => s.urn === school.urn)
        ? prev.filter((s) => s.urn !== school.urn)
        : prev.length < MAX_COMPARE
        ? [...prev, school]
        : prev
    );
  }, []);

  const togglePhase = (phase: SchoolPhase) => {
    setSelectedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const toggleRating = (rating: OfstedRating) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const matchesName =
        !nameQuery ||
        school.name.toLowerCase().includes(nameQuery.toLowerCase()) ||
        (school.postcode ?? '').toLowerCase().includes(nameQuery.toLowerCase());
      const matchesPhase =
        selectedPhases.length === 0 ||
        selectedPhases.some((p) => school.phaseOfEducation?.toLowerCase().includes(p.toLowerCase()));
      const matchesRating =
        selectedRatings.length === 0 || selectedRatings.includes(school.overallEffectiveness as OfstedRating);
      return matchesName && matchesPhase && matchesRating;
    });
  }, [schools, nameQuery, selectedPhases, selectedRatings]);

  const sidebarContent = (
    <>
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by name or postcode..."
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-secondary-foreground placeholder:text-muted-foreground border-0 outline-none text-sm focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Radius filter */}
      <div className="p-3 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Distance</p>
        <select
          value={radiusMiles ?? ''}
          onChange={(e) => setRadiusMiles(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full h-9 px-3 rounded-lg bg-secondary text-secondary-foreground text-sm border-0 outline-none focus:ring-2 focus:ring-accent cursor-pointer"
        >
          {radiusOptions.map((opt) => (
            <option key={opt.label} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-border">
        <FilterPanel
          selectedTypes={selectedPhases}
          selectedRatings={selectedRatings}
          onToggleType={togglePhase}
          onToggleRating={toggleRating}
          onClear={() => {
            setSelectedPhases([]);
            setSelectedRatings([]);
          }}
        />
      </div>

      {/* School list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading schools...</div>
        )}
        {!isLoading && filteredSchools.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {postcodeFromUrl
              ? 'No schools match your filters.'
              : 'Enter a postcode on the home page to find nearby schools.'}
          </div>
        )}
        {filteredSchools.map((school) => (
          <SchoolCard
            key={school.urn}
            school={school}
            isSelected={selectedSchool?.urn === school.urn}
            isComparing={compareList.some((s) => s.urn === school.urn)}
            onCompareToggle={toggleCompare}
            compareDisabled={compareList.length >= MAX_COMPARE}
            onClick={() => setSelectedSchool(school)}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Topbar */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <MapPin className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-foreground">SchoolScout</span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {isLoading ? 'Loading...' : `${filteredSchools.length} schools`}
        </span>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Mobile: floating button to open schools sheet */}
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="rounded-full shadow-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
              >
                <List className="h-5 w-5 mr-2" />
                Schools ({filteredSchools.length})
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl flex flex-col p-0">
              <div className="flex flex-col h-full overflow-hidden">
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: sidebar */}
        <aside className="hidden md:flex w-[360px] border-r border-border bg-card flex-col overflow-hidden shrink-0">
          {sidebarContent}
        </aside>

        {/* Map */}
        <main className="flex-1 relative min-w-0">
          <SchoolMap
            schools={filteredSchools}
            selectedSchool={selectedSchool}
            onSelectSchool={setSelectedSchool}
            postcode={postcodeFromUrl || undefined}
            radiusKm={radiusMiles != null ? radiusMiles * MILES_TO_KM : undefined}
          />
        </main>
      </div>

      {/* Compare floating bar - centered on all screen sizes */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-card border border-border rounded-2xl shadow-lg px-4 py-3 flex flex-wrap items-center justify-center gap-3 md:gap-4 md:flex-nowrap">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              {compareList.length} school{compareList.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-1">
            {compareList.map((s) => (
              <span
                key={s.urn}
                className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
              >
                {s.name.split(' ')[0]}
                <button onClick={() => toggleCompare(s)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
            disabled={compareList.length < 2}
            onClick={() => navigate(`/compare?ids=${compareList.map((s) => s.urn).join(',')}`)}
          >
            Compare
          </Button>
        </div>
      )}
    </div>
  );
};

export default Explore;
