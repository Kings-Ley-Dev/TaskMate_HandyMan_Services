import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserAvatar } from "./UserAvatar";
import { Star } from "lucide-react";

interface InterestedProvider {
  id: string;
  provider_id: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    service_type: string | null;
    rating: number | null;
    reviews_count: number | null;
    bio: string | null;
  };
}

interface Props {
  jobId: string;
  currentProviderId?: string | null;
  onProviderSelected: () => void;
}

export function InterestedProvidersList({ jobId, currentProviderId, onProviderSelected }: Props) {
  const [interestedProviders, setInterestedProviders] = useState<InterestedProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterestedProviders();
  }, [jobId]);

  const fetchInterestedProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('job_interests')
        .select('*, profiles(*)')
        .eq('job_id', jobId);

      if (error) throw error;
      setInterestedProviders(data || []);
    } catch (error: any) {
      toast.error("Failed to load interested providers");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = async (providerId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ provider_id: providerId, status: 'in_progress' })
        .eq('id', jobId);

      if (error) throw error;

      toast.success("Provider selected! Job is now in progress.");
      onProviderSelected();
    } catch (error: any) {
      toast.error("Failed to select provider");
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading interested providers...</p>;
  }

  if (interestedProviders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interested Providers</CardTitle>
          <CardDescription>No providers have expressed interest yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interested Providers ({interestedProviders.length})</CardTitle>
        <CardDescription>Select a provider to assign to this job</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {interestedProviders.map((interest) => (
          <div
            key={interest.id}
            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <UserAvatar
              avatarUrl={interest.profiles.avatar_url}
              fullName={interest.profiles.full_name}
              className="h-12 w-12"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{interest.profiles.full_name}</h4>
                {currentProviderId === interest.provider_id && (
                  <Badge variant="secondary">Selected</Badge>
                )}
              </div>
              {interest.profiles.service_type && (
                <p className="text-sm text-muted-foreground mb-1">
                  {interest.profiles.service_type}
                </p>
              )}
              {interest.profiles.rating !== null && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{interest.profiles.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({interest.profiles.reviews_count || 0} reviews)
                  </span>
                </div>
              )}
              {interest.profiles.bio && (
                <p className="text-sm text-muted-foreground mt-2">{interest.profiles.bio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Interested on {new Date(interest.created_at).toLocaleDateString()}
              </p>
            </div>
            {currentProviderId !== interest.provider_id && (
              <Button
                onClick={() => handleSelectProvider(interest.provider_id)}
                size="sm"
              >
                Select Provider
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
