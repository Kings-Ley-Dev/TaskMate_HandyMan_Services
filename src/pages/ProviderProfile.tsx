import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Calendar, CheckCircle2, MessageSquare, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [providerReviews, setProviderReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchProviderData();
    fetchPortfolio();
    fetchReviews();
  }, [id]);

  const fetchProviderData = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setProvider(profileData);
    } catch (error: any) {
      toast.error("Failed to load provider profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("provider_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
        `)
        .eq("reviewee_id", id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setProviderReviews(data || []);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleBookNow = () => {
    toast.success("Booking request sent! The provider will contact you shortly.");
  };

  const handleMessage = () => {
    if (!provider) return;
    navigate("/dashboard/messages", { state: { providerId: id, providerName: provider.full_name } });
  };

  const handleBackToServices = () => {
    navigate("/services");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading provider profile...</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Provider not found</p>
          <Button onClick={handleBackToServices}>Back to Services</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={handleBackToServices}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>

        {/* Header Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Avatar className="w-32 h-32">
                <AvatarImage src={provider.avatar_url} alt={provider.full_name} />
                <AvatarFallback>{provider.full_name?.[0] || "P"}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{provider.full_name}</h1>
                    <Badge variant="secondary" className="text-lg px-4 py-1 mb-2">
                      {provider.service_type || "Service Provider"}
                    </Badge>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {provider.location || "Location not specified"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{provider.rating || 0}</span>
                        <span>({provider.reviews_count || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ₵{provider.hourly_rate || 0}/hr
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="bg-secondary hover:bg-secondary-dark"
                        onClick={handleBookNow}
                      >
                        Book Now
                      </Button>
                      <Button variant="outline" onClick={handleMessage}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{provider.bio || "No bio available"}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="font-semibold">Provider</div>
                      <div className="text-sm text-muted-foreground">Experience</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="font-semibold">{provider.reviews_count || 0}+</div>
                      <div className="text-sm text-muted-foreground">Reviews</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="font-semibold">Fast</div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="font-semibold">{provider.approved ? "Verified" : "Pending"}</div>
                      <div className="text-sm text-muted-foreground">Status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioItems.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                          )}
                          {item.project_url && (
                            <a
                              href={item.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary flex items-center gap-1 hover:underline"
                            >
                              View Project <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No portfolio items yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews ({provider.reviews_count || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {providerReviews.length > 0 ? (
                  providerReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback>
                              {review.reviewer?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{review.reviewer?.full_name}</div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && <p className="text-muted-foreground ml-13">{review.comment}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityCalendar providerId={id!} editable={false} />
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {provider.skills && provider.skills.length > 0 ? (
                    provider.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="px-4 py-2 text-base">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No skills listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderProfile;
