import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Video, Download, ExternalLink, BookOpen, Wrench } from "lucide-react";

const Resources = () => {
  const guides = [
    {
      id: 1,
      title: "Homeowner's Maintenance Guide",
      description: "Complete guide to maintaining your home throughout the year",
      type: "PDF",
      size: "2.5 MB",
      icon: FileText,
    },
    {
      id: 2,
      title: "DIY Safety Checklist",
      description: "Essential safety tips before starting any DIY project",
      type: "PDF",
      size: "1.2 MB",
      icon: FileText,
    },
    {
      id: 3,
      title: "Cost Estimation Template",
      description: "Spreadsheet template for estimating project costs",
      type: "Excel",
      size: "850 KB",
      icon: Download,
    },
  ];

  const videos = [
    {
      id: 1,
      title: "How to Use TaskMate Platform",
      description: "Complete walkthrough of finding and booking service providers",
      duration: "8:30",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
    },
    {
      id: 2,
      title: "Understanding Service Quotes",
      description: "Learn how to evaluate and compare service provider quotes",
      duration: "6:15",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    },
    {
      id: 3,
      title: "Preparing for a Service Visit",
      description: "Tips to ensure smooth communication with your service provider",
      duration: "5:45",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600",
    },
  ];

  const tools = [
    {
      id: 1,
      title: "Cost Calculator",
      description: "Estimate the cost of common home services",
      icon: Wrench,
    },
    {
      id: 2,
      title: "Project Planner",
      description: "Plan and organize your home improvement projects",
      icon: BookOpen,
    },
    {
      id: 3,
      title: "Contractor Comparison",
      description: "Compare quotes and reviews side by side",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Resources & Tools</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Everything you need to plan, budget, and execute your home projects successfully
          </p>
        </div>
      </section>

      {/* Downloadable Guides */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Downloadable Guides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Card key={guide.id} className="hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-secondary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-secondary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{guide.size}</span>
                    </div>
                    <CardTitle className="text-xl mb-2">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download {guide.type}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Video Tutorials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="hover-lift overflow-hidden">
                <div className="relative aspect-video overflow-hidden group">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-4">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{video.title}</CardTitle>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Video className="mr-2 h-4 w-4" />
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Interactive Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="hover-lift">
                  <CardHeader>
                    <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-secondary hover:bg-secondary-dark">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Launch Tool
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Find trusted professionals to bring your vision to life
          </p>
          <Link to="/services">
            <Button size="lg" variant="secondary">
              Find Service Providers
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Resources;
