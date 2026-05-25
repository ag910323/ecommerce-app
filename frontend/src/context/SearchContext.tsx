import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { productApi } from '../api/productApi';
import type { ProductResponse } from '../types';
import { useNotification } from './NotificationContext';

interface SearchContextType {
  searchQuery: string;
  searchedProducts: ProductResponse[];
  searchLoading: boolean;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  handleSearch: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<ProductResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { addNotification } = useNotification();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchedProducts([]);
      return;
    }

    try {
      setSearchLoading(true);
      setIsSearching(true);
      const products = await productApi.searchProducts(searchQuery.trim());
      setSearchedProducts(products);
    } catch (error) {
      console.error('Failed to search products:', error);
      addNotification({
        type: 'error',
        title: 'Search failed',
        message: 'Could not search products. Please try again.'
      });
      setSearchedProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchedProducts([]);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchedProducts,
        searchLoading,
        isSearching,
        setSearchQuery,
        handleSearch,
        handleKeyPress,
        clearSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}