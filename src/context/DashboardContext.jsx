// context/DashboardContext.js (Optimized for Multiple Images)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    recentOrders: [],
    salesData: [],
    products: [] // Tambahkan products untuk akses lebih mudah
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function untuk handle image compatibility
  const getProductImages = (productData) => {
    // Handle both single image (legacy) and multiple images (new)
    if (productData.images && Array.isArray(productData.images)) {
      return productData.images;
    } else if (productData.image) {
      return [productData.image]; // Convert single image to array
    }
    return []; // No images
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!db) {
        throw new Error("Firestore database not initialized");
      }

      console.log('🔄 Loading dashboard data for user:', user.uid);

      // Load data dengan query yang lebih spesifik
      const productsQuery = query(collection(db, 'products'));
      const usersQuery = query(collection(db, 'users'));
      const ordersQuery = query(
        collection(db, 'orders'), 
        orderBy('createdAt', 'desc')
      );

      const [productsSnapshot, usersSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(productsQuery),
        getDocs(usersQuery),
        getDocs(ordersQuery)
      ]);

      // Process products dengan multiple images support
      const products = productsSnapshot.docs.map(doc => {
        const productData = doc.data();
        return {
          id: doc.id,
          title: productData.title || '',
          subtitle: productData.subtitle || '',
          price: productData.price || 0,
          category: productData.category || '',
          images: getProductImages(productData), // Use helper function
          stock: productData.stock || 0,
          status: productData.status || 'Active',
          createdAt: productData.createdAt?.toDate() || new Date(),
          updatedAt: productData.updatedAt?.toDate() || new Date()
        };
      });

      // Hitung revenue hanya dari orders yang completed & paid
      const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => {
        const order = doc.data();
        if (order.status === 'completed' && order.paymentStatus === 'paid') {
          return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);

      // Process orders dengan image compatibility
      const recentOrders = ordersSnapshot.docs.slice(0, 5).map(doc => {
        const orderData = doc.data();
        
        // Process order items dengan image compatibility
        const items = (orderData.items || []).map(item => ({
          ...item,
          // Ensure each item has proper image handling
          image: item.image || (item.images && item.images[0]) || ''
        }));

        return {
          id: doc.id,
          customerName: orderData.userName || orderData.customerName || 'Customer',
          userEmail: orderData.userEmail || '',
          totalAmount: orderData.totalAmount || 0,
          status: orderData.status || 'pending',
          paymentStatus: orderData.paymentStatus || 'unpaid',
          paymentMethod: orderData.paymentMethod || 'cash',
          createdAt: orderData.createdAt?.toDate() || new Date(),
          items: items,
          shippingAddress: orderData.shippingAddress || {},
          adminNotes: orderData.adminNotes || '',
          deliveryFiles: orderData.deliveryFiles || []
        };
      });

      // Get all orders untuk stats
      const allOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setDashboardData({
        totalRevenue,
        totalProducts: productsSnapshot.size,
        totalCustomers: usersSnapshot.size,
        totalOrders: ordersSnapshot.size,
        recentOrders,
        salesData: [],
        products: products, // Include products in dashboard data
        allOrders: allOrders // Include all orders for order management
      });

      console.log('✅ Dashboard data updated successfully');
      console.log('📊 Products loaded:', products.length);
      console.log('📦 Orders loaded:', allOrders.length);

    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time listeners untuk data yang berubah
  useEffect(() => {
    if (!db || !user) {
      setLoading(false);
      return;
    }

    let unsubscribeOrders, unsubscribeProducts;

    const setupListeners = async () => {
      try {
        // Load initial data
        await loadDashboardData();

        // Setup real-time listeners
        unsubscribeOrders = onSnapshot(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
          (snapshot) => {
            console.log('🔄 Orders updated in real-time');
            loadDashboardData();
          },
          (err) => {
            console.error('❌ Orders listener error:', err);
            setError('Real-time orders update failed: ' + err.message);
          }
        );

        unsubscribeProducts = onSnapshot(
          query(collection(db, 'products'), orderBy('createdAt', 'desc')),
          (snapshot) => {
            console.log('🔄 Products updated in real-time');
            loadDashboardData();
          },
          (err) => {
            console.error('❌ Products listener error:', err);
            setError('Real-time products update failed: ' + err.message);
          }
        );

      } catch (err) {
        console.error('❌ Error setting up listeners:', err);
        setError('Failed to setup real-time listeners: ' + err.message);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, [loadDashboardData, user]);

  const refreshData = useCallback(async () => {
    console.log('🔄 Manually refreshing dashboard data...');
    await loadDashboardData();
  }, [loadDashboardData]);

  // Helper functions untuk dashboard
  const getOrderStats = useCallback(() => {
    const orders = dashboardData.allOrders || [];
    
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const acceptedOrders = orders.filter(order => order.status === 'accepted');
    const completedOrders = orders.filter(order => order.status === 'completed');
    const rejectedOrders = orders.filter(order => order.status === 'rejected');
    
    const totalRevenue = completedOrders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const uniqueCustomers = new Set(
      orders.map(order => order.userEmail).filter(email => email)
    ).size;

    return {
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      acceptedOrders: acceptedOrders.length,
      completedOrders: completedOrders.length,
      rejectedOrders: rejectedOrders.length,
      totalRevenue,
      monthlyRevenue: totalRevenue, // Simplified for now
      uniqueCustomers
    };
  }, [dashboardData.allOrders]);

  const value = {
    dashboardData,
    loading,
    error,
    refreshData,
    getOrderStats,
    // Tambahkan helper functions untuk mudah diakses
    getProductImages
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};