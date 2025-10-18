// context/OrderContext.jsx (FIXED Payment System)
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within a OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data sekali saja saat pertama kali
  useEffect(() => {
    loadOrders();
  }, []);

  // Manual load function
  const loadOrders = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      console.log('🔄 Loading orders manually...');
      
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
      
      console.log('📦 Orders loaded:', ordersData.length);
      setOrders(ordersData);
      
    } catch (err) {
      console.error('❌ Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const createOrder = async (orderData) => {
    try {
      setActionLoading(true);

      const totalAmount = orderData.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      const orderToAdd = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Customer',
        items: orderData.items,
        totalAmount: totalAmount,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: '',
        shippingAddress: orderData.shippingAddress || {},
        notes: orderData.notes || '',
        adminNotes: '',
        deliveryFiles: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderToAdd);
      
      // Refresh orders setelah create
      setTimeout(() => {
        loadOrders();
      }, 500);

      return { id: docRef.id, ...orderToAdd };

    } catch (err) {
      console.error('❌ Error creating order:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // SIMPLE acceptOrder - langsung update state + firestore
  const acceptOrder = async (orderId, adminNotes = '') => {
    try {
      setActionLoading(true);
      console.log('🎯 Accepting order:', orderId);

      // 1. Update di Firestore
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'accepted',
        adminNotes: adminNotes || '',
        updatedAt: Timestamp.now()
      });

      console.log('✅ Firestore updated successfully');

      // 2. Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'accepted', adminNotes }
            : order
        )
      );

      console.log('✅ Local state updated');

      // 3. Reload data untuk memastikan
      setTimeout(() => {
        loadOrders();
      }, 500);

      return true;

    } catch (err) {
      console.error('❌ Error in acceptOrder:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectOrder = async (orderId, adminNotes = '') => {
    try {
      setActionLoading(true);
      
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'rejected',
        adminNotes: adminNotes || '',
        updatedAt: Timestamp.now()
      });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'rejected', adminNotes }
            : order
        )
      );

      setTimeout(() => {
        loadOrders();
      }, 500);

    } catch (err) {
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // PERBAIKAN: Fungsi processPayment untuk QRIS
  const processPayment = async (orderId, paymentMethod) => {
    try {
      setActionLoading(true);
      console.log('💳 Processing payment:', { orderId, paymentMethod });
      
      const orderRef = doc(db, 'orders', orderId);
      
      // Untuk QRIS, status tetap unpaid sampai admin konfirmasi
      // Untuk Cash, langsung paid
      const paymentStatus = paymentMethod === 'cash' ? 'paid' : 'unpaid';
      
      await updateDoc(orderRef, {
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Payment processed:', { paymentMethod, paymentStatus });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                paymentMethod, 
                paymentStatus: paymentStatus 
              }
            : order
        )
      );

      // Refresh data
      setTimeout(() => {
        loadOrders();
      }, 500);

    } catch (err) {
      console.error('❌ Error in processPayment:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // PERBAIKAN: Fungsi confirmPayment untuk admin
  const confirmPayment = async (orderId, adminNotes = '') => {
    try {
      setActionLoading(true);
      console.log('✅ Admin confirming payment for order:', orderId);
      
      const orderRef = doc(db, 'orders', orderId);
      
      await updateDoc(orderRef, {
        paymentStatus: 'paid',
        adminNotes: adminNotes || '',
        updatedAt: Timestamp.now()
      });

      console.log('✅ Payment confirmed by admin');

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                paymentStatus: 'paid',
                adminNotes: adminNotes || order.adminNotes
              }
            : order
        )
      );

      // Refresh data
      setTimeout(() => {
        loadOrders();
      }, 500);

    } catch (err) {
      console.error('❌ Error in confirmPayment:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // TAMBAHKAN: Fungsi completeOrder
  const completeOrder = async (orderId, adminNotes = '') => {
    try {
      setActionLoading(true);
      console.log('🏁 Completing order:', orderId);
      
      const orderRef = doc(db, 'orders', orderId);
      
      const updateData = {
        status: 'completed',
        updatedAt: Timestamp.now()
      };
      
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }
      
      await updateDoc(orderRef, updateData);

      console.log('✅ Order completed');

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: 'completed',
                adminNotes: adminNotes || order.adminNotes
              }
            : order
        )
      );

      // Refresh data
      setTimeout(() => {
        loadOrders();
      }, 500);

    } catch (err) {
      console.error('❌ Error in completeOrder:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const addDeliveryFiles = async (orderId, files) => {
    try {
      setActionLoading(true);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryFiles: files,
        updatedAt: Timestamp.now()
        // Jangan otomatis complete, biar admin yang selesaikan manual
      });

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, deliveryFiles: files }
            : order
        )
      );

      setTimeout(() => {
        loadOrders();
      }, 500);

    } catch (err) {
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper functions
  const getUserOrders = () => {
    if (!user) return [];
    return orders.filter(order => order.userId === user.uid);
  };

  const getAllOrders = () => orders;

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const acceptedOrders = orders.filter(order => order.status === 'accepted').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalRevenue = orders
      .filter(order => order.status === 'completed' && order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const uniqueCustomers = new Set(orders.map(order => order.userEmail)).size;

    return {
      totalOrders,
      pendingOrders,
      acceptedOrders,
      completedOrders,
      totalRevenue,
      uniqueCustomers
    };
  };

  const refreshOrders = () => {
    loadOrders();
  };

  const value = {
    orders,
    loading,
    actionLoading,
    error,
    createOrder,
    acceptOrder,
    rejectOrder,
    processPayment,
    confirmPayment,
    addDeliveryFiles,
    completeOrder, // TAMBAHKAN INI
    getUserOrders,
    getAllOrders,
    getOrdersByStatus,
    getOrderStats, // TAMBAHKAN INI
    refreshOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};