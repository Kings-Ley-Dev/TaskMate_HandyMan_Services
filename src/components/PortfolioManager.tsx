import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PortfolioUpload } from "@/components/PortfolioUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PortfolioManagerProps {
  providerId: string;
}

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  project_url: string | null;
  created_at: string;
}

export const PortfolioManager = ({ providerId }: PortfolioManagerProps) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, [providerId]);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error: any) {
      toast.error("Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPortfolio) return;

    try {
      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", selectedPortfolio);

      if (error) throw error;

      toast.success("Portfolio item deleted");
      fetchPortfolios();
      setDeleteDialogOpen(false);
      setSelectedPortfolio(null);
    } catch (error: any) {
      toast.error("Failed to delete portfolio item");
    }
  };

  if (loading) {
    return <div>Loading portfolios...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Showcase your best work</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Item</DialogTitle>
              </DialogHeader>
              <PortfolioUpload
                providerId={providerId}
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchPortfolios();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {portfolios.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No portfolio items yet. Add your first project to showcase your work!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {portfolios.map((portfolio) => (
              <Card key={portfolio.id} className="overflow-hidden">
                <img
                  src={portfolio.image_url}
                  alt={portfolio.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{portfolio.title}</h3>
                  {portfolio.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {portfolio.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {portfolio.project_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={portfolio.project_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Project
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedPortfolio(portfolio.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this portfolio item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
