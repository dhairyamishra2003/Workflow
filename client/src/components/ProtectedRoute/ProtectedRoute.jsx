import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { token, user, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!token && !isLoading) {
      router.replace('/login');
    } else if (token && !user) {
      fetchUser();
    }
  }, [token, user, isLoading, fetchUser, router]);

  if (!token || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  return children;
}
