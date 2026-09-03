import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function JobHistory() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobHistory();
  }, []);

  const fetchJobHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const isProvider = roleData?.role === "provider";

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          customer:profiles!jobs_customer_id_fkey(full_name, avatar_url),
          provider:profiles!jobs_provider_id_fkey(full_name, avatar_url)
        `)
        .eq(isProvider ? "provider_id" : "customer_id", user.id)
        .in("status", ["completed", "cancelled"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast.error("Failed to load job history");
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading job history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Job History</h1>
          <p className="text-muted-foreground">View your completed and cancelled jobs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Past Jobs ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No job history yet</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge
                          variant="secondary"
                          className={`${statusColors[job.status]} text-white`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Category: {job.category}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Location: {job.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Completed: {new Date(job.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:text-right">
                      <div className="text-2xl font-bold text-primary mb-2">
                        GH₵{job.budget}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                      >
                        View Details
                      </Button>
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
}
