import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, User, Stethoscope, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { setAuthSession } from "@/lib/auth";
import { api } from "@/lib/api";

type Role = "owner" | "vet" | "admin";

const roleCards: { value: Role; title: string; description: string; icon: typeof User }[] = [
  {
    value: "owner",
    title: "Pet Owner",
    description: "Manage pet profiles, visits, and records.",
    icon: User,
  },
  {
    value: "vet",
    title: "Veterinarian",
    description: "Access appointments and clinical tools.",
    icon: Stethoscope,
  },
  {
    value: "admin",
    title: "Administrator",
    description: "Oversee users, data, and operations.",
    icon: Shield,
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) {
      return;
    }

    setError("");
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const { token, user } = await api.login({ email, password, role });
      setAuthSession(token, user);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-7 w-7 text-primary" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-[Nunito]">PetCare Tracker</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[Nunito] mb-3">Login to PetCare Tracker</h1>
          <p className="text-muted-foreground">Choose your role and continue to your dashboard.</p>
        </div>

        <Card className="border-2 border-primary/15">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>First choose your role, then login with your credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Step 1: Select Role</Label>
                <RadioGroup
                  value={role || undefined}
                  onValueChange={(value) => setRole(value as Role)}
                  className="grid md:grid-cols-3 gap-3"
                >
                  {roleCards.map((item) => {
                    const Icon = item.icon;
                    const selected = role === item.value;

                    return (
                      <Label
                        key={item.value}
                        htmlFor={item.value}
                        className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                          selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem id={item.value} value={item.value} className="mt-1" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{item.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Step 2: Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={!role}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    disabled={!role}
                  />
                </div>
              </div>

              {!role && (
                <p className="text-sm text-muted-foreground">Please select a role to enable login fields.</p>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button type="submit" className="w-full sm:w-auto" disabled={!role || isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  No account?{" "}
                  <Link to={`/signup${role ? `?role=${role}` : ""}`} className="text-primary font-semibold hover:underline">
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LoginPage;
