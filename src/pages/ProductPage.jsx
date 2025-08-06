import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '@/components/ProductForm';
import { getProductById } from '@/services/productsService';
import { categories } from '@/data/products';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const mode = id ? 'edit' : 'add';

  useEffect(() => {
    if (mode === 'edit') {
      getProductById(id)
        .then(data => {
          setProduct(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch product", err);
          setLoading(false);
          // Optionally navigate to a not-found page or show an error
        });
    } else {
      setLoading(false);
    }
  }, [id, mode]);

  const handleSave = () => {
    navigate('/products');
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">
        {mode === 'add' ? 'Add New Product' : 'Edit Product'}
      </h1>
      <ProductForm
        mode={mode}
        initialData={product}
        categories={categories.filter(cat => cat !== "ALL")}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
