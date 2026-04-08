import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Stethoscope, PawPrint, Calendar, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="text-2xl font-extrabold tracking-tight font-[Nunito]">PetCare</span>
          </div>
          <div className="flex gap-3">
            <Link to="/owner">
              <Button variant="outline" size="sm">Pet Owner</Button>
            </Link>
            <Link to="/vet">
              <Button variant="outline" size="sm">Veterinarian</Button>
            </Link>
            <Link to="/admin">
              <Button size="sm">Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          <Heart className="h-4 w-4" /> Trusted by 500+ Pet Families
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 font-[Nunito]">
          Your Pet's Health,<br />
          <span className="text-primary">Beautifully Managed</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Track appointments, medical records, and pet profiles — all in one place. 
          Built for pet owners, veterinarians, and clinic administrators.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/owner">
            <Button size="lg" className="text-base px-8">Get Started</Button>
          </Link>
          <Link to="/admin">
            <Button size="lg" variant="outline" className="text-base px-8">Admin Portal</Button>
          </Link>
        </div>
      </section>

      {/* Role Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12 font-[Nunito]">Three Portals, One Platform</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Link to="/owner" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <PawPrint className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Pet Owner</CardTitle>
                <CardDescription>Manage your furry family</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Add pets, view appointments, and track medical history. Everything you need as a pet parent.
              </CardContent>
            </Card>
          </Link>

          <Link to="/vet" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Stethoscope className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Veterinarian</CardTitle>
                <CardDescription>Clinical management tools</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Manage appointments, add medical records, and track patient health with professional tools.
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-secondary/80 transition-colors">
                  <Shield className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Administrator</CardTitle>
                <CardDescription>Full system oversight</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Manage users, oversee all pets and appointments, and maintain the entire system from one dashboard.
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-12 font-[Nunito]">Everything You Need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: PawPrint, title: "Pet Profiles", desc: "Complete profiles with breed, age, weight, and notes" },
              { icon: Calendar, title: "Appointments", desc: "Schedule, track, and manage all veterinary visits" },
              { icon: FileText, title: "Medical Records", desc: "Digital health records with diagnosis and treatment history" },
              { icon: Shield, title: "Role-Based Access", desc: "Secure dashboards tailored to each user role" },
              { icon: Heart, title: "Pet Health Tracking", desc: "Monitor your pet's health journey over time" },
              { icon: Stethoscope, title: "Vet Tools", desc: "Professional tools designed for veterinary workflows" },
            ].map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PawPrint className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">PetCare Tracker</span>
        </div>
        <p>© 2026 PetCare Tracker. Caring for pets, one click at a time.</p>
      </footer>
    </div>
  );
};

export default Index;
