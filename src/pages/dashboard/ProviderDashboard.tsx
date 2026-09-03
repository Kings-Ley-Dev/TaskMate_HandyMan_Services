import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { DollarSign, Briefcase, Star, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "@/components/UserAvatar";
import { useTheme } from "@/contexts/ThemeContext";
import { PortfolioManager } from "@/components/PortfolioManager";

interface Job {
  id: string;
  title: string;
  customer_id: string;
  category: string;
  description: string;
  budget: number;
  location: string;
  deadline: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface Stats {
  totalEarnings: number;
  activeJobs: number;
  rating: number;
  reviewsCount: number;
}

const ProviderDashboard = () => {
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEarnings: 0, activeJobs: 0, rating: 0, reviewsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("provider");
    fetchDashboardData();
  }, [setTheme]);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Fetch available jobs (pending status) that match provider's service_type
      const { data: pendingJobs, error: pendingError } = await supabase
        .from('jobs')
        .select('*, profiles!jobs_customer_id_fkey(full_name)')
        .eq('status', 'pending')
        .eq('category', profileData?.service_type || '')
        .order('created_at', { ascending: false })
        .limit(10);

      if (pendingError) throw pendingError;

      setAvailableJobs(pendingJobs || []);

      // Fetch provider's jobs (in_progress and completed)
      const { data: myJobs, error: myJobsError } = await supabase
        .from('jobs')
        .select('*, profiles!jobs_customer_id_fkey(full_name)')
        .eq('provider_id', user.id)
        .order('deadline', { ascending: true });

      if (myJobsError) throw myJobsError;

      // Calculate stats
      const inProgress = (myJobs || []).filter(j => j.status === 'in_progress');
      const completed = (myJobs || []).filter(j => j.status === 'completed');
      
      const totalEarnings = completed.reduce((sum, job) => sum + (job.budget || 0), 0);

      setUpcomingJobs(inProgress.slice(0, 5));
      setStats({
        totalEarnings,
        activeJobs: inProgress.length,
        rating: profileData?.rating || 0,
        reviewsCount: profileData?.reviews_count || 0,
      });
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async (jobId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // Check if already interested
      const { data: existing } = await supabase
        .from('job_interests')
        .select('id')
        .eq('job_id', jobId)
        .eq('provider_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.info("You've already expressed interest in this job");
        return;
      }

      const { error } = await supabase
        .from('job_interests')
        .insert({ job_id: jobId, provider_id: user.id });

      if (error) throw error;

      toast.success("Interest expressed! The customer will contact you if selected.", {
        description: "Showing interest doesn't guarantee the job. The customer will review all interested providers and select one.",
        duration: 5000,
      });
      fetchDashboardData();
    } catch (error: any) {
      toast.error("Failed to express interest");
    }
  };

  const handleNotInterested = (jobId: string) => {
    toast.info("Job skipped");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your jobs and earnings</p>
          </div>
          <Link to="/dashboard/profile">
            <Button variant="ghost" size="icon" className="relative">
              {profile ? (
                <UserAvatar avatarUrl={profile.avatar_url} fullName={profile.full_name} />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From completed jobs</p>
            </CardContent>
          </Card>
          
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{stats.reviewsCount} reviews</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{profile?.full_name}</div>
              <p className="text-xs text-muted-foreground">{profile?.service_type || "No service type"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Jobs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Jobs</CardTitle>
            <CardDescription>Your active jobs and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active jobs. Accept jobs from the available list below!</p>
            ) : (
              <div className="space-y-4">
                {upcomingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">Customer: {job.profiles?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">Due: {new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:text-right">
                      <div className="text-2xl font-bold text-primary mb-2">₵{job.budget}</div>
                      <Link to={`/dashboard/provider/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Management */}
        {profile && (
          <div className="mb-8">
            <PortfolioManager providerId={profile.id} />
          </div>
        )}

        {/* Available Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Available Jobs</CardTitle>
            <CardDescription>New job opportunities waiting for you</CardDescription>
          </CardHeader>
          <CardContent>
            {availableJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No available jobs at the moment. Check back later!</p>
            ) : (
              <div className="space-y-4">
                {availableJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge variant="secondary">{job.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>📍 {job.location}</span>
                          <span>👤 {job.profiles?.full_name || "Unknown"}</span>
                          <span>📅 {new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-3">₵{job.budget}</div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleExpressInterest(job.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Interested
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleNotInterested(job.id)}
                          >
                            Not Interested
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboard;
