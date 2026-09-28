import { type OfstedRating, type SchoolPhase } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  selectedTypes: SchoolPhase[];
  selectedRatings: OfstedRating[];
  onToggleType: (type: SchoolPhase) => void;
  onToggleRating: (rating: OfstedRating) => void;
  onClear: () => void;
}

const types: SchoolPhase[] = ['Primary', 'Secondary', 'All-through', 'Special'];
const ratings: OfstedRating[] = ['Outstanding', 'Good', 'Requires Improvement', 'Inadequate'];

const ratingDotColors: Record<OfstedRating, string> = {
  'Outstanding': 'bg-rating-outstanding',
  'Good': 'bg-rating-good',
  'Requires Improvement': 'bg-rating-requires-improvement',
  'Inadequate': 'bg-rating-inadequate',
};

export const FilterPanel = ({ selectedTypes, selectedRatings, onToggleType, onToggleRating, onClear }: FilterPanelProps) => {
  const hasFilters = selectedTypes.length > 0 || selectedRatings.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm text-foreground">Filters</h3>
        {hasFilters && (
          <button onClick={onClear} className="text-xs text-accent hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">School Type</p>
        <div className="flex flex-wrap gap-1.5">
          {types.map((type) => (
            <Button
              key={type}
              variant={selectedTypes.includes(type) ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs rounded-full"
              onClick={() => onToggleType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">Ofsted Rating</p>
        <div className="flex flex-wrap gap-1.5">
          {ratings.map((rating) => (
            <Button
              key={rating}
              variant={selectedRatings.includes(rating) ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs rounded-full"
              onClick={() => onToggleRating(rating)}
            >
              <span className={cn('w-2 h-2 rounded-full mr-1.5', ratingDotColors[rating])} />
              {rating}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
