import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, DollarSign, User, MessageSquare, Star, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { ReviewForm } from "@/components/ReviewForm";

const CustomerJobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoursWorked, setHoursWorked] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
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
          provider:profiles!jobs_provider_id_fkey(id, full_name, email, phone, rating, avatar_url, service_type)
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
        navigate('/dashboard/customer');
        return;
      }

      setJob(jobData);
      if (jobData.hours_worked) {
        setHoursWorked(jobData.hours_worked.toString());
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

  const handleConfirmCompletion = async () => {
    if (!hoursWorked || parseFloat(hoursWorked) <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid hours worked",
        variant: "destructive",
      });
      return;
    }

    setConfirming(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          customer_confirmed: true,
          hours_worked: parseFloat(hoursWorked),
          status: job.provider_confirmed ? "completed" : "in-progress",
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hours confirmed successfully",
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

  const calculateTotal = () => {
    const hours = parseFloat(hoursWorked) || 0;
    const rate = job?.provider?.hourly_rate || 0;
    return (hours * rate).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) return null;

  const statusColors = {
    "in-progress": "bg-blue-500",
    pending: "bg-yellow-500",
    completed: "bg-green-500",
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/customer")}
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
                    Posted on {new Date(job.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={`${statusColors[job.status as keyof typeof statusColors]} text-white`}
                >
                  {job.status.replace("-", " ")}
                </Badge>
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
                  <span>Category: {job.category}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-2xl font-bold text-primary">GH₵{job.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
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

          {/* Provider Info */}
          {job.provider && (
            <Card>
              <CardHeader>
                <CardTitle>Service Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {job.provider.avatar_url ? (
                        <img src={job.provider.avatar_url} alt={job.provider.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{job.provider.full_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{job.provider.email}</p>
                      {job.provider.phone && (
                        <p className="text-sm text-muted-foreground mb-2">Phone: {job.provider.phone}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{job.provider.rating || 'N/A'}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{job.provider.service_type || job.category}</Badge>
                    </div>
                  </div>
                  <Button 
                    className="bg-secondary hover:bg-secondary-dark"
                    onClick={() => navigate(`/dashboard/messages?recipient_id=${job.provider.id}&recipient=${job.provider.full_name}&job_id=${job.id}&return=/dashboard/customer/jobs/${id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!job.provider && job.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Service Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No provider assigned yet. Waiting for interested providers.</p>
              </CardContent>
            </Card>
          )}

          {/* Hours Validation & Payment */}
          {job.status === "in-progress" && job.provider && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Hours & Payment</CardTitle>
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
                    disabled={job.customer_confirmed}
                  />
                </div>
                {hoursWorked && job.provider?.hourly_rate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Hours:</span>
                      <span className="font-semibold">{hoursWorked}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Hourly Rate:</span>
                      <span className="font-semibold">GH₵{job.provider.hourly_rate}/hr</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Total Amount:</span>
                      <span className="font-bold text-primary text-xl">GH₵{calculateTotal()}</span>
                    </div>
                  </div>
                )}
                {!job.customer_confirmed && (
                  <Button onClick={handleConfirmCompletion} disabled={confirming} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {confirming ? "Confirming..." : "Confirm Hours & Mark Complete"}
                  </Button>
                )}
                {job.customer_confirmed && (
                  <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg">
                    ✓ Hours confirmed. Waiting for provider confirmation.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {job.status === "completed" && job.provider && (
                <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-secondary hover:bg-secondary-dark">
                      Leave a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Review {job.provider.full_name}</DialogTitle>
                    </DialogHeader>
                    <ReviewForm
                      jobId={job.id}
                      revieweeId={job.provider.id}
                      onSuccess={() => {
                        setShowReviewDialog(false);
                        toast({
                          title: "Review submitted",
                          description: "Thank you for your feedback!",
                        });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
              {job.status === "pending" && (
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from("jobs")
                        .delete()
                        .eq("id", id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Job cancelled",
                        description: "The job has been cancelled.",
                      });
                      navigate("/dashboard/customer");
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Cancel Job
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Support contacted",
                    description: "Our support team will reach out to you shortly.",
                  });
                }}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerJobDetails;
