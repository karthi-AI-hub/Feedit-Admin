import { useState, useEffect } from "react";
import { X, Upload, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { addProduct, updateProduct, deleteProduct } from "@/services/productsService";

export default function ProductForm({
  mode = "add",
  initialData = {},
  categories = [],
  onSave,
  onCancel,
  onDelete,
}) {
  // Initial form state
  const emptyProductForm = {
    name: "",
    description: "",
    category: "",
    brand: "",
    sku: "",
    stockQuantity: "",
    regularPrice: "",
    salePrice: "",
    status: "in_stock",
    image: "",
    tags: [],
    animal: "",
    weight: "",
    unit: "",
  };

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productImages, setProductImages] = useState([]);
  const [currentTags, setCurrentTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with data when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setProductForm({
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        sku: initialData.sku || "",
        stockQuantity: initialData.stockQuantity || "",
        regularPrice: initialData.regularPrice || "",
        salePrice: initialData.salePrice || "",
        status: initialData.status || "in_stock",
        image: initialData.image || "",
        tags: initialData.tags || [],
        animal: initialData.animal || "",
        weight: initialData.weight || "",
        unit: initialData.unit || "",
      });
      setCurrentTags(initialData.tags || []);
      if (initialData.gallery && Array.isArray(initialData.gallery)) {
        setProductImages(initialData.gallery.map((url) => ({ preview: url })));
      } else {
        setProductImages([]);
      }
    } else {
      // Reset form for add mode
      setProductForm(emptyProductForm);
      setProductImages([]);
      setCurrentTags([]);
    }
  }, [initialData, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setProductForm({
      ...productForm,
      [name]: value,
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault(); // Prevent form submission
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      const updatedTags = [...currentTags, newTag.trim()];
      setCurrentTags(updatedTags);
      setProductForm({
        ...productForm,
        tags: updatedTags,
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = currentTags.filter((tag) => tag !== tagToRemove);
    setCurrentTags(updatedTags);
    setProductForm({
      ...productForm,
      tags: updatedTags,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      const newImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setProductImages([...productImages, ...newImages]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductImages(
      productImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isLoading) return;

    // Validation - Check if product name is required
    if (!productForm.name || productForm.name.trim() === "") {
      setError("Product name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = {
      ...productForm,
      images: productImages.map((img) => img.file || img.preview),
    };

    try {
      let result;
      if (mode === "add") {
        result = await addProduct(formData);
        console.log("Product added successfully:", result);
      } else {
        result = await updateProduct(initialData.id, formData);
        console.log("Product updated successfully:", result);
      }
      
      // Success callback
      if (onSave) onSave(formData);
      
    } catch (error) {
      console.error(`Error ${mode === "add" ? "adding" : "updating"} product:`, error);
      
      // Enhanced error handling with specific messages
      let errorMessage = `Failed to ${mode === "add" ? "add" : "update"} product. `;
      
      if (error.code === 'permission-denied') {
        errorMessage += "You don't have permission to perform this action.";
      } else if (error.code === 'network-request-failed') {
        errorMessage += "Network error. Please check your internet connection.";
      } else if (error.code === 'storage/unauthorized') {
        errorMessage += "Failed to upload images. Please try again.";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }
      
      setError(errorMessage);
      
      // Optional: Show browser alert for critical errors
      if (error.code === 'permission-denied') {
        alert(`Access Denied: Unable to ${mode === "add" ? "add" : "update"} product. Please contact administrator.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // Prevent delete if already deleting or no product to delete
    if (isDeleting || mode !== "edit" || !initialData?.id) return;

    // Confirm deletion
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${productForm.name}"? This action cannot be undone.`
    );

    if (!isConfirmed) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteProduct(initialData.id);
      console.log("Product deleted successfully");
      
      // Success callback
      if (onDelete) onDelete(initialData.id);
      
    } catch (error) {
      console.error("Error deleting product:", error);
      
      // Enhanced error handling
      let errorMessage = "Failed to delete product. ";
      
      if (error.code === 'permission-denied') {
        errorMessage += "You don't have permission to delete this product.";
      } else if (error.code === 'network-request-failed') {
        errorMessage += "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }
      
      setError(errorMessage);
      
      // Show alert for critical errors
      if (error.code === 'permission-denied') {
        alert("Access Denied: Unable to delete product. Please contact administrator.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      {/* Enhanced error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {mode === "add" ? "Failed to Add Product" : "Failed to Update Product"}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={productForm.name}
              onChange={handleInputChange}
              placeholder="RGS Paal Nathy"
              disabled={isLoading}
              required
              className={!productForm.name && error && error.includes('Product name') ? 'border-red-500' : ''}
            />
            {!productForm.name && error && error.includes('Product name') && (
              <p className="text-red-500 text-sm">Product name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={productForm.description}
              onChange={handleInputChange}
              placeholder="Paal Nathy Cattle Feed Ration is fortified with Amino acids, probiotics, Phobiotic Extracts"
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={productForm.category}
              onValueChange={(value) => handleSelectChange("category", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Feed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Feed">Feed</SelectItem>
                <SelectItem value="Supplement">Supplement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="animal">Animal</Label>
            <Select
              value={productForm.animal}
              onValueChange={(value) => handleSelectChange("animal", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="animal">
                <SelectValue placeholder="Select Animal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cow">Cow</SelectItem>
                <SelectItem value="Goat">Goat</SelectItem>
                <SelectItem value="Chicken">Chicken</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand Name</Label>
            <Input
              id="brand"
              name="brand"
              value={productForm.brand}
              onChange={handleInputChange}
              placeholder="RGS"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={productForm.sku}
                onChange={handleInputChange}
                placeholder="#32A53"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                value={productForm.stockQuantity}
                onChange={handleInputChange}
                placeholder="211"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight/Volume</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={productForm.weight}
                onChange={handleInputChange}
                placeholder="Enter value"
                disabled={isLoading}
              />
            </div>
            {(productForm.category === "Feed" || productForm.category === "Supplement") && (
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={productForm.unit}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {productForm.category === "Feed" && (
                      <>
                        <SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="Grams">Grams</SelectItem>
                      </>
                    )}
                    {productForm.category === "Supplement" && (
                      <>
                        <SelectItem value="Litre">Litre</SelectItem>
                        <SelectItem value="MilliLiter">MilliLiter</SelectItem>
                        <SelectItem value="Grams">Grams</SelectItem>
                        <SelectItem value="Bolus">Bolus</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regularPrice">Regular Price</Label>
              <Input
                id="regularPrice"
                name="regularPrice"
                type="text"
                value={productForm.regularPrice}
                onChange={handleInputChange}
                placeholder="₹110.40"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price</Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="text"
                value={productForm.salePrice}
                onChange={handleInputChange}
                placeholder="₹450"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
                placeholder="Add a tag"
                className="rounded-r-none"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="rounded-l-none"
                style={{ backgroundColor: "#007539" }}
                disabled={isLoading}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Product Gallery</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Drop your images here, or browse
                  </p>
                  <p className="text-xs text-gray-400">jpeg, png are allowed</p>
                </div>
                <Input
                  id={`${mode}-productImage`}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isLoading}
                />
                <Button
                  type="button" // Ensure this is not a submit button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    document.getElementById(`${mode}-productImage`).click()
                  }
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Select Files"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {productImages.map((image, index) => (
                <div key={index} className="relative border rounded-md p-1">
                  <img
                    src={image.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/70 p-1 flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Uploaded
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1 h-auto"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div className="flex items-center justify-between w-full mt-4">
          {/* Left side - Delete button (only in edit mode) */}
          <div>
            {mode === "edit" && (
              <Button
                variant="destructive"
                type="button"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Product
                  </div>
                )}
              </Button>
            )}
          </div>

          {/* Right side - Cancel and Save buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isLoading || isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isDeleting || !productForm.name.trim()}
              style={{ backgroundColor: (isLoading || isDeleting) ? "#9CA3AF" : "#007539" }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === "add" ? "Adding Product..." : "Updating Product..."}
                </div>
              ) : mode === "add" ? (
                "Add Product"
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </form>
  );
}
