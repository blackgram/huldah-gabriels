/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Redux/store";
import {
  fetchAllProducts,
  addProduct,
  updateProduct,
  removeProduct,
} from "../../Redux/features/productsSlice";
import {
  createProduct,
  updateProduct as updateProductService,
  deleteProduct,
  toggleProductActive,
  Product,
  ProductInput,
} from "../../services/productService";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../../Hooks/useAuth";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";
import { getProductImageUrl } from "../../Utils/imageUtils";
import { uploadProductImage } from "../../services/imageUploadService";

interface ProductFormData {
  name: string;
  desc: string;
  display: string;
  price: number;
  color: string;
  isActive: boolean;
  // Discount fields
  isOnSale: boolean;
  discountPercentage: number;
  originalPrice: number;
  saleStartDate: string;
  saleEndDate: string;
}

const AdminProducts: React.FC = () => {
  const { isAdmin } = useAuth();
  const dispatch: AppDispatch = useDispatch();
  const { products, isLoading } = useSelector(
    (state: RootState) => state.data.products
  );

  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    desc: "",
    display: "",
    price: 0,
    color: "#000000",
    isActive: true,
    isOnSale: false,
    discountPercentage: 0,
    originalPrice: 0,
    saleStartDate: "",
    saleEndDate: "",
  });
  const [formError, setFormError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [useImageUpload, setUseImageUpload] = useState<boolean>(true); // Toggle between upload and URL input

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) => {
          const priceStr = typeof product.price === 'number' 
            ? product.price.toString() 
            : String(product.price || 0);
          return (
            product.name.toLowerCase().includes(query) ||
            product.desc.toLowerCase().includes(query) ||
            priceStr.includes(query)
          );
        }
      );
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((product) => product.isActive !== false);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((product) => product.isActive === false);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name": {
          comparison = a.name.localeCompare(b.name);
          break;
        }
        case "price": {
          const aPrice = typeof a.price === 'number' ? a.price : parseFloat(String(a.price || 0));
          const bPrice = typeof b.price === 'number' ? b.price : parseFloat(String(b.price || 0));
          comparison = aPrice - bPrice;
          break;
        }
        case "createdAt": {
          const aDate = a.createdAt 
            ? (a.createdAt instanceof Date 
                ? a.createdAt.getTime() 
                : new Date(a.createdAt as string).getTime())
            : 0;
          const bDate = b.createdAt 
            ? (b.createdAt instanceof Date 
                ? b.createdAt.getTime() 
                : new Date(b.createdAt as string).getTime())
            : 0;
          comparison = aDate - bDate;
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => {
      const updates: any = {};
      
      if (name === "price" || name === "discountPercentage" || name === "originalPrice") {
        updates[name] = parseFloat(value) || 0;
      } else if (name === "isActive" || name === "isOnSale") {
        updates[name] = type === "checkbox" ? checked : value === "true";
      } else {
        updates[name] = value;
      }
      
      // Auto-calculate original price when discount is enabled
      if (name === "isOnSale" && checked && !prev.originalPrice) {
        updates.originalPrice = prev.price;
      }
      
      // Auto-calculate discount percentage if original price changes
      if (name === "originalPrice" && prev.isOnSale && prev.price) {
        const original = parseFloat(value) || prev.price;
        const current = prev.price;
        if (original > current) {
          updates.discountPercentage = Math.round(((original - current) / original) * 100);
        }
      }
      
      // Auto-calculate price when discount percentage changes
      if (name === "discountPercentage" && prev.isOnSale && prev.originalPrice) {
        const discount = parseFloat(value) || 0;
        const original = prev.originalPrice || prev.price;
        updates.price = Math.max(0, original - (original * discount / 100));
      }
      
      return { ...prev, ...updates };
    });
  };

  const resetForm = (): void => {
    setFormData({
      name: "",
      desc: "",
      display: "",
      price: 0,
      color: "#000000",
      isActive: true,
      isOnSale: false,
      discountPercentage: 0,
      originalPrice: 0,
      saleStartDate: "",
      saleEndDate: "",
    });
    setEditingProduct(null);
    setFormError("");
    setIsFormOpen(false);
    setImageFile(null);
    setImagePreview("");
    setUseImageUpload(true);
  };

  const handleEdit = (product: Product): void => {
    setEditingProduct(product);
    
    // Format dates for input fields
    const formatDateForInput = (date?: Date | string | Timestamp): string => {
      if (!date) return "";
      let d: Date;
      if (date instanceof Date) {
        d = date;
      } else if (typeof date === 'string') {
        d = new Date(date);
      } else if (date && typeof date === 'object' && 'toDate' in date) {
        // Handle Firebase Timestamp
        d = (date as Timestamp).toDate();
      } else {
        return "";
      }
      return d.toISOString().split('T')[0];
    };
    
    setFormData({
      name: product.name,
      desc: product.desc,
      display: product.display,
      price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0)),
      color: product.color,
      isActive: product.isActive !== false,
      isOnSale: product.isOnSale || false,
      discountPercentage: product.discountPercentage || 0,
      originalPrice: product.originalPrice || product.price,
      saleStartDate: formatDateForInput(product.saleStartDate),
      saleEndDate: formatDateForInput(product.saleEndDate),
    });
    
    // Set image preview for existing product
    setImagePreview(product.display);
    setImageFile(null);
    setUseImageUpload(false); // Default to URL input when editing
    
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.name.trim() || !formData.desc.trim()) {
      setFormError("Name and description are required");
      return;
    }

    if (formData.price <= 0) {
      setFormError("Price must be greater than 0");
      return;
    }

    // Validate image
    let imageUrl = formData.display.trim();
    
    if (useImageUpload) {
      if (!imageFile) {
        setFormError("Please select an image file or switch to URL input");
        return;
      }
    } else {
      if (!imageUrl) {
        setFormError("Please provide an image URL or upload an image file");
        return;
      }
    }

    setIsAdding(true);
    setIsUploadingImage(true);

    try {
      // Upload image if file is selected
      if (useImageUpload && imageFile) {
        try {
          const uploadResult = await uploadProductImage(
            imageFile,
            editingProduct?.id,
            { 
              maxSizeMB: 10, // Allow up to 10MB before compression
              maxWidth: 1200, // Max width 1200px
              maxHeight: 1200, // Max height 1200px
              quality: 0.8, // 80% quality
              maxBase64SizeKB: 700 // Target 700KB base64 (under Firestore 1MB limit)
            }
          );
          imageUrl = uploadResult.url;
          toast.success("Image compressed and uploaded successfully");
        } catch (uploadError: any) {
          console.error("Error uploading image:", uploadError);
          setFormError(uploadError.message || "Failed to upload image");
          toast.error("Failed to upload image");
          setIsUploadingImage(false);
          setIsAdding(false);
          return;
        }
      }

      setIsUploadingImage(false);

      // Prepare discount data
      const discountData: any = {};
      if (formData.isOnSale) {
        discountData.isOnSale = true;
        discountData.discountPercentage = formData.discountPercentage;
        discountData.originalPrice = formData.originalPrice || formData.price;
        if (formData.saleStartDate) {
          discountData.saleStartDate = new Date(formData.saleStartDate);
        }
        if (formData.saleEndDate) {
          discountData.saleEndDate = new Date(formData.saleEndDate);
        }
      } else {
        discountData.isOnSale = false;
        discountData.discountPercentage = null;
        discountData.originalPrice = null;
        discountData.saleStartDate = null;
        discountData.saleEndDate = null;
      }
      
      const productInput: ProductInput = {
        name: formData.name.trim(),
        desc: formData.desc.trim(),
        display: imageUrl,
        price: formData.price,
        color: formData.color,
        isActive: formData.isActive,
        ...discountData,
      };

      if (editingProduct) {
        // Update existing product
        await updateProductService(editingProduct.id, productInput);
        dispatch(
          updateProduct({
            ...editingProduct,
            ...productInput,
          } as Product)
        );
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        const productId = await createProduct(productInput);
        const newProduct: Product = {
          id: productId,
          ...productInput,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch(addProduct(newProduct));
        toast.success("Product created successfully!");
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Error saving product:", error);
      setFormError(error.message || "Failed to save product");
      toast.error("Failed to save product");
    } finally {
      setIsAdding(false);
      setIsUploadingImage(false);
    }
  };

  const handleDelete = async (productId: string): Promise<void> => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProduct(productId);
      dispatch(removeProduct(productId));
      toast.success("Product deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleToggleActive = async (
    product: Product,
    isActive: boolean
  ): Promise<void> => {
    try {
      await toggleProductActive(product.id, isActive);
      dispatch(
        updateProduct({
          ...product,
          isActive,
        })
      );
      toast.success(
        `Product ${isActive ? "activated" : "deactivated"} successfully!`
      );
    } catch (error: any) {
      console.error("Error toggling product status:", error);
      toast.error("Failed to update product status");
    }
  };

  // If not an admin, show access denied
  if (!isAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center py-10 text-center">
          <div className="text-red-500">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You don't have permission to manage products.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow lg:max-w-[90%] xl:max-w-[100%]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Management</h2>
        {!isFormOpen && !editingProduct && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add New Product
          </button>
        )}
      </div>

      {/* Product Form */}
      {(isFormOpen || editingProduct) && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close form"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
                placeholder="e.g., Clear Lustre"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              rows={4}
              placeholder="Product description..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Image *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseImageUpload(!useImageUpload);
                    setImageFile(null);
                    setImagePreview("");
                    if (!useImageUpload) {
                      setFormData({ ...formData, display: "" });
                    }
                  }}
                  className="text-xs text-primary hover:text-primary/80 underline"
                >
                  {useImageUpload ? "Use URL instead" : "Upload file instead"}
                </button>
              </div>
              
              {useImageUpload ? (
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageFileChange}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    disabled={isUploadingImage || isAdding}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPEG, PNG, WebP (Max 10MB, automatically compressed to fit Firestore limits)
                  </p>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    name="display"
                    value={formData.display}
                    onChange={(e) => {
                      handleInputChange(e);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded p-2"
                    placeholder="https://example.com/image.jpg or /assets/image.jpg"
                    disabled={isUploadingImage || isAdding}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={getProductImageUrl({ display: imagePreview, name: formData.name })}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color (Hex) *
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="flex-1 border border-gray-300 rounded p-2"
                  placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="isActive"
              value={formData.isActive.toString()}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Discount/Sale Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold mb-3">Sale & Discount Settings</h4>
            
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={formData.isOnSale}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">Enable Sale/Discount</span>
              </label>
            </div>

            {formData.isOnSale && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price ($) *
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required={formData.isOnSale}
                    />
                    <p className="text-xs text-gray-500 mt-1">Price before discount</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2"
                      placeholder="0"
                      step="1"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">0-100%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Start Date
                    </label>
                    <input
                      type="date"
                      name="saleStartDate"
                      value={formData.saleStartDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale End Date
                    </label>
                    <input
                      type="date"
                      name="saleEndDate"
                      value={formData.saleEndDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>

                {formData.originalPrice > 0 && formData.discountPercentage > 0 && (
                  <div className="bg-white p-3 rounded border border-primary/20">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Sale Price:</span> ${formData.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Original: ${formData.originalPrice.toFixed(2)} - {formData.discountPercentage}% = ${formData.price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isAdding || isUploadingImage}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploadingImage ? (
                <>
                  <ScaleLoader color="#fff" height={16} width={2} />
                  Uploading image...
                </>
              ) : isAdding ? (
                <>
                  <ScaleLoader color="#fff" height={16} width={2} />
                  Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        </div>
      )}

      {/* Products List */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium">
              Products ({filteredAndSortedProducts.length} of {products.length})
            </h3>
            <button
              onClick={() => dispatch(fetchAllProducts())}
              className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-sm"
              disabled={isLoading}
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "price" | "createdAt")}
                className="px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <ScaleLoader color="#946A2E" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No products found. Create your first product above!</p>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No products match your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/64";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        {product.isOnSale && product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ${typeof product.originalPrice === 'number' ? product.originalPrice.toFixed(2) : parseFloat(String(product.originalPrice || 0)).toFixed(2)}
                          </span>
                        )}
                        <span className={product.isOnSale ? "text-primary font-semibold" : ""}>
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price || 0)).toFixed(2)}
                        </span>
                        {product.isOnSale && product.discountPercentage && (
                          <span className="text-xs text-red-600 font-semibold">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.createdAt
                        ? new Date(product.createdAt as string | Date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActive(
                              product,
                              product.isActive === false
                            )
                          }
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {product.isActive !== false ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

