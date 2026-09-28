import { type OfstedRating } from '@/types';
import { cn } from '@/lib/utils';

const ratingStyles: Record<OfstedRating, string> = {
  'Outstanding': 'bg-rating-outstanding text-success-foreground',
  'Good': 'bg-rating-good text-success-foreground',
  'Requires Improvement': 'bg-rating-requires-improvement text-warning-foreground',
  'Inadequate': 'bg-rating-inadequate text-destructive-foreground',
};

const fallbackStyle = 'bg-muted text-muted-foreground';

export const RatingBadge = ({ rating, className }: { rating: string | null | undefined; className?: string }) => {
  const style = rating ? (ratingStyles[rating as OfstedRating] ?? fallbackStyle) : fallbackStyle;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', style, className)}>
      {rating ?? 'Unrated'}
    </span>
  );
};
