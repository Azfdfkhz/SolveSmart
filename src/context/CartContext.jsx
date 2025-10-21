// context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          // Validate and clean cart items
          const cleanedCart = parsedCart.map(item => ({
            id: item.id || '',
            title: item.title || 'Unknown Product',
            subtitle: item.subtitle || '',
            price: Number(item.price) || 0,
            image: item.image || '',
            quantity: Number(item.quantity) || 1,
            category: item.category || 'uncategorized',
            // Add default values for missing fields
            description: item.description || '',
            slug: item.slug || ''
          }));
          setCartItems(cleanedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoading]);

  const addToCart = (product) => {
    if (!product || !product.id) {
      console.error('Invalid product:', product);
      return;
    }

    // Ensure product has all required fields with defaults
    const safeProduct = {
      id: product.id,
      title: product.title || 'Unknown Product',
      subtitle: product.subtitle || '',
      price: Number(product.price) || 0,
      image: product.image || '',
      quantity: 1,
      category: product.category || 'uncategorized',
      description: product.description || '',
      slug: product.slug || ''
    };

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === safeProduct.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === safeProduct.id
            ? { 
                ...item, 
                quantity: item.quantity + 1
              }
            : item
        );
      } else {
        return [...prevItems, safeProduct];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Helper function to prepare cart data for order creation
  const getCartDataForOrder = () => {
    return cartItems.map(item => ({
      productId: item.id || '',
      title: item.title || 'Unknown Product',
      subtitle: item.subtitle || '',
      price: Number(item.price) || 0,
      image: item.image || '',
      quantity: Number(item.quantity) || 1,
      category: item.category || 'uncategorized'
    }));
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity,
    getCartDataForOrder, // New helper function
    isCartOpen,
    setIsCartOpen,
    toggleCart,
    openCart,
    closeCart,
    isLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};