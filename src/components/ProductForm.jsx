import React, { useState } from 'react';
import { useProduct } from '../context/ProductContext';

const ProductForm = () => {
  const { addProduct, actionLoading } = useProduct();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !price || !category) {
      setError('Harap isi semua field');
      return;
    }

    try {
      await addProduct({ title, price, category }, imageFile);
      setTitle('');
      setPrice('');
      setCategory('');
      setImageFile(null);
      alert('Produk berhasil ditambahkan!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        type="text"
        placeholder="Nama Produk"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="Harga"
        value={price}
        onChange={e => setPrice(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        placeholder="Kategori"
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setImageFile(e.target.files[0])}
        className="mb-2"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={actionLoading}>
        {actionLoading ? 'Uploading...' : 'Tambah Produk'}
      </button>
    </form>
  );
};

export default ProductForm;
