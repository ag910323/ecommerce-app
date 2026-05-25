import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import type { WishlistResponse, WishlistItemResponse, WishlistCreateRequest } from '../api/wishlistApi';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface WishlistContextType {
  wishlists: WishlistResponse[];
  currentWishlist: WishlistResponse | null;
  wishlistItems: WishlistItemResponse[];
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number, wishlistId?: number) => Promise<void>;
  removeFromWishlist: (productId: number, wishlistId?: number) => Promise<void>;
  toggleWishlist: (productId: number, wishlistId?: number) => Promise<void>;
  createWishlist: (name: string, description?: string) => Promise<WishlistResponse>;
  setCurrentWishlist: (wishlist: WishlistResponse) => Promise<void>;
  refreshWishlists: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [wishlists, setWishlists] = useState<WishlistResponse[]>([]);
  const [currentWishlist, setCurrentWishlistState] = useState<WishlistResponse | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const createWishlist = async (name: string, description?: string): Promise<WishlistResponse> => {
    if (!user) {
      throw new Error('User must be logged in to create wishlist');
    }

    try {
      const request: WishlistCreateRequest = {
        userId: user.id,
        name,
        description
      };
      
      const newWishlist = await wishlistApi.createWishlist(request);
      setWishlists(prev => [...prev, newWishlist]);
      setCurrentWishlistState(newWishlist);
      setWishlistItems(newWishlist.items || []);
      
      addNotification({
        type: 'success',
        title: 'Wishlist created successfully'
      });
      
      return newWishlist;
    } catch (error) {
      console.error('Failed to create wishlist:', error);
      addNotification({
        type: 'error',
        title: 'Failed to create wishlist'
      });
      throw error;
    }
  };

  const loadWishlistItems = async (wishlistId?: number) => {
    if (!user) return [];
    const items = await wishlistApi.getWishlistItems({ userId: user.id, wishlistId });
    return items;
  };

  const refreshWishlists = async () => {
    if (!user) {
      setWishlists([]);
      setCurrentWishlistState(null);
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const userWishlists = await wishlistApi.getUserWishlists(user.id);
      setWishlists(userWishlists);

      const selectedWishlist = userWishlists.find(w => w.isDefault) || userWishlists[0] || null;
      setCurrentWishlistState(selectedWishlist);

      const items = await loadWishlistItems(selectedWishlist?.wishlistId);
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to fetch wishlists:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load wishlists'
      });
    } finally {
      setLoading(false);
    }
  };


  const addToWishlist = async (productId: number, wishlistId?: number) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Please login to add items to wishlist'
      });
      return;
    }
    try {
      const updatedWishlist = await wishlistApi.addToWishlist(user.id, productId, wishlistId);
      setWishlists(prev =>
        prev.map(w => w.wishlistId === updatedWishlist.wishlistId ? updatedWishlist : w)
      );
      if (currentWishlist?.wishlistId === updatedWishlist.wishlistId) {
        setCurrentWishlistState(updatedWishlist);
        setWishlistItems(updatedWishlist.items);
      }
      addNotification({
        type: 'success',
        title: 'Added to wishlist'
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      addNotification({
        type: 'error',
        title: 'Failed to add to wishlist'
      });
    }
  };

  const removeFromWishlist = async (productId: number, wishlistId?: number) => {
    if (!user) return;

    const targetWishlistId = wishlistId || currentWishlist?.wishlistId;
    if (!targetWishlistId) return;

    try {
      const updatedWishlist = await wishlistApi.removeFromWishlist(targetWishlistId, productId);
      setWishlists(prev => 
        prev.map(w => w.wishlistId === targetWishlistId ? updatedWishlist : w)
      );
      if (currentWishlist?.wishlistId === targetWishlistId) {
        setCurrentWishlistState(updatedWishlist);
        setWishlistItems(updatedWishlist.items);
      }
      addNotification({
        type: 'success',
        title: 'Removed from wishlist'
      });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      addNotification({
        type: 'error',
        title: 'Failed to remove from wishlist'
      });
    }
  };

  const toggleWishlist = async (productId: number, wishlistId?: number) => {
    const targetWishlistId = wishlistId || currentWishlist?.wishlistId;
    if (!targetWishlistId) return;

    if (isInWishlist(productId)) {
      await removeFromWishlist(productId, targetWishlistId);
    } else {
      await addToWishlist(productId, targetWishlistId);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.some((item: WishlistItemResponse) => item.productId === productId);
  };

  const setCurrentWishlist = async (wishlist: WishlistResponse) => {
    setCurrentWishlistState(wishlist);
    setLoading(true);

    try {
      const items = await loadWishlistItems(wishlist.wishlistId);
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load selected wishlist items:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load wishlist items'
      });
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load wishlists when user changes
  useEffect(() => {
    if (user) {
      refreshWishlists();
    }
  }, [user?.id]); // Only depend on user ID to prevent infinite loops

  return (
    <WishlistContext.Provider
      value={{
        wishlists,
        currentWishlist,
        wishlistItems,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        createWishlist,
        setCurrentWishlist,
        refreshWishlists
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
