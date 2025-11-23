'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authAPI, societyAPI } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    flat_number: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    phone: '',
    role: 'RESIDENT',
    society: '',
  });
  const [societies, setSocieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch societies
    setLoadingSocieties(true);
    societyAPI.getSocieties()
      .then(response => {
        const societiesData = response.data.results || response.data || [];
        setSocieties(societiesData);
        if (societiesData.length === 0) {
          toast({
            title: 'Warning',
            description: 'No societies available. Please contact an administrator.',
            variant: 'destructive',
          });
        }
      })
      .catch(error => {
        console.error('Error fetching societies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load societies. Please refresh the page.',
          variant: 'destructive',
        });
      })
      .finally(() => setLoadingSocieties(false));
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validation
    if (formData.password !== formData.password_confirm) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.society) {
      toast({
        title: 'Error',
        description: 'Please select a society',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Clean flat number: remove spaces and special characters, convert to lowercase
      const cleanUsername = formData.flat_number.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      if (!cleanUsername) {
        toast({
          title: 'Error',
          description: 'Please enter a valid flat number',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Prepare data for API (password_confirm will be validated on backend)
      // Only include optional fields if they have values
      // Note: role is set to RESIDENT by backend, so we don't need to send it
      const registrationData: any = {
        flat_number: formData.flat_number,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        society: formData.society,
      };
      
      // Add optional fields only if they have values
      if (formData.email && formData.email.trim()) {
        registrationData.email = formData.email.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        registrationData.phone = formData.phone.trim();
      }

      await authAPI.register(registrationData);
      
      toast({
        title: 'Success',
        description: 'Account created successfully! Redirecting...',
      });

      // Auto-login after registration using cleaned username
      const response = await authAPI.login({ 
        username: cleanUsername, 
        password: formData.password 
      });
      
      const { access, refresh, user } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response data:', error.response?.data);
      
      // Handle different error response formats
      let errorMessage = 'Registration failed. Please try again.';
      
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
        const errorData = error.response.data;
        console.log('Error data:', JSON.stringify(errorData, null, 2));
        
        // Handle field-specific errors (check all fields)
        const fieldErrors = ['flat_number', 'username', 'email', 'password', 'password_confirm', 'first_name', 'society', 'phone'];
        for (const field of fieldErrors) {
          if (errorData[field] && Array.isArray(errorData[field]) && errorData[field].length > 0) {
            let fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            // Replace "Username" with "House Number / Username" for user-facing messages
            if (fieldLabel === 'Username') {
              fieldLabel = 'House Number / Username';
            }
            errorMessage = `${fieldLabel}: ${errorData[field][0]}`;
            break;
          }
        }
        
        // If no field-specific error found, check other error formats
        if (errorMessage === 'Registration failed. Please try again.') {
          if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            // Show the full error data for debugging
            errorMessage = `Registration failed: ${JSON.stringify(errorData)}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join your society management system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name (Owner)</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Enter owner's first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flat_number">Flat Number</Label>
              <Input
                id="flat_number"
                name="flat_number"
                value={formData.flat_number}
                onChange={handleChange}
                required
                placeholder="e.g., A404 or A-404"
              />
              <p className="text-xs text-muted-foreground">
                Enter your flat number (e.g., A404, A-404, B101)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="society">Society <span className="text-red-500">*</span></Label>
              <select
                id="society"
                name="society"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.society}
                onChange={handleChange}
                required
                disabled={loadingSocieties}
              >
                <option value="">
                  {loadingSocieties ? 'Loading societies...' : 'Select Society'}
                </option>
                {societies.map((society) => (
                  <option key={society.id} value={society.id}>
                    {society.name}
                  </option>
                ))}
              </select>
              {loadingSocieties && (
                <p className="text-xs text-muted-foreground">Loading available societies...</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                />
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirm Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                />
                {formData.password_confirm && formData.password !== formData.password_confirm && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || loadingSocieties || societies.length === 0}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            {societies.length === 0 && !loadingSocieties && (
              <p className="text-sm text-center text-red-500">
                No societies available. Please contact an administrator.
              </p>
            )}
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

