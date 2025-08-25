import { useState, useEffect, useRef } from "react";
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
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productsService";

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
    nameTamil: "",
    description: "",
    descriptionTamil: "",
    category: "Feed",
    brand: "",
    sku: "",
    stockQuantity: "",
    regularPrice: "",
    salePrice: "",
    status: "in_stock",
    image: "",
    tags: [],
    animal: "Cow",
    weight: "",
    unit: "KG",
  };

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productImages, setProductImages] = useState([]);
  const [currentTags, setCurrentTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const errorRef = useRef(null);

  const setErrorAndScroll = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    volume: "",
    unit: "ML",
    sku: "",
    regularPrice: "",
    salePrice: "",
    stockQuantity: "",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      // For Feed, prefill fields from the first variant if available
      let feedFields = {};
      if ((initialData.category || "Feed") === "Feed" && Array.isArray(initialData.variants) && initialData.variants.length > 0) {
        const v = initialData.variants[0];
        feedFields = {
          sku: v.sku || "",
          stockQuantity: v.stockQuantity || "",
          regularPrice: v.regularPrice || "",
          salePrice: v.salePrice || "",
          weight: v.volume || "",
          unit: v.unit || "",
          status: v.status || initialData.status || "in_stock",
        };
      }
      setProductForm({
        name: initialData.name || "",
        nameTamil: initialData.nameTamil || "",
        description: initialData.description || "",
        descriptionTamil: initialData.descriptionTamil || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        ...feedFields,
        image: initialData.image || "",
        tags: initialData.tags || "",
        animal: initialData.animal || "",
      });
      setCurrentTags(initialData.tags || []);
      if (initialData.gallery && Array.isArray(initialData.gallery)) {
        setProductImages(initialData.gallery.map((url) => ({ preview: url })));
      } else {
        setProductImages([]);
      }
      if (initialData.variants && Array.isArray(initialData.variants)) {
        setVariants(initialData.variants);
      } else {
        setVariants([]);
      }
    } else {
  setProductForm(emptyProductForm);
      setProductImages([]);
      setCurrentTags([]);
      setVariants([]);
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
    let updatedForm = {
      ...productForm,
      [name]: value,
    };

    // Auto-update unit when category changes
    if (name === "category") {
      if (value === "Feed") {
        updatedForm.unit = "KG";
        // Clear variants when switching to Feed
        setVariants([]);
      } else if (value === "Supplement") {
        updatedForm.unit = "Litre";
      }
    }

    setProductForm(updatedForm);
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

  const addVariant = () => {
    const isValid = (
      newVariant.volume && String(newVariant.volume).trim() !== "" && Number(newVariant.volume) > 0 &&
      newVariant.unit && String(newVariant.unit).trim() !== "" &&
      newVariant.sku && String(newVariant.sku).trim() !== "" &&
      newVariant.regularPrice && String(newVariant.regularPrice).trim() !== "" && Number(newVariant.regularPrice) > 0 &&
      newVariant.salePrice && String(newVariant.salePrice).trim() !== "" && Number(newVariant.salePrice) > 0 &&
      newVariant.stockQuantity && String(newVariant.stockQuantity).trim() !== "" && Number(newVariant.stockQuantity) > 0
    );

    if (isValid) {
      if (parseFloat(newVariant.salePrice) >= parseFloat(newVariant.regularPrice)) {
        setErrorAndScroll("Sale price must be less than regular price for variants");
        return;
      }
      setVariants(prev => [...prev, { ...newVariant }]);
      setNewVariant({
        volume: "",
        unit: "ML",
        sku: "",
        regularPrice: "",
        salePrice: "",
        stockQuantity: "",
      });
      setError("");
    } else {
      setErrorAndScroll("Please fill in all fields for the variant (volume, unit, SKU, regular price, sale price, and stock quantity). All numbers must be greater than zero.");
    }
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/jpg",
    ];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setErrorAndScroll("Only image files (jpeg, png, gif, webp) are allowed.");
      return;
    }
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

    // Comprehensive validation before Firebase processing
    if (!productForm.name || productForm.name.trim() === "") {
      setErrorAndScroll("Product name is required");
      return;
    }

    if (!productForm.description || productForm.description.trim() === "") {
      setErrorAndScroll("Product description is required");
      return;
    }

    if (!productForm.category || productForm.category.trim() === "") {
      setErrorAndScroll("Product category is required");
      return;
    }

    if (!productForm.animal || productForm.animal.trim() === "") {
      setErrorAndScroll("Animal selection is required");
      return;
    }

    if (!productForm.brand || productForm.brand.trim() === "") {
      setErrorAndScroll("Brand is required");
      return;
    }

    // Only validate these fields for Feed products (Supplement uses variants)
    if (productForm.category === "Feed") {
      if (!productForm.sku || productForm.sku.trim() === "") {
        setErrorAndScroll("SKU is required");
        return;
      }

      if (!productForm.stockQuantity || String(productForm.stockQuantity).trim() === "") {
        setErrorAndScroll("Stock quantity is required");
        return;
      }

      if (
        isNaN(productForm.stockQuantity) ||
        parseInt(productForm.stockQuantity) < 0
      ) {
        setErrorAndScroll("Stock quantity must be a valid positive number");
        return;
      }

      if (!productForm.weight || String(productForm.weight).trim() === "") {
        setErrorAndScroll("Weight is required");
        return;
      }

      if (isNaN(productForm.weight) || parseFloat(productForm.weight) <= 0) {
        setErrorAndScroll("Weight must be a valid positive number");
        return;
      }

      if (!productForm.unit || productForm.unit.trim() === "") {
        setErrorAndScroll("Unit selection is required");
        return;
      }

      if (!productForm.regularPrice || String(productForm.regularPrice).trim() === "") {
        setErrorAndScroll("Regular price is required");
        return;
      }

      if (
        isNaN(productForm.regularPrice) ||
        parseFloat(productForm.regularPrice) <= 0
      ) {
        setErrorAndScroll("Regular price must be a valid positive number");
        return;
      }

      if (!productForm.salePrice || String(productForm.salePrice).trim() === "") {
        setErrorAndScroll("Sale price is required");
        return;
      }

      if (
        isNaN(productForm.salePrice) ||
        parseFloat(productForm.salePrice) <= 0
      ) {
        setErrorAndScroll("Sale price must be a valid positive number");
        return;
      }

      // Validation - Check if regular price is greater than sale price
      const regularPrice = parseFloat(productForm.regularPrice);
      const salePrice = parseFloat(productForm.salePrice);
      if (regularPrice <= salePrice) {
        setErrorAndScroll("Regular price must be greater than sale price");
        return;
      }
    }

    // Validation - For Supplement products, require at least one valid variant (no empty/null fields)
    if (productForm.category === "Supplement") {
      const validVariants = variants.filter(v =>
        v && [v.volume, v.unit, v.sku, v.regularPrice, v.salePrice, v.stockQuantity].every(val => val !== null && val !== undefined && String(val).trim() !== "")
      );
      if (validVariants.length === 0) {
        setErrorAndScroll("At least one complete variant is required for Supplement products");
        return;
      }
    }

    // if (productImages.length === 0) {
    //   setError("At least one product image is required");
    //   return;
    // }

    // if (!currentTags || currentTags.length === 0) {
    //   setError("At least one tag is required");
    //   return;
    // }

    setIsLoading(true);
    setError("");

    let filteredVariants = variants;
    if (productForm.category === "Supplement") {
      filteredVariants = variants.filter(v =>
        v &&
        v.volume && String(v.volume).trim() !== "" && Number(v.volume) > 0 &&
        v.unit && String(v.unit).trim() !== "" &&
        v.sku && String(v.sku).trim() !== "" &&
        v.regularPrice && String(v.regularPrice).trim() !== "" && Number(v.regularPrice) > 0 &&
        v.salePrice && String(v.salePrice).trim() !== "" && Number(v.salePrice) > 0 &&
        v.stockQuantity && String(v.stockQuantity).trim() !== "" && Number(v.stockQuantity) > 0
      );
    }
    const formData = {
      ...productForm,
      images: productImages.map((img) => img.file || img.preview),
      ...(productForm.category === "Supplement" && filteredVariants.length > 0 && { variants: filteredVariants }),
    };

    try {
      let result;

      if (mode === "add") {
        result = await addProduct(formData);
        console.log("Product added successfully:", result);
      } else {
        result = await updateProduct(initialData.id, formData);
        console.log("Product updated successfully:", formData);
      }

      // Success callback
      if (onSave) onSave(formData);
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "adding" : "updating"} product:`,
        error
      );

      // Enhanced error handling with specific messages
      let errorMessage = `Failed to ${
        mode === "add" ? "add" : "update"
      } product. `;

      if (error.code === "permission-denied") {
        errorMessage += "You don't have permission to perform this action.";
      } else if (error.code === "network-request-failed") {
        errorMessage += "Network error. Please check your internet connection.";
      } else if (error.code === "storage/unauthorized") {
        errorMessage += "Failed to upload images. Please try again.";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }

      setErrorAndScroll(errorMessage);

      // Optional: Show browser alert for critical errors
      if (error.code === "permission-denied") {
        alert(
          `Access Denied: Unable to ${
            mode === "add" ? "add" : "update"
          } product. Please contact administrator.`
        );
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

      if (error.code === "permission-denied") {
        errorMessage += "You don't have permission to delete this product.";
      } else if (error.code === "network-request-failed") {
        errorMessage += "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }

      setErrorAndScroll(errorMessage);

      // Show alert for critical errors
      if (error.code === "permission-denied") {
        alert(
          "Access Denied: Unable to delete product. Please contact administrator."
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      {/* Enhanced error display */}
      {error && (
        <div 
          ref={errorRef}
          className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {mode === "add"
                  ? "Failed to Add Product"
                  : "Failed to Update Product"}
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
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
              disabled={isLoading}
              required
              className={
                !productForm.name && error && error.includes("Product name")
                  ? "border-red-500"
                  : ""
              }
            />
            {!productForm.name && error && error.includes("Product name") && (
              <p className="text-red-500 text-sm">Product name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameTamil">Product Name (Tamil)</Label>
            <Input
              id="nameTamil"
              name="nameTamil"
              value={productForm.nameTamil}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={productForm.description}
              onChange={handleInputChange}
              className="min-h-[100px]"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionTamil">Description (Tamil)</Label>
            <Textarea
              id="descriptionTamil"
              name="descriptionTamil"
              value={productForm.descriptionTamil}
              onChange={handleInputChange}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={productForm.category}
              onValueChange={(value) => handleSelectChange("category", value)}
              disabled={isLoading}
              required
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Feed">Feed</SelectItem>
                <SelectItem value="Supplement">Supplement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="animal">Animal *</Label>
            <Select
              value={productForm.animal}
              onValueChange={(value) => handleSelectChange("animal", value)}
              disabled={isLoading}
              required
            >
              <SelectTrigger id="animal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cow">Cow</SelectItem>
                <SelectItem value="Goat">Goat</SelectItem>
                <SelectItem value="Chicken">Chicken</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand Name *</Label>
            <Input
              id="brand"
              name="brand"
              value={productForm.brand}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          {productForm.category === "Feed" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={productForm.sku}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={productForm.weight}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={productForm.unit}
                    onValueChange={(value) => handleSelectChange("unit", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="Grams">Grams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Regular Price</Label>
                  <Input
                    id="regularPrice"
                    name="regularPrice"
                    type="number"
                    value={productForm.regularPrice}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    value={productForm.salePrice}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          )}

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

      {/* Variants Section for Supplement products */}
      {productForm.category === "Supplement" && (
        <div className="space-y-4 mt-6">
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Product Variants</h3>

            {/* Add New Variant */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700">
                Add New Variant
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variantVolume">Volume</Label>
                  <Input
                    id="variantVolume"
                    type="number"
                    value={newVariant.volume}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        volume: e.target.value,
                      }))
                    }
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantUnit">Unit</Label>
                  <Select
                    value={newVariant.unit}
                    onValueChange={(value) =>
                      setNewVariant((prev) => ({ ...prev, unit: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ML">ML</SelectItem>
                      <SelectItem value="Litre">Litre</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="Grams">Grams</SelectItem>
                      <SelectItem value="Bolus">Bolus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variantSku">SKU</Label>
                  <Input
                    id="variantSku"
                    type="text"
                    value={newVariant.sku}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        sku: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantStock">Stock Quantity</Label>
                  <Input
                    id="variantStock"
                    type="number"
                    value={newVariant.stockQuantity}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        stockQuantity: e.target.value,
                      }))
                    }
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variantRegularPrice">Regular Price</Label>
                  <Input
                    id="variantRegularPrice"
                    type="number"
                    value={newVariant.regularPrice}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        regularPrice: e.target.value,
                      }))
                    }
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantSalePrice">Sale Price</Label>
                  <Input
                    id="variantSalePrice"
                    type="number"
                    value={newVariant.salePrice}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        salePrice: e.target.value,
                      }))
                    }
                    onWheel={(e) => e.target.blur()}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={addVariant}
                  disabled={isLoading}
                  style={{ backgroundColor: "#007539" }}
                  className="w-full"
                >
                  Add Variant
                </Button>
              </div>
            </div>

            {/* Existing Variants List */}
            {variants.length > 0 && (
              <div className="space-y-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Current Variants
                </h4>
                <div className="space-y-2">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white"
                    >
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          {variant.volume} {variant.unit}
                        </Badge>
                        <span className="text-gray-800 font-medium">
                          SKU: {variant.sku}
                        </span>
                        <span className="text-gray-600">
                          Regular: ₹{variant.regularPrice}
                        </span>
                        {variant.salePrice && (
                          <span className="text-green-600">
                            Sale: ₹{variant.salePrice}
                          </span>
                        )}
                        <span className="text-gray-500">
                          Stock: {variant.stockQuantity}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              style={{
                backgroundColor:
                  isLoading || isDeleting ? "#9CA3AF" : "#007539",
              }}
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