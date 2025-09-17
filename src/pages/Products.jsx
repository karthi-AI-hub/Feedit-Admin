import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProducts, updateProductActiveStatus, updateProductStatus } from "@/services/productsService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const animalIcons = {
  Cow: "🐄",
  Goat: "🐐",
  Chicken: "🐔",
};

export default function Products() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [activeAnimal, setActiveAnimal] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProducts();
      if (result.success) {
        setProducts(result.data || []);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products in component:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeAnimal, statusFilter]);

  // Debug useEffect to log state changes
  useEffect(() => {
    // console.log('Products state updated:', products);
  }, [products]);

  useEffect(() => {
    // console.log('Filters changed:', { activeTab, activeAnimal, statusFilter });
  }, [activeTab, activeAnimal, statusFilter]);

  // Filter products by tab, animal, and status (memoized)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = activeTab === 'ALL' || (product.category && product.category?.toLowerCase() === activeTab.toLowerCase());
      const animalMatch = activeAnimal === 'ALL' || (product.animal && product.animal?.toLowerCase() === activeAnimal.toLowerCase());
      const statusMatch = statusFilter === 'All' || product.variants?.[0]?.status === statusFilter;
      return categoryMatch && animalMatch && statusMatch;
    });
  }, [products, activeTab, activeAnimal, statusFilter]);

  // Pagination logic (memoized)
  const totalPages = useMemo(() => Math.ceil(filteredProducts.length / itemsPerPage), [filteredProducts.length, itemsPerPage]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => filteredProducts.slice(indexOfFirstItem, indexOfLastItem), [filteredProducts, indexOfFirstItem, indexOfLastItem]);

  // Handlers memoized
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleAddNewProduct = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  const handleOpenEditProduct = useCallback((product) => {
    setIsDetailViewOpen(false); // Close the dialog first
    navigate(`/products/edit/${product.id}`);
  }, [navigate]);

  const handleViewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setIsDetailViewOpen(true);
  }, []);

  const handleActiveToggle = useCallback(async (product, newActive) => {
    try {
      await updateProductActiveStatus(product.id, newActive);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: newActive } : p));
      setSelectedProduct(prev => prev && prev.id === product.id ? { ...prev, active: newActive } : prev);
    } catch (error) {
      console.error('Failed to update product active status:', error);
      setError('Failed to update product active status');
    }
  }, []);

  const handleStatusChange = useCallback(async (product, newStatus) => {
    try {
      await updateProductStatus(product.id, newStatus);
      const updatedProducts = products.map(p => 
        p.id === product.id ? { 
          ...p, 
          variants: p.variants?.map((variant, index) => 
            index === 0 ? { ...variant, status: newStatus } : variant
          ) || []
        } : p
      );
      setProducts(updatedProducts);
      setSelectedProduct(prev => prev ? ({ 
        ...prev, 
        variants: prev.variants?.map((variant, index) => 
          index === 0 ? { ...variant, status: newStatus } : variant
        ) || []
      }) : null);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }, [products]);

  const productTabs = ["ALL", "Feed", "Supplement"];
  const animalCategories = ["ALL", "Cow", "Goat", "Chicken"];

  // Memoized ProductCard component (minimized complexity, optimized image, no inline functions)
  const ProductCard = React.memo(function ProductCard({ product, onView, onEdit }) {
    // Handlers outside JSX
    const handleCardClick = useCallback(() => onView(product), [onView, product]);
    const handleEditClick = useCallback((e) => {
      e.stopPropagation();
      onEdit(product);
    }, [onEdit, product]);
    const handleImgError = useCallback((e) => {
      e.target.src = '/placeholder.png';
    }, []);
    return (
      <Card 
        key={product.id} 
        className={`overflow-hidden bg-white border border-gray-100 rounded-xl shadow hover:shadow-md transition-transform duration-100 flex flex-col cursor-pointer ${product.active === false ? 'opacity-60 grayscale' : ''}`}
        onClick={handleCardClick}
      >
        <div className="relative flex flex-col items-center p-3 pb-0">
          <img 
            src={product.image || product.gallery?.[0] || '/placeholder.png'} 
            alt={product.name || 'Product'}
            className="w-full h-40 object-cover mx-auto rounded border"
            loading="lazy"
            width={320}
            height={160}
            decoding="async"
            onError={handleImgError}
          />
          <TooltipProvider delayDuration={200} skipDelayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white z-10"
                  onClick={handleEditClick}
                  tabIndex={0}
                  aria-label="Edit Product"
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only">Edit Product</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Product</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {product.variants?.[0]?.status === 'out_of_stock' && (
            <Badge className="absolute top-4 left-4 bg-red-100 text-red-700 border border-red-300">Out of Stock</Badge>
          )}
          {product.variants?.[0]?.status === 'in_stock' && (
            <Badge className="absolute top-4 left-4 bg-green-100 text-green-700 border border-green-300">In Stock</Badge>
          )}
        </div>
        <CardContent className="p-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-base mb-1 truncate" title={product.name}>{product.name}</h3>
              <Badge variant="secondary" className="mt-1">{product.category}</Badge>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="font-bold text-base text-green-700">{`₹${product.variants?.[0]?.salePrice || product.variants?.[0]?.regularPrice || 0}`}</p>
              {product.variants?.[0]?.salePrice && (
                <p className="text-xs text-gray-500 line-through">{`₹${product.variants?.[0]?.regularPrice}`}</p>
              )}
            </div>
          </div>
          <div className="space-y-2 mt-2 flex-1">
            <div>
              <h4 className="font-medium text-xs mb-1">Description</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="space-y-1 pt-1 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Stock</span>
                <span className="font-medium">{product.variants?.[0]?.stockQuantity || 0}</span>
              </div>
              {(product.variants?.[0]?.volume) && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {product.category === "Feed" ? "Weight" : "Volume"}
                  </span>
                  <span className="font-medium">
                    {product.variants?.[0]?.unit ? 
                      `${product.variants?.[0]?.volume} ${product.variants?.[0]?.unit}` :
                      `${product.variants?.[0]?.volume}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });

  return (
    <div className="min-h-screen">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-700">All Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-fit text-sm shadow-none"
              onClick={fetchProducts}
              disabled={loading}
            >
              <svg 
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
                style={loading ? { animationDirection: 'reverse' } : {}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
            <Button 
              className="bg-primary w-full md:w-auto" 
              style={{ backgroundColor: '#007539', borderColor: '#007539' }} 
              size="sm"
              onClick={handleAddNewProduct}
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD NEW PRODUCT
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          {/* Animal Filter */}
          <div className="space-y-1">
            <Label htmlFor="animal-filter">Animal</Label>
            <Select value={activeAnimal} onValueChange={setActiveAnimal}>
              <SelectTrigger id="animal-filter" className="w-full">
                <SelectValue placeholder="Select Animal" />
              </SelectTrigger>
              <SelectContent>
                {animalCategories.map(animal => (
                  <SelectItem key={animal} value={animal}>
                    {animal === 'ALL' ? (
                      <span>All Animals</span>
                    ) : (
                      <>
                        <span className="mr-2">{animalIcons[animal]}</span>
                        {animal}
                      </>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger id="category-filter" className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {productTabs.map(tab => (
                  <SelectItem key={tab} value={tab}>{tab}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading Products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={handleViewProduct}
              onEdit={handleOpenEditProduct}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No products found for the selected filters.</p>
          </div>
        )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(Math.max(1, currentPage - 1));
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(totalPages).keys()].map(number => (
                <PaginationItem key={number + 1}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === number + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(number + 1);
                    }}
                  >
                    {number + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(Math.min(totalPages, currentPage + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      </>
      )}

      {/* Product Detail View Dialog */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-800">{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Product Details
                </DialogDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="mr-2">{selectedProduct.category}</Badge>
                  <Badge variant="outline">{selectedProduct.animal}</Badge>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Left side: Image Carousel */}
                <div>
                  <Carousel className="w-full max-w-xs mx-auto">
                    <CarouselContent>
                      {selectedProduct.gallery?.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex aspect-square items-center justify-center p-0">
                                <img src={image} alt={`Product image ${index + 1}`} className="w-full h-full object-cover rounded-lg" loading="lazy" />
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>

                {/* Right side: Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Description</h4>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-green-700">{`₹${selectedProduct.variants?.[0]?.salePrice || selectedProduct.variants?.[0]?.regularPrice || 0}`}</p>
                    {selectedProduct.variants?.[0]?.salePrice && (
                      <p className="text-lg text-gray-500 line-through">{`₹${selectedProduct.variants?.[0]?.regularPrice}`}</p>
                    )}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between"><strong>Brand:</strong> <span>{selectedProduct.brand}</span></div>
                    <div className="flex justify-between"><strong>SKU:</strong> <span>{selectedProduct.variants?.[0]?.sku || '-'}</span></div>
                    <div className="flex justify-between"><strong>Stock:</strong> <span>{selectedProduct.variants?.[0]?.stockQuantity || 0}</span></div>
                    <div className="flex justify-between">
                      <strong>
                        {selectedProduct.category === "Feed" ? "Weight:" : "Volume:"}
                      </strong> 
                      <span>
                        {selectedProduct.variants?.[0]?.volume ? 
                          selectedProduct.variants?.[0]?.unit ? 
                            `${selectedProduct.variants?.[0]?.volume} ${selectedProduct.variants?.[0]?.unit}` :
                            `${selectedProduct.variants?.[0]?.volume}` :
                          "-"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stock-status" className="font-semibold text-gray-800">
                        Status: {selectedProduct.variants?.[0]?.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                      </Label>
                      <Switch
                        id="stock-status"
                        checked={selectedProduct.variants?.[0]?.status === 'in_stock'}
                        onCheckedChange={(isChecked) => {
                          const newStatus = isChecked ? 'in_stock' : 'out_of_stock';
                          handleStatusChange(selectedProduct, newStatus);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-gray-800">
                        {selectedProduct.active === false ? 'Inactive' : 'Active'}
                      </Label>
                      <Switch
                        checked={selectedProduct.active !== false}
                        onCheckedChange={isChecked => handleActiveToggle(selectedProduct, isChecked)}
                        title={selectedProduct.active === false ? 'Enable Product' : 'Disable Product'}
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      📄 Product Brochure
                    </h4>
                    {selectedProduct.brochureUrl ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ✓ BROCHURE AVAILABLE
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mb-3">
                          This product has a brochure stored in the database
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedProduct.brochureUrl, '_blank')}
                          className="w-full border-blue-300 hover:bg-blue-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          📥 Download Brochure (PDF)
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            📄 NO BROCHURE
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          No brochure is available for this product
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button style={{ backgroundColor: '#007539' }} onClick={() => setIsDetailViewOpen(false)}>CLOSE</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}