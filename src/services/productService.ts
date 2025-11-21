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
}

export interface ProductInput {
  name: string;
  desc: string;
  display: string;
  price: number;
  color: string;
  isActive?: boolean;
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
          };
        }
      );

      console.log(`[ProductService] Fetched ${products.length} product(s) with orderBy`);
      return products;
    } catch (orderByError: any) {
      // If orderBy fails (missing index or createdAt field), fall back to simple query
      if (orderByError?.code === 'failed-precondition') {
        console.warn('[ProductService] OrderBy query failed (missing index or createdAt field). Using fallback query.');
        console.warn('[ProductService] To fix: Create an index on products collection for createdAt field, or add createdAt to all products.');
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

      console.log(`[ProductService] Fetched ${products.length} product(s) without orderBy (fallback)`);
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

    const productToSave = {
      ...productData,
      reviews: [],
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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
    const updateData = {
      ...productData,
      updatedAt: Timestamp.now(),
    };

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

