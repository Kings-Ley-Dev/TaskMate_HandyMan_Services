import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, Clock, Shield, Star, Wrench, Zap, Hammer, Paintbrush, Wind, Flower, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import plumbingIcon from "@/assets/service-plumbing.jpg";
import electricalIcon from "@/assets/service-electrical.jpg";
import carpentryIcon from "@/assets/service-carpentry.jpg";
import paintingIcon from "@/assets/service-painting.jpg";
import hvacIcon from "@/assets/service-hvac.jpg";
import landscapingIcon from "@/assets/service-landscaping.jpg";
import cleaningIcon from "@/assets/service-cleaning.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [searchService, setSearchService] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = () => {
    navigate(`/services?service=${encodeURIComponent(searchService)}&location=${encodeURIComponent(searchLocation)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-24 md:py-32 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(17, 25, 83, 0.95), rgba(17, 25, 83, 0.85)), url(${heroImage})`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white animate-fade-in">
            <h1 className="hero-title mb-6">
              Find Trusted <span className="text-gradient-accent">Handyman Services</span> Near You
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-200">
              Connect with skilled professionals for all your home repair and improvement needs
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3">
              <Input
                placeholder="What service do you need?"
                className="flex-1 border-0 text-lg h-14 text-foreground placeholder:text-muted-foreground"
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Input
                placeholder="Enter your location"
                className="flex-1 border-0 text-lg h-14 text-foreground placeholder:text-muted-foreground"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                className="bg-secondary hover:bg-secondary-dark h-14 px-8 text-lg font-semibold"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Shield className="h-5 w-5 text-secondary" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Star className="h-5 w-5 text-secondary" />
                <span>Rated Services</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Popular Services</h2>
            <p className="text-xl text-muted-foreground">Browse our most requested categories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-primary group cursor-pointer">
              <CardHeader>
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={plumbingIcon}
                    alt="Plumbing"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-secondary" />
                  Plumbing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Expert plumbers for repairs, installations, and maintenance
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-primary group cursor-pointer">
              <CardHeader>
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={electricalIcon}
                    alt="Electrical"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-secondary" />
                  Electrical
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Licensed electricians for all your electrical needs
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-primary group cursor-pointer">
              <CardHeader>
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={carpentryIcon}
                    alt="Carpentry"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="h-6 w-6 text-secondary" />
                  Carpentry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Skilled carpenters for furniture and woodwork projects
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-primary group cursor-pointer">
              <CardHeader>
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={paintingIcon}
                    alt="Painting"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-6 w-6 text-secondary" />
                  Painting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professional painters for interior and exterior work
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-primary group cursor-pointer">
              <CardHeader>
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={hvacIcon}
                    alt="HVAC"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="h-6 w-6 text-secondary" />
                  HVAC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Heating, ventilation, and air conditioning specialists
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-primary group cursor-pointer">
              <CardHeader>
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={landscapingIcon}
                    alt="Landscaping"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Flower className="h-6 w-6 text-secondary" />
                  Landscaping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Transform your outdoor spaces with professional landscapers
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-primary group cursor-pointer">
              <CardHeader>
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={cleaningIcon}
                    alt="Cleaning"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-secondary" />
                  Cleaning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professional cleaning services for homes and offices
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" className="bg-secondary hover:bg-secondary-dark text-white">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get your task done in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="bg-secondary hover-glow text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Post Your Task</h3>
              <p className="text-muted-foreground">
                Describe what you need done and set your budget
              </p>
            </div>

            <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="bg-secondary hover-glow text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Choose Your Pro</h3>
              <p className="text-muted-foreground">
                Review bids and select the best professional for your job
              </p>
            </div>

            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="bg-secondary hover-glow text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Get It Done</h3>
              <p className="text-muted-foreground">
                Pay securely when the job is completed to your satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose TaskMate?</h2>
            <p className="text-xl text-gray-200">The trusted platform for quality service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Verified Professionals</h3>
              <p className="text-gray-300">All service providers are background-checked and verified</p>
            </div>

            <div className="text-center">
              <Shield className="h-16 w-16 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-gray-300">Your payment is protected until the job is complete</p>
            </div>

            <div className="text-center">
              <Clock className="h-16 w-16 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Quick Response</h3>
              <p className="text-gray-300">Get responses from multiple pros within hours</p>
            </div>

            <div className="text-center">
              <Star className="h-16 w-16 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-300">Read reviews and ratings from real customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and service providers on TaskMate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register?role=customer">
                <Button size="lg" className="bg-secondary hover:bg-secondary-dark text-white">
                  Post a Task
                </Button>
              </Link>
              <Link to="/auth/register?role=provider">
                <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100">
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
