import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PawPrint, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await api.requestPasswordReset(email);
      setToken(response.token);
      setSuccess("Reset token generated. Enter it along with your new password below.");
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request password reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.confirmPasswordReset(token, newPassword);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
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
            <Link to="/login">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[Nunito] mb-3">Reset Your Password</h1>
          <p className="text-muted-foreground">
            {step === "email"
              ? "Enter your email address to receive a password reset token."
              : "Enter your reset token and new password."}
          </p>
        </div>

        <Card className="border-2 border-primary/15">
          <CardHeader>
            <CardTitle>{step === "email" ? "Request Password Reset" : "Confirm New Password"}</CardTitle>
            <CardDescription>
              {step === "email"
                ? "We'll generate a token to reset your password."
                : "Enter the token and your new password to complete the reset."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleRequestReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? "Generating token..." : "Generate Reset Token"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="token">Reset Token</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Your reset token"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Copy the token from the previous step.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStep("email");
                      setToken("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                      setSuccess("");
                    }}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || !token || !newPassword || !confirmPassword}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Go back to login
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;
