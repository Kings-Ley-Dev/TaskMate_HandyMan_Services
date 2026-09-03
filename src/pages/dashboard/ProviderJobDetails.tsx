import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, DollarSign, User, MessageSquare, Phone, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const ProviderJobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoursWorked, setHoursWorked] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:profiles!jobs_customer_id_fkey(id, full_name, email, phone, avatar_url, location)
        `)
        .eq('id', id)
        .maybeSingle();

      if (jobError) throw jobError;
      if (!jobData) {
        toast({
          title: "Error",
          description: "Job not found",
          variant: "destructive",
        });
        navigate('/dashboard/provider');
        return;
      }

      setJob(jobData);
      if (jobData.hours_worked) {
        setHoursWorked(jobData.hours_worked.toString());
      }
      if (jobData.completion_notes) {
        setCompletionNotes(jobData.completion_notes);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!hoursWorked || parseFloat(hoursWorked) <= 0) {
      toast({
        title: "Error",
        description: "Please enter hours worked",
        variant: "destructive",
      });
      return;
    }

    setConfirming(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("jobs")
        .update({
          provider_confirmed: true,
          hours_worked: parseFloat(hoursWorked),
          completion_notes: completionNotes || null,
          completed_by: user?.id,
          status: job.customer_confirmed ? "completed" : "in-progress",
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job completion submitted",
      });

      fetchJobDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/provider")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="text-base">
                    Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </CardDescription>
                </div>
                <Badge className="bg-secondary text-white">{job.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-primary">GH₵{job.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="outline">{job.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          {/* Customer Info */}
          {job.customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {job.customer.avatar_url ? (
                        <img src={job.customer.avatar_url} alt={job.customer.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-3">{job.customer.full_name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{job.customer.email}</span>
                        </div>
                        {job.customer.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{job.customer.phone}</span>
                          </div>
                        )}
                        {job.customer.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{job.customer.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      className="bg-secondary hover:bg-secondary-dark"
                      onClick={() => navigate(`/dashboard/messages?recipient_id=${job.customer.id}&recipient=${job.customer.full_name}&job_id=${job.id}&return=/dashboard/provider/jobs/${id}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mark Job Complete */}
          {job.status === "in-progress" && (
            <Card>
              <CardHeader>
                <CardTitle>Mark Job as Complete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hours">Hours Worked</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    placeholder="Enter hours worked"
                    disabled={job.provider_confirmed}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Completion Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Add any notes about the completed work..."
                    rows={3}
                    disabled={job.provider_confirmed}
                  />
                </div>
                {!job.provider_confirmed && (
                  <Button onClick={handleMarkComplete} disabled={confirming} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {confirming ? "Submitting..." : "Submit Completion"}
                  </Button>
                )}
                {job.provider_confirmed && (
                  <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg">
                    ✓ Completion submitted. Waiting for customer confirmation.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Job Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {job.status === "pending" && (
                <Button 
                  className="bg-secondary hover:bg-secondary-dark"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from("jobs")
                        .update({ status: "in-progress" })
                        .eq("id", id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Job started",
                        description: "The job has been marked as started.",
                      });
                      fetchJobDetails();
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Mark as Started
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Issue reported",
                    description: "Your issue has been reported to support.",
                  });
                }}
              >
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderJobDetails;
