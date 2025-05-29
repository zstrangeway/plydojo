'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@plydojo/plydojo-ui/components/button';
import { Input } from '@plydojo/plydojo-ui/components/input';
import { Label } from '@plydojo/plydojo-ui/components/label';
import {
  Form,
  FormField,
  FormMessage,
} from '@plydojo/plydojo-ui/components/form';
import { Alert, AlertDescription } from '@plydojo/plydojo-ui/components/alert';
import { useAuth } from '../../contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, requestPasswordReset, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        router.push('/');
      } else {
        setGeneralError(result.message || 'Login failed');
        // Clear password field on failed login per screensList.md
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setForgotPasswordMessage('');

    try {
      const result = await requestPasswordReset(forgotPasswordEmail);

      if (result.success) {
        setForgotPasswordMessage(
          'Password reset instructions have been sent to your email.'
        );
      } else {
        setForgotPasswordMessage(
          result.message || 'Failed to send reset email'
        );
      }
    } catch (error) {
      setForgotPasswordMessage(
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">PlyDojo</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <Alert variant="destructive">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        {!showForgotPassword ? (
          <Form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
              <FormMessage>{errors.email}</FormMessage>
            </FormField>

            <FormField>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              <FormMessage>{errors.password}</FormMessage>
            </FormField>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isSubmitting}
              >
                Forgot your password?
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create an account
                </Link>
              </span>
            </div>
          </Form>
        ) : (
          /* Forgot Password Form */
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Reset your password
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>
            </div>

            {forgotPasswordMessage && (
              <Alert
                variant={
                  forgotPasswordMessage.includes('sent')
                    ? 'success'
                    : 'destructive'
                }
              >
                <AlertDescription>{forgotPasswordMessage}</AlertDescription>
              </Alert>
            )}

            <Form onSubmit={handleForgotPassword}>
              <FormField>
                <Label htmlFor="forgot-email">Email address</Label>
                <Input
                  id="forgot-email"
                  name="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </FormField>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send reset instructions'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage('');
                  }}
                  disabled={isSubmitting}
                >
                  Back to login
                </Button>
              </div>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
