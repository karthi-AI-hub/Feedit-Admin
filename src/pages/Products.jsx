import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProducts, updateProduct } from "@/services/productsService";
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

// Mock data for animal icons, replace with actual icons if available
const animalIcons = {
  Cow: "🐄",
  Goat: "🐐",
  Chicken: "🐔",
};

export default function Products() {
  const [activeTab, setActiveTab] = useState("Feed");
  const [activeAnimal, setActiveAnimal] = useState("Cow");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "in_stock", "out_of_stock"
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 8 products per page
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by tab, animal, and status
  const filteredProducts = products.filter(product => {
    const categoryMatch = product.category?.toLowerCase() === activeTab.toLowerCase();
    const animalMatch = product.animal?.toLowerCase() === activeAnimal.toLowerCase();
    const statusMatch = statusFilter === 'All' || product.status === statusFilter;
    return categoryMatch && animalMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddNewProduct = () => {
    navigate('/products/new');
  };

  const handleOpenEditProduct = (product) => {
    setIsDetailViewOpen(false); // Close the dialog first
    navigate(`/products/edit/${product.id}`);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsDetailViewOpen(true);
  };

  const handleStatusChange = async (product, newStatus) => {
    try {
      await updateProduct(product.id, { status: newStatus });
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, status: newStatus } : p
      );
      setProducts(updatedProducts);
      setSelectedProduct(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const productTabs = ["Feed", "Supplement"];
  const animalCategories = ["Cow", "Goat", "Chicken"];

  return (
    <div className="min-h-screen">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-green-700">All Products</h1>
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
                    <span className="mr-2">{animalIcons[animal]}</span>
                    {animal}
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
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-transform duration-200 hover:-translate-y-1 flex flex-col cursor-pointer"
              onClick={() => handleViewProduct(product)}
            >
              <div className="relative flex flex-col items-center p-4 pb-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover mx-auto rounded-xl border"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white z-10"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card's onClick from firing
                          handleOpenEditProduct(product);
                        }}
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
                {product.status === 'out_of_stock' && (
                  <Badge className="absolute top-4 left-4 bg-red-100 text-red-700 border border-red-300">Out of Stock</Badge>
                )}
                 {product.status === 'in_stock' && (
                  <Badge className="absolute top-4 left-4 bg-green-100 text-green-700 border border-green-300">In Stock</Badge>
                )}
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 truncate" title={product.name}>{product.name}</h3>
                    <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-bold text-lg text-green-700">{`₹${product.salePrice || product.regularPrice}`}</p>
                    {product.salePrice && (
                      <p className="text-sm text-gray-500 line-through">{`₹${product.regularPrice}`}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3 mt-4 flex-1">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock Quantity</span>
                      <span className="font-medium">{product.stockQuantity || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* Product Detail View Dialog */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-800">{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  <Badge variant="outline" className="mr-2">{selectedProduct.category}</Badge>
                  <Badge variant="outline">{selectedProduct.animal}</Badge>
                </DialogDescription>
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
                                <img src={image} alt={`Product image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
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
                    <p className="text-2xl font-bold text-green-700">{`₹${selectedProduct.salePrice || selectedProduct.regularPrice}`}</p>
                    {selectedProduct.salePrice && (
                      <p className="text-lg text-gray-500 line-through">{`₹${selectedProduct.regularPrice}`}</p>
                    )}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between"><strong>Brand:</strong> <span>{selectedProduct.brand}</span></div>
                    <div className="flex justify-between"><strong>SKU:</strong> <span>{selectedProduct.sku}</span></div>
                    <div className="flex justify-between"><strong>Stock:</strong> <span>{selectedProduct.stockQuantity}</span></div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </div>
                  <div className="border-t pt-4 flex items-center justify-between">
                    <Label htmlFor="stock-status" className="font-semibold text-gray-800">
                      Status: {selectedProduct.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    </Label>
                    <Switch
                      id="stock-status"
                      checked={selectedProduct.status === 'in_stock'}
                      onCheckedChange={(isChecked) => {
                        const newStatus = isChecked ? 'in_stock' : 'out_of_stock';
                        handleStatusChange(selectedProduct, newStatus);
                      }}
                    />
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