import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { setRefreshToken } from '@/services/token';
import { refreshAccessToken } from '@/services/apiClient';
import { authSync } from '@/services/authSync';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_authentication/google-callback')({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get query parameters from URL
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const email = params.get('email');
        const username = params.get('username');

        if (!accessToken || !refreshToken) {
          throw new Error('Missing authentication data');
        }

        // Store tokens using existing auth pattern
        const store = useAuthStore.getState();
        
        // Store refresh token
        setRefreshToken(refreshToken);
        
        // Store access token
        store.setAccessToken(accessToken);
        
        // Schedule silent refresh before token expires
        store.scheduleTokenRefresh(async () => {
          await refreshAccessToken();
        });
        
        // Broadcast login to other tabs
        authSync.broadcastLogin(accessToken);

        toast({
          title: 'Success',
          description: `Successfully signed in with Google! Welcome ${username || email}`,
        });

        // Redirect to home
        navigate({ to: '/' });
      } catch (error) {
        console.error('Google callback error:', error);
        toast({
          title: 'Error',
          description: 'Failed to sign in with Google. Please try again.',
          variant: 'destructive',
        });
        navigate({ to: '/log-in' });
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Completing Google Sign-In...</p>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}
