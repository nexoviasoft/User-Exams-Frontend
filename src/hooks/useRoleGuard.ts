import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export const useRoleGuard = (allowedRoles: ('student' | 'teacher' | 'admin')[]) => {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (role && !allowedRoles.includes(role)) {
      // Redirect to their own dashboard if they are in the wrong place
      router.push(`/${role}/dashboard`);
    }
  }, [role, isAuthenticated, allowedRoles, router]);

  return { role, isAuthenticated };
};
