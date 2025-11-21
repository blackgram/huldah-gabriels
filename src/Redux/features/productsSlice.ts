import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAllProducts, getActiveProducts, Product } from "../../services/productService";

export interface ProductsState {
  products: Product[];
  activeProducts: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  activeProducts: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch all products
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const products = await getAllProducts();
      return products;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
    }
  }
);

// Async thunk to fetch active products only
export const fetchActiveProducts = createAsyncThunk(
  "products/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const products = await getActiveProducts();
      return products;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch active products"
      );
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.activeProducts = action.payload.filter(
        (product) => product.isActive !== false
      );
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
      if (action.payload.isActive !== false) {
        state.activeProducts.push(action.payload);
      }
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
        // Update active products list
        const activeIndex = state.activeProducts.findIndex(
          (p) => p.id === action.payload.id
        );
        if (action.payload.isActive !== false) {
          if (activeIndex === -1) {
            state.activeProducts.push(action.payload);
          } else {
            state.activeProducts[activeIndex] = action.payload;
          }
        } else {
          // Remove from active products if disabled
          if (activeIndex !== -1) {
            state.activeProducts.splice(activeIndex, 1);
          }
        }
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
      state.activeProducts = state.activeProducts.filter(
        (p) => p.id !== action.payload
      );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Convert Date objects to ISO strings for Redux serialization
        const serializedProducts = action.payload.map(product => ({
          ...product,
          createdAt: product.createdAt instanceof Date 
            ? product.createdAt.toISOString() 
            : product.createdAt,
          updatedAt: product.updatedAt instanceof Date 
            ? product.updatedAt.toISOString() 
            : product.updatedAt,
        }));
        state.products = serializedProducts;
        state.activeProducts = serializedProducts.filter(
          (product) => product.isActive !== false
        );
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch active products
      .addCase(fetchActiveProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Convert Date objects to ISO strings for Redux serialization
        const serializedProducts = action.payload.map(product => ({
          ...product,
          createdAt: product.createdAt instanceof Date 
            ? product.createdAt.toISOString() 
            : product.createdAt,
          updatedAt: product.updatedAt instanceof Date 
            ? product.updatedAt.toISOString() 
            : product.updatedAt,
        }));
        state.activeProducts = serializedProducts;
        // Also update products list if needed
        state.products = serializedProducts;
      })
      .addCase(fetchActiveProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  clearError,
} = productsSlice.actions;

export default productsSlice.reducer;

