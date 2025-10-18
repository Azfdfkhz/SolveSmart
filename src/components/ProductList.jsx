import React from 'react';
import { useProduct } from '../context/ProductContext';

const ProductList = () => {
  const { products, loading, getImageWithCacheBust, getDefaultImage } = useProduct();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {products.map(p => (
        <div key={p.id} className="border rounded p-2 shadow">
          <img
            src={getImageWithCacheBust(p.image) || getDefaultImage()}
            alt={p.title}
            className="w-full h-40 object-cover rounded"
            onError={(e) => e.target.src = getDefaultImage()}
          />
          <h3 className="mt-2 font-semibold">{p.title}</h3>
          <p className="text-gray-500">${p.price}</p>
          <p className="text-sm text-gray-400">{p.category}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
