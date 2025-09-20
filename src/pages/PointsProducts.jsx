import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Coins, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getProducts } from '@/services/productsService';
import {
  addPointsProduct,
  getPointsProducts,
  deletePointsProduct,
  updatePointsProduct,
} from '@/services/pointsProductsService';

export default function PointsProducts() {
  const [pointsProducts, setPointsProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [coins, setCoins] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const getAvailableProducts = () => {
    const currentProductId = editingItem ? editingItem.productId : null;
    const currentVariantSku = editingItem && editingItem.variant ? editingItem.variant.sku : null;
    
    return products.filter(product => {
      if (editingItem && product.id === currentProductId) {
        return true;
      }
      const variants = getProductVariants(product);
      
      if (variants.length <= 1) {
        const isAssigned = pointsProducts.some(item => 
          item.productId === product.id && 
          (!item.variant || !item.variant.sku)
        );
        return !isAssigned;
      } else {
        const assignedVariants = pointsProducts
          .filter(item => item.productId === product.id && item.variant && item.variant.sku)
          .map(item => item.variant.sku);
        
        const availableVariants = variants.filter(variant => 
          !assignedVariants.includes(variant.sku)
        );
        
        return availableVariants.length > 0;
      }
    });
  };

  const handleProductSelection = (productId) => {
    setSelectedProductId(productId);
    setSelectedVariant('');
    
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const getProductVariants = (product) => {
    if (!product || !product.variants || !Array.isArray(product.variants)) {
      return [];
    }
    return product.variants.filter(variant => variant && variant.sku);
  };

  const hasMultipleVariants = (product) => {
    const variants = getProductVariants(product);
    return variants.length > 1;
  };

  const getSelectedVariantInfo = () => {
    if (!selectedProduct || !selectedVariant) return null;
    
    const variants = getProductVariants(selectedProduct);
    return variants.find(variant => variant.sku === selectedVariant);
  };

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [pointsProductsResult, productsResult] = await Promise.all([
        getPointsProducts(),
        getProducts(),
      ]);

      if (pointsProductsResult.success) {
        setPointsProducts(pointsProductsResult.data);
      }

      if (productsResult?.success) {
        setProducts(productsResult.data || []);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coins || !selectedProductId) return;
        if (selectedProduct && hasMultipleVariants(selectedProduct) && !selectedVariant) {
      setFormError('Please select a variant for this product.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    
    try {
      const selectedProductData = products.find((p) => p.id === selectedProductId);
      const variantInfo = getSelectedVariantInfo();
      
      const pointsProductData = {
        coins: parseInt(coins),
        productId: selectedProductId,
        productName: selectedProductData?.name || 'Unknown Product',
      };

      if (variantInfo) {
        pointsProductData.variant = {
          sku: variantInfo.sku,
          unit: variantInfo.unit,
          volume: variantInfo.volume,
          stockQuantity: variantInfo.stockQuantity,
          regularPrice: variantInfo.regularPrice,
          salePrice: variantInfo.salePrice,
          status: variantInfo.status
        };
        pointsProductData.productName = `${selectedProductData?.name} (${variantInfo.unit} ${variantInfo.volume})`;
      }

      let result;
      if (editingItem) {
        result = await updatePointsProduct(editingItem.id, pointsProductData);
      } else {
        result = await addPointsProduct(pointsProductData);
      }

      if (result.success) {
        resetForm();
        setIsDialogOpen(false);
        fetchData(); // Refresh data
      } else {
        setFormError(result.error || 'Failed to save.');
      }
    } catch (error) {
      console.error('Error saving points-product:', error);
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setCoins(item.coins.toString());
    setSelectedProductId(item.productId);
    
    const product = products.find(p => p.id === item.productId);
    setSelectedProduct(product);
    
    if (item.variant && item.variant.sku) {
      setSelectedVariant(item.variant.sku);
    } else {
      setSelectedVariant('');
    }
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mapping?')) {
      try {
        const result = await deletePointsProduct(id);
        if (result.success) {
          fetchData(); // Refresh data
        }
      } catch (error) {
        console.error('Error deleting points-product:', error);
      }
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const resetForm = () => {
    setCoins('');
    setSelectedProductId('');
    setSelectedVariant('');
    setSelectedProduct(null);
    setEditingItem(null);
    setFormError('');
  };

  const handleDialogClose = () => {
    resetForm();
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Redemption</h1>
          <p className="text-gray-600 mt-1">Set Milky Drops required to redeem products for free</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
          {!editingItem && getAvailableProducts().length === 0 && products.length > 0 && (
            <p className="text-orange-600 text-sm mt-1">
              All products already have Milky Drops value.
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-700 hover:bg-green-800" 
              disabled={!editingItem && getAvailableProducts().length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Set Product Redemption
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Product Redemption' : 'Set Product Redemption'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="coins">Milky Drops Required</Label>
                  <Input
                    id="coins"
                    type="number"
                    placeholder="Enter Milky Drops required"
                    value={coins}
                    onChange={(e) => setCoins(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select value={selectedProductId} onValueChange={handleProductSelection} required>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        getAvailableProducts().length === 0 
                          ? "No available products" 
                          : "Choose a product"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableProducts().length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No available products. All products already have Milky Drops redemption set.
                        </div>
                      ) : (
                        getAvailableProducts().map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Only showing products without Milky Drops redemption set
                  </p>
                </div>

                {selectedProduct && hasMultipleVariants(selectedProduct) && (
                  <div className="space-y-2">
                    <Label htmlFor="variant">Select Variant</Label>
                    <Select value={selectedVariant} onValueChange={setSelectedVariant} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProductVariants(selectedProduct).map((variant) => (
                          <SelectItem key={variant.sku} value={variant.sku}>
                            <div className="flex justify-between items-center w-full">
                              <span>{variant.unit} {variant.volume}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                Stock: {variant.stockQuantity || 0}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      This product has multiple variants. Please select one.
                    </p>
                  </div>
                )}

                {getSelectedVariantInfo() && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Variant Info</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">SKU:</span>
                        <span className="ml-1 text-blue-900">{getSelectedVariantInfo().sku}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Stock:</span>
                        <span className="ml-1 text-blue-900">{getSelectedVariantInfo().stockQuantity || 0} units</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Size:</span>
                        <span className="ml-1 text-blue-900">{getSelectedVariantInfo().unit} {getSelectedVariantInfo().volume}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Price:</span>
                        <span className="ml-1 text-blue-900">₹{getSelectedVariantInfo().salePrice || getSelectedVariantInfo().regularPrice}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800"
                  disabled={
                    isSubmitting || 
                    !coins || 
                    !selectedProductId || 
                    getAvailableProducts().length === 0 ||
                    (selectedProduct && hasMultipleVariants(selectedProduct) && !selectedVariant)
                  }
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products with Redemption</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsProducts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Redemption Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {pointsProducts.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No redemption settings found</h3>
              <p className="text-gray-600 mb-4">Set Milky Drops required for products to enable free redemption.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant Info</TableHead>
                  <TableHead>Milky Drops Required</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsProducts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-600">ID: {item.productId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.variant ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {item.variant.unit} {item.variant.volume}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {item.variant.sku}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {item.variant.stockQuantity || 0} units
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No variant specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        {item.coins}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.createdAt
                        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}