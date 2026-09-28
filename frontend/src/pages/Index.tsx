import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, BarChart3, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isValidUkPostcode } from '@/lib/postcode';

const features = [
  {
    icon: MapPin,
    title: 'Interactive Map',
    description: 'Explore schools geographically with colour-coded Ofsted ratings and catchment indicators.',
  },
  {
    icon: BarChart3,
    title: 'Performance Data',
    description: 'Compare Progress 8, Attainment 8, and GCSE results across schools side by side.',
  },
  {
    icon: Shield,
    title: '100% Free & Open',
    description: 'No paywalls, no subscriptions. Every family deserves access to this information.',
  },
];

const Index = () => {
  const [postcode, setPostcode] = useState('');
  const [postcodeError, setPostcodeError] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPostcodeError('');
    const trimmed = postcode.trim();
    if (trimmed && !isValidUkPostcode(trimmed)) {
      setPostcodeError('Enter a valid UK postcode');
      return;
    }
    navigate(`/explore${trimmed ? `?postcode=${encodeURIComponent(trimmed)}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">SchoolScout</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)', opacity: 0.92 }} />
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Find the right school for your{' '}
              <span className="text-gradient-hero">child</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Free, interactive maps with Ofsted ratings, performance data, and catchment areas. No paywalls, no subscriptions — just the data you need.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter your postcode..."
                  value={postcode}
                  onChange={(e) => {
                    setPostcode(e.target.value);
                    if (postcodeError) setPostcodeError('');
                  }}
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border-0 outline-none text-sm focus:ring-2 focus:ring-accent ${
                    postcodeError ? 'ring-2 ring-destructive' : 'ring-1 ring-border'
                  }`}
                  aria-invalid={!!postcodeError}
                  aria-describedby={postcodeError ? 'postcode-error' : undefined}
                />
                {postcodeError && (
                  <p id="postcode-error" className="mt-1.5 text-sm text-destructive font-medium">
                    {postcodeError}
                  </p>
                )}
              </div>
              <Button type="submit" className="h-12 px-6 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shrink-0">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
              School data, made simple
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We bring together government data into one beautiful, easy-to-use platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
