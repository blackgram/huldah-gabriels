import { db } from '../firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  desc: string;
  reviews: never[];
  display: string; // URL or path to image
  price: number;
  color: string;
  createdAt?: Date | string; // Can be Date or ISO string for Redux serialization
  updatedAt?: Date | string; // Can be Date or ISO string for Redux serialization
  isActive?: boolean; // For soft delete/disable products
  // Discount fields
  isOnSale?: boolean;
  discountPercentage?: number; // 0-100
  originalPrice?: number; // Original price before discount
  saleStartDate?: Date | string | Timestamp;
  saleEndDate?: Date | string | Timestamp;
}

export interface ProductInput {
  name: string;
  desc: string;
  display: string;
  price: number;
  color: string;
  isActive?: boolean;
  // Discount fields
  isOnSale?: boolean;
  discountPercentage?: number;
  originalPrice?: number;
  saleStartDate?: Date | string | Timestamp;
  saleEndDate?: Date | string | Timestamp;
}

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    
    // Try query with orderBy first
    try {
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const products: Product[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          // Ensure price is a number (convert from string if needed)
          const price = typeof data.price === 'string' 
            ? parseFloat(data.price) : data.price;
          const numPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
          
          // Handle discount fields
          const discountPercentage = typeof data.discountPercentage === 'number' ? data.discountPercentage : undefined;
          const originalPrice = typeof data.originalPrice === 'number' ? data.originalPrice : undefined;
          const isOnSale = data.isOnSale === true;
          const saleStartDate = data.saleStartDate?.toDate ? data.saleStartDate.toDate() : data.saleStartDate;
          const saleEndDate = data.saleEndDate?.toDate ? data.saleEndDate.toDate() : data.saleEndDate;
          
          return {
            id: doc.id,
            name: data.name || '',
            desc: data.desc || '',
            reviews: data.reviews || [],
            display: data.display || '',
            price: numPrice,
            color: data.color || '#000000',
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            isOnSale,
            discountPercentage,
            originalPrice,
            saleStartDate,
            saleEndDate,
          };
        }
      );

      return products;
    } catch (orderByError: any) {
      // If orderBy fails (missing index or createdAt field), fall back to simple query
      if (orderByError?.code === 'failed-precondition') {
        console.warn('[ProductService] Missing index. Using fallback query.');
      }
      
      // Fallback: Get all products without orderBy
      const snapshot = await getDocs(productsRef);
      
      const products: Product[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          // Ensure price is a number (convert from string if needed)
          const price = typeof data.price === 'string' 
            ? parseFloat(data.price) : data.price;
          const numPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
          
          // Handle discount fields
          const discountPercentage = typeof data.discountPercentage === 'number' ? data.discountPercentage : undefined;
          const originalPrice = typeof data.originalPrice === 'number' ? data.originalPrice : undefined;
          const isOnSale = data.isOnSale === true;
          const saleStartDate = data.saleStartDate?.toDate ? data.saleStartDate.toDate() : data.saleStartDate;
          const saleEndDate = data.saleEndDate?.toDate ? data.saleEndDate.toDate() : data.saleEndDate;
          
          return {
            id: doc.id,
            name: data.name || '',
            desc: data.desc || '',
            reviews: data.reviews || [],
            display: data.display || '',
            price: numPrice,
            color: data.color || '#000000',
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            isOnSale,
            discountPercentage,
            originalPrice,
            saleStartDate,
            saleEndDate,
          };
        }
      );

      // Sort by createdAt in memory if available, otherwise by name
      products.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return bDate.getTime() - aDate.getTime(); // Descending
        }
        return a.name.localeCompare(b.name); // Fallback to alphabetical
      });

      return products;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get active products only
export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    const allProducts = await getAllProducts();
    return allProducts.filter((product) => product.isActive !== false);
  } catch (error) {
    console.error('Error fetching active products:', error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return null;
    }

    const data = productSnap.data();
    // Ensure price is a number (convert from string if needed)
    const price = typeof data.price === 'string' 
      ? parseFloat(data.price) : data.price;
    const numPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    
    // Handle discount fields
    const discountPercentage = typeof data.discountPercentage === 'number' ? data.discountPercentage : undefined;
    const originalPrice = typeof data.originalPrice === 'number' ? data.originalPrice : undefined;
    const isOnSale = data.isOnSale === true;
    const saleStartDate = data.saleStartDate?.toDate ? data.saleStartDate.toDate() : data.saleStartDate;
    const saleEndDate = data.saleEndDate?.toDate ? data.saleEndDate.toDate() : data.saleEndDate;
    
    return {
      id: productSnap.id,
      name: data.name || '',
      desc: data.desc || '',
      reviews: data.reviews || [],
      display: data.display || '',
      price: numPrice,
      color: data.color || '#000000',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      isOnSale,
      discountPercentage,
      originalPrice,
      saleStartDate,
      saleEndDate,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData: ProductInput): Promise<string> => {
  try {
    const productsRef = collection(db, 'products');
    const newProductRef = doc(productsRef);

    // Convert dates to Timestamps if they're Date objects
    const saleStartDate = productData.saleStartDate instanceof Date 
      ? Timestamp.fromDate(productData.saleStartDate)
      : productData.saleStartDate;
    const saleEndDate = productData.saleEndDate instanceof Date
      ? Timestamp.fromDate(productData.saleEndDate)
      : productData.saleEndDate;

    const productToSave = {
      ...productData,
      reviews: [],
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      saleStartDate: saleStartDate || null,
      saleEndDate: saleEndDate || null,
    };

    await setDoc(newProductRef, productToSave);
    return newProductRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (
  productId: string,
  productData: Partial<ProductInput>
): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId);
    
    // Convert dates to Timestamps if they're Date objects
    const updateData: any = {
      ...productData,
      updatedAt: Timestamp.now(),
    };
    
    if (productData.saleStartDate instanceof Date) {
      updateData.saleStartDate = Timestamp.fromDate(productData.saleStartDate);
    } else if (productData.saleStartDate === null || productData.saleStartDate === undefined) {
      updateData.saleStartDate = null;
    }
    
    if (productData.saleEndDate instanceof Date) {
      updateData.saleEndDate = Timestamp.fromDate(productData.saleEndDate);
    } else if (productData.saleEndDate === null || productData.saleEndDate === undefined) {
      updateData.saleEndDate = null;
    }

    await updateDoc(productRef, updateData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product (hard delete)
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Soft delete/disable a product
export const toggleProductActive = async (
  productId: string,
  isActive: boolean
): Promise<void> => {
  try {
    await updateProduct(productId, { isActive });
  } catch (error) {
    console.error('Error toggling product active status:', error);
    throw error;
  }
};

