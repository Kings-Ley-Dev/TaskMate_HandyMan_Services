import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Wrench, Zap, Paintbrush, Hammer, Wind, Flower, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const serviceIcons = {
  Plumbing: Wrench,
  Electrical: Zap,
  Carpentry: Hammer,
  Painting: Paintbrush,
  HVAC: Wind,
  Landscaping: Flower,
  Cleaning: Sparkles,
};

interface Provider {
  id: string;
  full_name: string;
  service_type: string;
  rating: number;
  reviews_count: number;
  location: string;
  hourly_rate: number;
  avatar_url: string | null;
  skills: string[];
}

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, service_type, rating, reviews_count, location, hourly_rate, avatar_url, skills')
        .eq('approved', true)
        .not('service_type', 'is', null);

      if (error) throw error;

      const providersData = (data || []).map(p => ({
        ...p,
        full_name: p.full_name || 'Unknown Provider',
        service_type: p.service_type || 'General',
        rating: p.rating || 0,
        reviews_count: p.reviews_count || 0,
        location: p.location || 'Location not specified',
        hourly_rate: p.hourly_rate || 0,
        skills: p.skills || [],
      }));

      setProviders(providersData);
      setFilteredProviders(providersData);
    } catch (error: any) {
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = providers.filter((provider) => {
      const matchesService = searchQuery === "" || 
        provider.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLocation = location === "" || 
        provider.location.toLowerCase().includes(location.toLowerCase());
      return matchesService && matchesLocation;
    });
    setFilteredProviders(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Search Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find the Perfect Service Provider
            </h1>
            <p className="text-xl text-white/90">
              Connect with trusted professionals in your area
            </p>
          </div>
          
          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Service (e.g., plumber)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary-dark"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Available Service Providers</h2>
            <p className="text-muted-foreground">
              {filteredProviders.length} providers found in your area
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No providers found matching your criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => {
                const Icon = serviceIcons[provider.service_type as keyof typeof serviceIcons] || Wrench;
                return (
                  <Card key={provider.id} className="hover-lift">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <img
                          src={provider.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"}
                          alt={provider.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{provider.full_name}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Icon className="h-3 w-3" />
                              {provider.service_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({provider.reviews_count} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {provider.location}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {provider.skills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-primary">
                              ₵{provider.hourly_rate}/hr
                            </span>
                          </div>
                          <Link to={`/services/${provider.id}`}>
                            <Button className="w-full bg-secondary hover:bg-secondary-dark">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Services;
