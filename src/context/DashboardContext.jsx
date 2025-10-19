// context/DashboardContext.js (Optimized)
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
    salesData: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Hitung revenue hanya dari orders yang completed & paid
      const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => {
        const order = doc.data();
        if (order.status === 'completed' && order.paymentStatus === 'paid') {
          return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);

      const recentOrders = ordersSnapshot.docs.slice(0, 5).map(doc => {
        const orderData = doc.data();
        return {
          id: doc.id,
          customerName: orderData.userName || orderData.customerName || 'Customer',
          totalAmount: orderData.totalAmount || 0,
          status: orderData.status || 'pending',
          paymentStatus: orderData.paymentStatus || 'unpaid',
          createdAt: orderData.createdAt?.toDate() || new Date(),
          items: orderData.items || []
        };
      });

      setDashboardData({
        totalRevenue,
        totalProducts: productsSnapshot.size,
        totalCustomers: usersSnapshot.size,
        totalOrders: ordersSnapshot.size,
        recentOrders,
        salesData: [] 
      });

      console.log('✅ Dashboard data updated successfully');

    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!db || !user) {
      setLoading(false);
      return;
    }

    let unsubscribeOrders, unsubscribeProducts;

    const setupListeners = async () => {
      try {
        await loadDashboardData();

        unsubscribeOrders = onSnapshot(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
          () => loadDashboardData(),
          (err) => console.error('Orders listener error:', err)
        );

        unsubscribeProducts = onSnapshot(
          collection(db, 'products'),
          () => loadDashboardData(),
          (err) => console.error('Products listener error:', err)
        );

      } catch (err) {
        console.error('Error setting up listeners:', err);
      }
    };

    setupListeners();

    return () => {
      unsubscribeOrders?.();
      unsubscribeProducts?.();
    };
  }, [loadDashboardData, user]);

  const refreshData = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  const value = {
    dashboardData,
    loading,
    error,
    refreshData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};