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
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  increment,
} from 'firebase/firestore';

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountCode {
  id: string;
  code: string; // The discount code (e.g., "SAVE20", "WELCOME10")
  type: DiscountType; // 'percentage' or 'fixed'
  value: number; // Percentage (0-100) or fixed amount in dollars
  isActive: boolean;
  startDate?: Date | string | Timestamp;
  endDate?: Date | string | Timestamp;
  usageLimit?: number; // Maximum number of times this code can be used (optional)
  usageCount: number; // Current number of times used
  minPurchaseAmount?: number; // Minimum order amount required (optional)
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string; // Admin user ID who created it
  description?: string; // Optional description
}

export interface DiscountCodeInput {
  code: string;
  type: DiscountType;
  value: number;
  isActive: boolean;
  startDate?: Date | string | Timestamp;
  endDate?: Date | string | Timestamp;
  usageLimit?: number;
  minPurchaseAmount?: number;
  description?: string;
}

export interface DiscountCodeUsage {
  id?: string;
  codeId: string;
  code: string;
  orderId: string;
  userId?: string;
  email: string;
  discountAmount: number;
  orderTotal: number;
  timestamp: any;
}

// Get all discount codes
export const getAllDiscountCodes = async (): Promise<DiscountCode[]> => {
  try {
    const codesRef = collection(db, 'discountCodes');
    const q = query(codesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const codes: DiscountCode[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          code: data.code || '',
          type: data.type || 'percentage',
          value: data.value || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
          endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
          usageLimit: data.usageLimit,
          usageCount: data.usageCount || 0,
          minPurchaseAmount: data.minPurchaseAmount,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          createdBy: data.createdBy,
          description: data.description,
        };
      }
    );

    return codes;
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    throw error;
  }
};

// Get active discount codes only
export const getActiveDiscountCodes = async (): Promise<DiscountCode[]> => {
  try {
    const allCodes = await getAllDiscountCodes();
    return allCodes.filter((code) => code.isActive !== false);
  } catch (error) {
    console.error('Error fetching active discount codes:', error);
    throw error;
  }
};

// Get a discount code by ID
export const getDiscountCodeById = async (codeId: string): Promise<DiscountCode | null> => {
  try {
    const codeRef = doc(db, 'discountCodes', codeId);
    const codeSnap = await getDoc(codeRef);

    if (!codeSnap.exists()) {
      return null;
    }

    const data = codeSnap.data();
    return {
      id: codeSnap.id,
      code: data.code || '',
      type: data.type || 'percentage',
      value: data.value || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
      endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
      usageLimit: data.usageLimit,
      usageCount: data.usageCount || 0,
      minPurchaseAmount: data.minPurchaseAmount,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      createdBy: data.createdBy,
      description: data.description,
    };
  } catch (error) {
    console.error('Error fetching discount code:', error);
    throw error;
  }
};

// Validate and get discount code by code string
export const validateDiscountCode = async (
  code: string,
  orderTotal: number
): Promise<{ valid: boolean; discountCode?: DiscountCode; discountAmount?: number; error?: string }> => {
  try {
    const codesRef = collection(db, 'discountCodes');
    const q = query(codesRef, where('code', '==', code.toUpperCase().trim()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { valid: false, error: 'Discount code not found' };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const discountCode: DiscountCode = {
      id: doc.id,
      code: data.code || '',
      type: data.type || 'percentage',
      value: data.value || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
      endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
      usageLimit: data.usageLimit,
      usageCount: data.usageCount || 0,
      minPurchaseAmount: data.minPurchaseAmount,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      createdBy: data.createdBy,
      description: data.description,
    };

    // Check if code is active
    if (!discountCode.isActive) {
      return { valid: false, error: 'This discount code is not active' };
    }

    // Check date validity
    const now = new Date();
    if (discountCode.startDate) {
      let startDate: Date;
      if (discountCode.startDate instanceof Date) {
        startDate = discountCode.startDate;
      } else if (typeof discountCode.startDate === 'string') {
        startDate = new Date(discountCode.startDate);
      } else if (discountCode.startDate && typeof discountCode.startDate === 'object' && 'toDate' in discountCode.startDate) {
        // Handle Firebase Timestamp
        startDate = (discountCode.startDate as Timestamp).toDate();
      } else {
        return { valid: false, error: 'Invalid start date' };
      }
      if (now < startDate) {
        return { valid: false, error: 'This discount code is not yet valid' };
      }
    }
    if (discountCode.endDate) {
      let endDate: Date;
      if (discountCode.endDate instanceof Date) {
        endDate = discountCode.endDate;
      } else if (typeof discountCode.endDate === 'string') {
        endDate = new Date(discountCode.endDate);
      } else if (discountCode.endDate && typeof discountCode.endDate === 'object' && 'toDate' in discountCode.endDate) {
        // Handle Firebase Timestamp
        endDate = (discountCode.endDate as Timestamp).toDate();
      } else {
        return { valid: false, error: 'Invalid end date' };
      }
      if (now > endDate) {
        return { valid: false, error: 'This discount code has expired' };
      }
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return { valid: false, error: 'This discount code has reached its usage limit' };
    }

    // Check minimum purchase amount
    if (discountCode.minPurchaseAmount && orderTotal < discountCode.minPurchaseAmount) {
      return { valid: false, error: `Minimum purchase amount of $${discountCode.minPurchaseAmount} required` };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.type === 'percentage') {
      discountAmount = (orderTotal * discountCode.value) / 100;
    } else {
      discountAmount = Math.min(discountCode.value, orderTotal); // Fixed amount, but can't exceed order total
    }

    return { valid: true, discountCode, discountAmount };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { valid: false, error: 'Error validating discount code' };
  }
};

// Create a new discount code
export const createDiscountCode = async (
  codeData: DiscountCodeInput,
  createdBy?: string
): Promise<string> => {
  try {
    const codesRef = collection(db, 'discountCodes');
    const newCodeRef = doc(codesRef);

    // Check if code already exists
    const existingCodes = await getAllDiscountCodes();
    const codeExists = existingCodes.some(
      (code) => code.code.toUpperCase() === codeData.code.toUpperCase().trim()
    );
    if (codeExists) {
      throw new Error('A discount code with this name already exists');
    }

    const codeToSave = {
      ...codeData,
      code: codeData.code.toUpperCase().trim(),
      usageCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: createdBy || null,
      startDate: codeData.startDate instanceof Date 
        ? Timestamp.fromDate(codeData.startDate)
        : codeData.startDate || null,
      endDate: codeData.endDate instanceof Date
        ? Timestamp.fromDate(codeData.endDate)
        : codeData.endDate || null,
    };

    await setDoc(newCodeRef, codeToSave);
    return newCodeRef.id;
  } catch (error) {
    console.error('Error creating discount code:', error);
    throw error;
  }
};

// Update a discount code
export const updateDiscountCode = async (
  codeId: string,
  codeData: Partial<DiscountCodeInput>
): Promise<void> => {
  try {
    const codeRef = doc(db, 'discountCodes', codeId);
    
    const updateData: any = {
      ...codeData,
      updatedAt: Timestamp.now(),
    };

    if (codeData.code) {
      updateData.code = codeData.code.toUpperCase().trim();
    }

    if (codeData.startDate instanceof Date) {
      updateData.startDate = Timestamp.fromDate(codeData.startDate);
    } else if (codeData.startDate === null || codeData.startDate === undefined) {
      updateData.startDate = null;
    }

    if (codeData.endDate instanceof Date) {
      updateData.endDate = Timestamp.fromDate(codeData.endDate);
    } else if (codeData.endDate === null || codeData.endDate === undefined) {
      updateData.endDate = null;
    }

    await updateDoc(codeRef, updateData);
  } catch (error) {
    console.error('Error updating discount code:', error);
    throw error;
  }
};

// Delete a discount code
export const deleteDiscountCode = async (codeId: string): Promise<void> => {
  try {
    const codeRef = doc(db, 'discountCodes', codeId);
    await deleteDoc(codeRef);
  } catch (error) {
    console.error('Error deleting discount code:', error);
    throw error;
  }
};

// Toggle discount code active status
export const toggleDiscountCodeActive = async (
  codeId: string,
  isActive: boolean
): Promise<void> => {
  try {
    await updateDiscountCode(codeId, { isActive });
  } catch (error) {
    console.error('Error toggling discount code status:', error);
    throw error;
  }
};

// Record discount code usage (called when order is placed)
export const recordDiscountCodeUsage = async (
  codeId: string,
  code: string,
  orderId: string,
  email: string,
  discountAmount: number,
  orderTotal: number,
  userId?: string
): Promise<void> => {
  try {
    // Increment usage count
    const codeRef = doc(db, 'discountCodes', codeId);
    await updateDoc(codeRef, {
      usageCount: increment(1),
      updatedAt: Timestamp.now(),
    });

    // Record usage in usage collection
    const usageRef = collection(db, 'discountCodeUsage');
    await setDoc(doc(usageRef), {
      codeId,
      code,
      orderId,
      userId: userId || null,
      email,
      discountAmount,
      orderTotal,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error recording discount code usage:', error);
    throw error;
  }
};

// Get discount code usage history
export const getDiscountCodeUsage = async (codeId?: string): Promise<DiscountCodeUsage[]> => {
  try {
    const usageRef = collection(db, 'discountCodeUsage');
    let q;
    
    if (codeId) {
      q = query(usageRef, where('codeId', '==', codeId), orderBy('timestamp', 'desc'));
    } else {
      q = query(usageRef, orderBy('timestamp', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        codeId: data.codeId,
        code: data.code,
        orderId: data.orderId,
        userId: data.userId,
        email: data.email,
        discountAmount: data.discountAmount,
        orderTotal: data.orderTotal,
        timestamp: data.timestamp,
      };
    });
  } catch (error) {
    console.error('Error fetching discount code usage:', error);
    throw error;
  }
};

