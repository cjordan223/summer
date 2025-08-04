'use client';

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/nextauth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.73 1.9-3.57 0-6.48-2.9-6.48-6.48s2.9-6.48 6.48-6.48c2.04 0 3.3.83 4.1 1.62l2.5-2.5C18.16 3.68 15.48 2.5 12.48 2.5c-5.48 0-9.98 4.5-9.98 9.98s4.5 9.98 9.98 9.98c5.68 0 9.54-4.06 9.54-9.72 0-.63-.06-1.25-.16-1.84H12.48z"
    />
  </svg>
);

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <Card className="shadow-xl border-2 border-transparent hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardDescription className="text-center text-base">
              Sign in to get AI-powered summaries of your favorite YouTube channels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSignIn}
              className="w-full transition-transform duration-300 hover:scale-105" 
              variant="default" 
              size="lg"
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              We'll monitor your subscriptions and deliver summaries right to your feed.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
