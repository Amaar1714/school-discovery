import { type School } from '@/types';
import { RatingBadge } from './RatingBadge';
import { MapPin, Calendar, GraduationCap, GitCompareArrows } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolCardProps {
  school: School;
  isSelected?: boolean;
  isComparing?: boolean;
  onCompareToggle?: (school: School) => void;
  compareDisabled?: boolean;
  onClick?: () => void;
}

export const SchoolCard = ({ school, isSelected, isComparing, onCompareToggle, compareDisabled, onClick }: SchoolCardProps) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-accent border-accent shadow-lg' : 'border-border hover:border-accent/50'
    }`}
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-heading font-semibold text-sm text-card-foreground leading-tight">{school.name}</h3>
      <RatingBadge rating={school.overallEffectiveness} />
    </div>

    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
      <MapPin className="h-3 w-3 shrink-0" />
      <span className="truncate">{school.address}</span>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center gap-1 text-muted-foreground">
        <GraduationCap className="h-3 w-3" />
        <span>{school.phaseOfEducation || school.type}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{school.overallEffectiveness ?? 'Unrated'}</span>
      </div>
    </div>

    {onCompareToggle && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCompareToggle(school);
        }}
        disabled={compareDisabled && !isComparing}
        className={cn(
          'mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
          isComparing
            ? 'bg-accent text-accent-foreground'
            : compareDisabled
            ? 'bg-muted text-muted-foreground/40 cursor-not-allowed'
            : 'bg-secondary text-secondary-foreground hover:bg-accent/20 hover:text-accent-foreground'
        )}
      >
        <GitCompareArrows className="h-3.5 w-3.5" />
        {isComparing ? 'Remove from Compare' : 'Add to Compare'}
      </button>
    )}
  </div>
);
