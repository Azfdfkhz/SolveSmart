// context/ProductContext.jsx (Fixed for Multiple Images & Edit)
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default images fallback
  const defaultImages = [
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'
  ];

  const getDefaultImage = () => {
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  };

  // Function untuk convert Google Drive link ke direct link
  const convertDriveLink = (url) => {
    try {
      if (!url) return '';
      
      // Jika sudah format direct link, return as is
      if (url.includes('uc?export=view')) {
        return url;
      }

      // Extract file ID dari berbagai format Google Drive URL
      let fileId = '';
      
      const fileMatch = url.match(/\/d\/([^\/]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      }
      
      const openMatch = url.match(/[?&]id=([^&]+)/);
      if (openMatch) {
        fileId = openMatch[1];
      }

      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }

      return url;
    } catch (err) {
      console.warn('Failed to convert Drive link:', err);
      return url;
    }
  };

  // Function untuk handle image compatibility (single image -> array)
  const getProductImages = (productData) => {
    // Handle both single image (legacy) and multiple images (new)
    if (productData.images && Array.isArray(productData.images)) {
      // Filter hanya URL yang valid dan convert Drive links
      const validImages = productData.images
        .filter(img => img && img.trim() !== '')
        .map(img => convertDriveLink(img));
      
      return validImages.length > 0 ? validImages : [getDefaultImage()];
    } else if (productData.image) {
      return [convertDriveLink(productData.image)]; // Convert single image to array
    }
    return [getDefaultImage()]; // Default fallback
  };

  // Function untuk cache busting
  const getImageWithCacheBust = (url) => {
    if (!url) return '';
    
    if (url.includes('drive.google.com')) {
      return `${url}&timestamp=${Date.now()}`;
    }
    
    return url;
  };

  // Cart functions
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Listen to real-time products updates
  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    console.log('🔍 Setting up products listener for user:', user.uid);

    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📦 Products data received:', snapshot.docs.length, 'products');
          const productsData = snapshot.docs.map(doc => {
            const productData = doc.data();
            return {
              id: doc.id,
              ...productData,
              // Gunakan helper function untuk handle images
              images: getProductImages(productData)
            };
          });
          setProducts(productsData);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('❌ Error listening to products:', err);
          setError('Gagal memuat data produk: ' + err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('❌ Error setting up product listener:', err);
      setError('Error setup produk: ' + err.message);
      setLoading(false);
    }
  }, [user]);

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!storage) throw new Error('Storage not initialized');

      console.log('📤 Starting image upload...', file.name, file.size);

      if (!file.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Ukuran gambar maksimal 5MB');
      }

      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `products/${timestamp}_${safeFileName}`;
      
      console.log('📁 Uploading to:', fileName);

      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      console.log('✅ Image uploaded successfully');

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🔗 Download URL:', downloadURL);
      
      return downloadURL;

    } catch (err) {
      console.error('❌ Error uploading image:', err);
      
      let errorMessage = 'Gagal mengupload gambar: ';
      
      if (err.code === 'storage/unauthorized') {
        errorMessage += 'Akses ditolak. Periksa Storage Rules di Firebase Console.';
      } else if (err.message.includes('ERR_FAILED') || err.message.includes('network')) {
        errorMessage += 'Network error. Periksa koneksi internet dan Storage Rules.';
      } else if (err.message.includes('timeout')) {
        errorMessage += 'Upload timeout. File terlalu besar atau koneksi lambat.';
      } else {
        errorMessage += err.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Add new product with multiple images
  const addProduct = async (productData, imageFiles = []) => {
    if (!user) {
      throw new Error('Harus login untuk menambah produk');
    }

    try {
      setActionLoading(true);
      setError(null);

      console.log('➕ Adding product...');

      let imageUrls = [];

      // Upload image files jika ada
      if (imageFiles && imageFiles.length > 0) {
        console.log('📤 Uploading', imageFiles.length, 'images...');
        for (const file of imageFiles) {
          if (file) {
            const imageUrl = await uploadImage(file);
            imageUrls.push(imageUrl);
          }
        }
      }

      // Tambahkan URL images dari input
      if (productData.images && Array.isArray(productData.images)) {
        const validUrls = productData.images
          .filter(url => url && url.trim() !== '')
          .map(url => convertDriveLink(url));
        imageUrls = [...imageUrls, ...validUrls];
      }

      // Jika tidak ada gambar, gunakan default
      if (imageUrls.length === 0) {
        imageUrls = [getDefaultImage()];
      }

      // Validasi field wajib
      if (!productData.title?.trim() || !productData.price || !productData.category?.trim()) {
        throw new Error('Harap isi nama produk, harga, dan kategori');
      }

      const productToAdd = {
        title: productData.title.trim(),
        subtitle: productData.subtitle?.trim() || '',
        price: parseFloat(productData.price),
        category: productData.category.trim(),
        images: imageUrls, // Gunakan array images
        stock: productData.stock || 10,
        status: 'Active',
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('📝 Saving to Firestore...', productToAdd);

      const docRef = await addDoc(collection(db, 'products'), productToAdd);
      console.log('✅ Product added with ID:', docRef.id);

      return docRef.id;

    } catch (err) {
      console.error('❌ Error adding product:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Update product dengan multiple images
  const editProduct = async (productId, productData, imageFiles = []) => {
    if (!user) {
      throw new Error('Harus login untuk update produk');
    }

    try {
      setActionLoading(true);
      setError(null);
      
      console.log('✏️ Updating product:', productId);

      let imageUrls = [];

      // Upload image files baru jika ada
      if (imageFiles && imageFiles.length > 0) {
        console.log('📤 Uploading', imageFiles.length, 'new images...');
        for (const file of imageFiles) {
          if (file) {
            const imageUrl = await uploadImage(file);
            imageUrls.push(imageUrl);
          }
        }
      }

      // Tambahkan URL images dari input (yang sudah ada + baru)
      if (productData.images && Array.isArray(productData.images)) {
        const validUrls = productData.images
          .filter(url => url && url.trim() !== '')
          .map(url => convertDriveLink(url));
        imageUrls = [...imageUrls, ...validUrls];
      }

      // Jika tidak ada gambar, gunakan default
      if (imageUrls.length === 0) {
        imageUrls = [getDefaultImage()];
      }

      const updateData = {
        title: productData.title?.trim() || '',
        subtitle: productData.subtitle?.trim() || '',
        price: productData.price ? parseFloat(productData.price) : 0,
        category: productData.category?.trim() || '',
        images: imageUrls, // Gunakan array images
        stock: productData.stock || 10,
        status: productData.status || 'Active',
        updatedBy: user.uid,
        updatedAt: new Date()
      };

      console.log('📝 Updating product with data:', updateData);

      await updateDoc(doc(db, 'products', productId), updateData);
      console.log('✅ Product updated successfully');

    } catch (err) {
      console.error('❌ Error updating product:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!user) {
      throw new Error('Harus login untuk menghapus produk');
    }

    try {
      setActionLoading(true);
      setError(null);
      
      console.log('🗑️ Deleting product:', productId);
      
      await deleteDoc(doc(db, 'products', productId));
      console.log('✅ Product deleted successfully');
      
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      throw new Error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const updateProduct = editProduct;

  const value = {
    products,
    cart,
    loading,
    actionLoading,
    error,
    addProduct,
    editProduct,
    updateProduct, 
    deleteProduct,
    uploadImage,
    getDefaultImage,
    convertDriveLink,
    getProductImages, 
    getImageWithCacheBust,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};