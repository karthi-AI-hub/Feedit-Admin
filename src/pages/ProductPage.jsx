import { useEffect, useState } from 'react';

// Define default categories array
const categories = ["Feed", "Supplement"];
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import { getProductById } from '@/services/productsService';

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

  const handleDelete = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          aria-label="Back to products"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-green-700">
          {mode === 'add' ? 'Add New Product' : 'Edit Product'}
        </h1>
      </div>
      <ProductForm
        mode={mode}
        initialData={product}
        categories={categories.filter(cat => cat !== "ALL")}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </div>
  );
}