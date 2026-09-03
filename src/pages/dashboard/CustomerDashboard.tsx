import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Briefcase, Clock, CheckCircle, Plus, User, Users, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "@/components/UserAvatar";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { InterestedProvidersList } from "@/components/InterestedProvidersList";
import { FavoriteProviders } from "@/components/FavoriteProviders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JobStats {
  activeJobs: number;
  pendingJobs: number;
  completedJobs: number;
}

interface RecentJob {
  id: string;
  title: string;
  provider: string | null;
  provider_id: string | null;
  status: string;
  deadline: string;
  budget: number;
  interested_count?: number;
}

const CustomerDashboard = () => {
  const [stats, setStats] = useState<JobStats>({ activeJobs: 0, pendingJobs: 0, completedJobs: 0 });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("customer");
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

      // Fetch job statistics with interested provider counts
      const { data: jobs } = await supabase
        .from("jobs")
        .select("*, profiles!jobs_provider_id_fkey(full_name)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (jobs) {
        const active = jobs.filter(j => j.status === 'in_progress').length;
        const pending = jobs.filter(j => j.status === 'pending').length;
        const completed = jobs.filter(j => j.status === 'completed').length;

        setStats({ activeJobs: active, pendingJobs: pending, completedJobs: completed });

        // Get interested counts for each job
        const jobsWithInterests = await Promise.all(
          jobs.slice(0, 5).map(async (job) => {
            const { count } = await supabase
              .from('job_interests')
              .select('*', { count: 'exact', head: true })
              .eq('job_id', job.id);

            return {
              id: job.id,
              title: job.title,
              provider: job.profiles?.full_name || "Unassigned",
              provider_id: job.provider_id,
              status: job.status,
              deadline: new Date(job.deadline).toLocaleDateString(),
              budget: job.budget,
              interested_count: count || 0,
            };
          })
        );

        setRecentJobs(jobsWithInterests);
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobToDelete);

      if (error) throw error;

      toast.success("Job deleted successfully");
      fetchDashboardData();
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (error: any) {
      toast.error("Failed to delete job");
    }
  };

  const statusColors = {
    "in_progress": "bg-blue-500",
    "pending": "bg-yellow-500",
    "completed": "bg-green-500",
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
            <h1 className="text-4xl font-bold mb-2">Customer Dashboard</h1>
            <p className="text-muted-foreground">Manage your jobs and bookings</p>
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingJobs}</div>
              <p className="text-xs text-muted-foreground">Awaiting provider response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">Total jobs finished</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link to="/services">
              <Button className="bg-secondary hover:bg-secondary-dark">
                <Plus className="h-4 w-4 mr-2" />
                Find Services
              </Button>
            </Link>
            <Link to="/dashboard/customer/post-job">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </Link>
            <Link to="/dashboard/customer/all-jobs">
              <Button variant="outline">View All Jobs</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Favorite Providers */}
        {profile && (
          <div className="mb-8">
            <FavoriteProviders customerId={profile.id} />
          </div>
        )}

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Your latest bookings and requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No jobs yet. Post your first job to get started!</p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge
                          variant="secondary"
                          className={`${statusColors[job.status as keyof typeof statusColors]} text-white`}
                        >
                          {job.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Provider: {job.provider}</p>
                      <p className="text-sm text-muted-foreground">Due: {job.deadline}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:text-right">
                      <div className="text-2xl font-bold text-primary mb-2">₵{job.budget}</div>
                      <div className="flex gap-2">
                        {job.status === 'pending' && job.interested_count && job.interested_count > 0 && (
                          <Button
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setDialogOpen(true);
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            {job.interested_count} Interested
                          </Button>
                        )}
                        <Link to={`/dashboard/customer/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setJobToDelete(job.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interested Providers Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Interested Providers</DialogTitle>
            </DialogHeader>
            {selectedJobId && (
              <InterestedProvidersList
                jobId={selectedJobId}
                currentProviderId={recentJobs.find(j => j.id === selectedJobId)?.provider_id}
                onProviderSelected={() => {
                  setDialogOpen(false);
                  fetchDashboardData();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this job? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CustomerDashboard;
