import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { brandApi, type BrandResponse } from '../api/brandApi';

interface BrandContextType {
  popularBrands: BrandResponse[];
  allBrands: BrandResponse[];
  loading: boolean;
  error: string | null;
  refreshPopularBrands: () => Promise<void>;
  refreshAllBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

interface BrandProviderProps {
  children: ReactNode;
}

export function BrandProvider({ children }: BrandProviderProps) {
  const [popularBrands, setPopularBrands] = useState<BrandResponse[]>([]);
  const [allBrands, setAllBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPopularBrands = async () => {
    try {
      setError(null);
      console.log('Refreshing popular brands from public API...');
      const brandsData = await brandApi.getPopularBrands();
      console.log('Popular brands refreshed:', brandsData);
      setPopularBrands(brandsData);
    } catch (err: any) {
      console.error('Failed to refresh popular brands:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load popular brands';
      setError(errorMessage);
      
      // Fallback to mock data
      setPopularBrands([
        { id: 1, name: "Apple", description: "Technology & Electronics" },
        { id: 2, name: "Samsung", description: "Mobile & Electronics" },
        { id: 3, name: "Nike", description: "Sports & Lifestyle" },
        { id: 4, name: "Adidas", description: "Sports & Apparel" },
        { id: 5, name: "Sony", description: "Electronics & Gaming" },
        { id: 6, name: "Canon", description: "Cameras & Photography" },
        { id: 7, name: "HP", description: "Computers & Technology" },
        { id: 8, name: "Dell", description: "Laptops & Computers" }
      ]);
    }
  };

  const refreshAllBrands = async () => {
    try {
      setError(null);
      console.log('Refreshing all brands...');
      const brandsData = await brandApi.getAllBrandsSimple();
      console.log('All brands refreshed:', brandsData);
      setAllBrands(brandsData);
    } catch (err: any) {
      console.error('Failed to refresh all brands:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load brands';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch popular brands (public API)
        console.log('Loading popular brands from public API...');
        const popularBrandsData = await brandApi.getPopularBrands();
        
        if (isMounted) {
          console.log('Popular brands loaded:', popularBrandsData);
          setPopularBrands(popularBrandsData);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load popular brands:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Failed to load popular brands';
          setError(errorMessage);
          
          // Fallback to mock data
          setPopularBrands([
            { id: 1, name: "Apple", description: "Technology & Electronics" },
            { id: 2, name: "Samsung", description: "Mobile & Electronics" },
            { id: 3, name: "Nike", description: "Sports & Lifestyle" },
            { id: 4, name: "Adidas", description: "Sports & Apparel" },
            { id: 5, name: "Sony", description: "Electronics & Gaming" },
            { id: 6, name: "Canon", description: "Cameras & Photography" },
            { id: 7, name: "HP", description: "Computers & Technology" },
            { id: 8, name: "Dell", description: "Laptops & Computers" }
          ]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  const value: BrandContextType = {
    popularBrands,
    allBrands,
    loading,
    error,
    refreshPopularBrands,
    refreshAllBrands,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandProvider');
  }
  return context;
}
