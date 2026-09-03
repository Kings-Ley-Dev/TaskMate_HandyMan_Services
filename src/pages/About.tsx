import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Target, TrendingUp, Award, Heart } from "lucide-react";
import aboutImage from "@/assets/about-image.jpg";
import { useCountUp } from "@/hooks/useCountUp";

const About = () => {
  const { count: activeProviders, elementRef: providersRef } = useCountUp({ end: 10000 });
  const { count: jobsCompleted, elementRef: jobsRef } = useCountUp({ end: 50000 });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About TaskMate</h1>
            <p className="text-xl md:text-2xl text-gray-200">
              Connecting skilled professionals with customers who need reliable, quality service
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <img
                src={aboutImage}
                alt="About TaskMate"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At TaskMate, we believe everyone deserves access to reliable, skilled professionals for their home and business needs. Our platform bridges the gap between customers seeking quality service and talented professionals looking for opportunities to grow their business.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We're committed to creating a trusted marketplace where transparency, quality, and customer satisfaction are at the forefront of every interaction.
              </p>
              <p className="text-lg text-muted-foreground">
                Founded in 2024, TaskMate has quickly become the go-to platform for thousands of customers and service providers across the country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">What drives us every day</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-primary">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Trust & Safety</h3>
                <p className="text-muted-foreground">
                  We verify every professional on our platform and use secure payment methods to protect all parties.
                </p>
              </CardContent>
            </Card>

            <Card className="card-primary">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Community First</h3>
                <p className="text-muted-foreground">
                  Building a supportive community where both customers and service providers thrive together.
                </p>
              </CardContent>
            </Card>

            <Card className="card-primary">
              <CardContent className="pt-6">
                <Target className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Quality Service</h3>
                <p className="text-muted-foreground">
                  We're dedicated to ensuring every job meets the highest standards of quality and professionalism.
                </p>
              </CardContent>
            </Card>

            <Card className="card-primary">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Growth Oriented</h3>
                <p className="text-muted-foreground">
                  Empowering service providers to grow their businesses and reach new customers.
                </p>
              </CardContent>
            </Card>

            <Card className="card-primary">
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  Striving for excellence in every aspect of our platform and customer experience.
                </p>
              </CardContent>
            </Card>

            <Card className="card-primary">
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Customer Care</h3>
                <p className="text-muted-foreground">
                  Putting customers first with responsive support and user-friendly features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div ref={providersRef} className="text-center">
              <div className="text-5xl font-bold text-secondary mb-2">
                {activeProviders.toLocaleString()}+
              </div>
              <div className="text-xl text-muted-foreground">Active Providers</div>
            </div>
            <div ref={jobsRef} className="text-center">
              <div className="text-5xl font-bold text-secondary mb-2">
                {jobsCompleted.toLocaleString()}+
              </div>
              <div className="text-xl text-muted-foreground">Jobs Completed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-secondary mb-2">98%</div>
              <div className="text-xl text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-xl text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Growing Team</h2>
            <p className="text-xl text-gray-200 mb-8">
              We're always looking for talented individuals who share our passion for connecting people and creating exceptional experiences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
