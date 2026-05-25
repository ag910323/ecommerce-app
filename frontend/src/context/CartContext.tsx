import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import type { CartResponse } from '../api/cartApi';

interface CartContextType {
  cart: CartResponse | null;
  cartItemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: number, quantity: number) => Promise<boolean>;
  updateQuantity: (variantId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (variantId: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const cartItemCount = cart?.items?.length || 0; // Count of unique products, not total quantity

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const cartData = await cartApi.getCart(user.id);
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = useCallback(async (variantId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedCart = await cartApi.addToCart({
        userId: user.id,
        variantId,
        quantity
      });
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }, [user]);

  const updateQuantity = useCallback(async (variantId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedCart = await cartApi.updateQuantity(user.id, variantId, quantity);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  }, [user]);

  const removeFromCart = useCallback(async (variantId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedCart = await cartApi.removeFromCart(user.id, variantId);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }, [user]);

  // Load cart when user changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{
      cart,
      cartItemCount,
      loading,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
