import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { DashboardProvider } from './context/DashboardContext';
import { CartProvider } from './context/CartContext';
import Login from './components/Login';

// Lazy loading components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminChatMonitor = lazy(() => import('./pages/AdminChatMonitor'));
const Orders = lazy(() => import('./pages/Orders'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-blue-200 font-medium">Memuat...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/home" replace />;
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/home" replace />;
  
  return children;
};

// 404 Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    <div className="text-center text-white">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
        <span className="text-white text-2xl font-bold">404</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-blue-200 mb-6">Maaf, halaman yang Anda cari tidak ada.</p>
      <button
        onClick={() => window.history.back()}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg font-medium"
      >
        Kembali
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <DashboardProvider>
            <CartProvider> 
              <div className="App">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      } 
                    />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/home" 
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/chat" 
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/products" 
                      element={
                        <ProtectedRoute>
                          <Products />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/product/:id" 
                      element={
                        <ProtectedRoute>
                          <ProductDetail />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin Only Routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/products" 
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <Products adminView={true} />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/chat-monitor" 
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminChatMonitor />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/reports" 
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminReports />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Default Routes */}
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </CartProvider>
          </DashboardProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;