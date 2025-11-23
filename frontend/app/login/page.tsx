'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error response formats
      let errorMessage = 'Login failed. Please check your credentials.';
      
      // Check if it's a network error (no response from server)
      if (!error.response) {
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
        } else if (error.message) {
          errorMessage = `Network error: ${error.message}`;
        } else {
          errorMessage = 'Unable to connect to the server. Please try again later.';
        }
      } else if (error.response?.data) {
        // Try different possible error message fields
        errorMessage = error.response.data.detail || 
                       error.response.data.error || 
                       error.response.data.message ||
                       (typeof error.response.data === 'string' ? error.response.data : errorMessage);
        
        // Handle non_field_errors (common in DRF)
        if (error.response.data.non_field_errors && Array.isArray(error.response.data.non_field_errors)) {
          errorMessage = error.response.data.non_field_errors[0];
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your society dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">House Number / Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your house number / username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

