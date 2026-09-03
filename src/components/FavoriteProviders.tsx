import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Star, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/UserAvatar";

interface FavoriteProvider {
  id: string;
  provider_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    service_type: string | null;
    location: string | null;
    rating: number | null;
    reviews_count: number | null;
    hourly_rate: number | null;
  };
}

interface FavoriteProvidersProps {
  customerId: string;
}

export const FavoriteProviders = ({ customerId }: FavoriteProvidersProps) => {
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [customerId]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          provider_id,
          profiles!favorites_provider_id_fkey (
            id,
            full_name,
            avatar_url,
            service_type,
            location,
            rating,
            reviews_count,
            hourly_rate
          )
        `)
        .eq("customer_id", customerId);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      toast.error("Failed to load favorite providers");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      toast.success("Removed from favorites");
      fetchFavorites();
    } catch (error: any) {
      toast.error("Failed to remove from favorites");
    }
  };

  if (loading) {
    return <div>Loading favorites...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite Providers</CardTitle>
        <CardDescription>Your saved service providers</CardDescription>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No favorite providers yet. Browse services and save your favorites!
          </p>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <UserAvatar
                  avatarUrl={favorite.profiles.avatar_url}
                  fullName={favorite.profiles.full_name}
                  className="h-16 w-16"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{favorite.profiles.full_name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {favorite.profiles.service_type || "Service Provider"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {favorite.profiles.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {favorite.profiles.location}
                      </span>
                    )}
                    {favorite.profiles.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {favorite.profiles.rating.toFixed(1)} ({favorite.profiles.reviews_count || 0})
                      </span>
                    )}
                    {favorite.profiles.hourly_rate && (
                      <span className="font-semibold text-primary">
                        ₵{favorite.profiles.hourly_rate}/hr
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/services/provider/${favorite.provider_id}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFavorite(favorite.id)}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
