import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';

export function useAuth() {
  const { user, isLoading, error } = useSelector((state: RootState) => state.data.user);
  
  // Check roles based on user data from Redux
  const isAdmin = !!user && (user.role === 'admin' || user.role === 'superadmin');
  const isSuperAdmin = !!user && user.role === 'superadmin';
  
  return { 
    user, 
    isLoading, 
    error,
    isAdmin, 
    isSuperAdmin 
  };
}