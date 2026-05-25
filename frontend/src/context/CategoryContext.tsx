import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { categoryApi } from '../api/categoryApi';
import type { CategoryResponse } from '../types/product';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  parentCategories: CategoryResponse[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [parentCategories, setParentCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth context to listen for auth changes
  const { token, user } = useAuth();

  const refreshCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Refreshing categories from public API...');
      const categoriesData = await categoryApi.getPublicParentCategories();
      console.log('Categories refreshed:', categoriesData);
      setParentCategories(categoriesData);
    } catch (err: any) {
      console.error('Failed to refresh categories:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading categories from public API...');
        const categoriesData = await categoryApi.getPublicParentCategories();
        
        // Only update state if component is still mounted
        if (isMounted) {
          console.log('Categories loaded:', categoriesData);
          setParentCategories(categoriesData);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load categories:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories';
          setError(errorMessage);
          console.error('Category loading error details:', {
            status: err.response?.status,
            data: err.response?.data,
            message: errorMessage
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  // Re-fetch categories when authentication state changes
  useEffect(() => {
    // Only re-fetch if categories are already loaded (avoid double initial load)
    if (parentCategories.length > 0 && !loading) {
      console.log('Auth state changed, refreshing categories...');
      refreshCategories();
    }
  }, [token, user]); // Re-run when token or user changes

  const value: CategoryContextType = {
    parentCategories,
    loading,
    error,
    refreshCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
