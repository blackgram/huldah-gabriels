/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '../firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productId?: string; // Optional: if we want to link back to products
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface Order {
  id: string;
  paymentMethod: 'stripe' | 'paystack' | 'paypal';
  transactionReference: string; // Stripe session_id, Paystack reference, PayPal order_id
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCountry: string;
  amount: number;
  currency: string;
  items: OrderItem[];
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  notes?: string; // Admin notes
  trackingNumber?: string; // Tracking number for shipped orders
  courier?: string; // Shipping courier name
}

export interface OrderInput {
  paymentMethod: 'stripe' | 'paystack' | 'paypal';
  transactionReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCountry: string;
  amount: number;
  currency: string;
  items: OrderItem[];
  paymentStatus: PaymentStatus;
  orderStatus?: OrderStatus;
  notes?: string;
  discountCode?: string;
  discountAmount?: number;
}

// Create a new order
export const createOrder = async (orderInput: OrderInput): Promise<string> => {
  try {
    const ordersRef = collection(db, 'orders');
    const newOrderRef = doc(ordersRef);
    const orderId = newOrderRef.id;

    const orderData = {
      ...orderInput,
      orderStatus: orderInput.orderStatus || 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(newOrderRef, orderData);
    return orderId;
  } catch (error) {
    console.error('[OrderService] Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

// Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const orders: Order[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
      }
    );

    return orders;
  } catch (error) {
    console.error('[OrderService] Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return null;
    }

    const data = orderSnap.data();
    return {
      id: orderSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Order;
  } catch (error) {
    console.error('[OrderService] Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  orderStatus: Order['orderStatus'],
  notes?: string,
  trackingNumber?: string,
  courier?: string
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = {
      orderStatus,
      updatedAt: Timestamp.now(),
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (courier !== undefined) {
      updateData.courier = courier;
    }

    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('[OrderService] Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
};

// Update payment status
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: Order['paymentStatus']
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentStatus,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[OrderService] Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
};

// Get orders by status
export const getOrdersByStatus = async (
  orderStatus: Order['orderStatus']
): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('orderStatus', '==', orderStatus),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const orders: Order[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
      }
    );

    return orders;
  } catch (error) {
    console.error('[OrderService] Error fetching orders by status:', error);
    throw new Error('Failed to fetch orders by status');
  }
};

// Get orders statistics
export const getOrderStatistics = async (): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}> => {
  try {
    const orders = await getAllOrders();
    
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.amount, 0),
      pendingOrders: orders.filter((o) => o.orderStatus === 'pending').length,
      processingOrders: orders.filter((o) => o.orderStatus === 'processing').length,
      shippedOrders: orders.filter((o) => o.orderStatus === 'shipped').length,
      deliveredOrders: orders.filter((o) => o.orderStatus === 'delivered').length,
      cancelledOrders: orders.filter((o) => o.orderStatus === 'cancelled').length,
    };

    return stats;
  } catch (error) {
    console.error('[OrderService] Error fetching order statistics:', error);
    throw new Error('Failed to fetch order statistics');
  }
};

