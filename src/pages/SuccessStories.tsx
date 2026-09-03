import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SuccessStories = () => {
  const stories = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Homeowner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      rating: 5,
      story: "I needed urgent plumbing work done and found the perfect provider through TaskMate. The service was professional, quick, and reasonably priced. Highly recommend!",
      service: "Plumbing Repair"
    },
    {
      id: 2,
      name: "Mike Anderson",
      role: "Service Provider",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      rating: 5,
      story: "As a carpenter, TaskMate has helped me grow my business significantly. I've connected with dozens of customers and built a strong reputation. The platform is easy to use and the payment system is reliable.",
      service: "Carpentry Services"
    },
    {
      id: 3,
      name: "Emily Chen",
      role: "Property Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      rating: 5,
      story: "Managing multiple properties means I need reliable service providers. TaskMate has become my go-to platform for finding electricians, painters, and handymen. The quality of work has been consistently excellent.",
      service: "Multiple Services"
    },
    {
      id: 4,
      name: "David Martinez",
      role: "Service Provider",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      rating: 5,
      story: "Switching to TaskMate was the best decision for my electrical business. The steady stream of customers and transparent review system has helped me establish trust and grow my client base.",
      service: "Electrical Work"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "Homeowner",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
      rating: 5,
      story: "I was skeptical about hiring someone online, but TaskMate's verification system gave me confidence. The painter I hired did an amazing job on my home. Will definitely use again!",
      service: "Painting Services"
    },
    {
      id: 6,
      name: "Robert Kim",
      role: "Service Provider",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      rating: 5,
      story: "TaskMate has transformed how I run my plumbing business. The platform handles scheduling, payments, and customer communication seamlessly. I can focus on what I do best - providing quality service.",
      service: "Plumbing Services"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-gray-200">
              Real experiences from our community of customers and service providers
            </p>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-secondary mb-4" />
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{story.story}"</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{story.name}</h3>
                      <p className="text-sm text-muted-foreground">{story.role}</p>
                      <p className="text-sm text-secondary">{story.service}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Success Story?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and providers on TaskMate
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register?role=customer"
              className="bg-white text-secondary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Find Services
            </a>
            <a
              href="/auth/register?role=provider"
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Become a Provider
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessStories;
