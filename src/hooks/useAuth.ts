import { useAppSelector } from '@/store/hooks';

export const useAuth = () => {
  const { user, accessToken, role } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!accessToken;
  
  return {
    user,
    accessToken,
    role,
    isAuthenticated,
  };
};
