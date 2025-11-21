import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, Order, OrderStatus } from '../../services/orderService';
import { ScaleLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { FiEye } from 'react-icons/fi';
import { useAuth } from '../../Hooks/useAuth';

const AdminOrders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    orderId: string;
    newStatus: OrderStatus;
  } | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
  }, [isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setPendingStatusUpdate({ orderId, newStatus });
    setShowConfirmModal(true);
    // Reset tracking fields if not shipping
    if (newStatus !== 'shipped') {
      setTrackingNumber('');
      setCourier('');
    }
  };

  const handleStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;

    const { orderId, newStatus } = pendingStatusUpdate;
    setIsUpdating(true);

    try {
      // Update order status in Firestore
      await updateOrderStatus(
        orderId,
        newStatus,
        undefined,
        newStatus === 'shipped' ? trackingNumber : undefined,
        newStatus === 'shipped' ? courier : undefined
      );

      // Get the order details for email
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        // Prepare updated order details for email
        const updatedOrderDetails = {
          ...order,
          orderStatus: newStatus,
          trackingNumber: newStatus === 'shipped' ? trackingNumber : order.trackingNumber,
          courier: newStatus === 'shipped' ? courier : order.courier,
        };

        // Send status update email
        try {
          await fetch('/api/send-order-status-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderDetails: updatedOrderDetails,
              newStatus,
              trackingNumber: newStatus === 'shipped' ? trackingNumber : undefined,
              courier: newStatus === 'shipped' ? courier : undefined,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
          // Don't block the update if email fails
        }
      }

      toast.success('Order status updated successfully');
      setShowConfirmModal(false);
      setPendingStatusUpdate(null);
      setTrackingNumber('');
      setCourier('');
      fetchOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ 
          ...selectedOrder, 
          orderStatus: newStatus,
          trackingNumber: newStatus === 'shipped' ? trackingNumber : selectedOrder.trackingNumber,
          courier: newStatus === 'shipped' ? courier : selectedOrder.courier,
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'stripe':
        return 'bg-indigo-100 text-indigo-800';
      case 'paystack':
        return 'bg-green-100 text-green-800';
      case 'paypal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow lg:max-w-[90%] xl:max-w-[100%] flex items-center justify-center min-h-[400px]">
        <ScaleLoader color="#946A2E" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow lg:max-w-[90%] xl:max-w-[100%]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Order Management</h2>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by customer name, email, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-mono text-xs">{order.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {order.currency.toUpperCase()} {order.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                        order.paymentMethod
                      )}`}
                    >
                      {order.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Order ID</label>
                  <p className="text-sm font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction Reference</label>
                  <p className="text-sm font-mono">{selectedOrder.transactionReference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="text-sm capitalize">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <p className="text-sm capitalize">{selectedOrder.paymentStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Status</label>
                  <p className="text-sm capitalize">{selectedOrder.orderStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Amount</label>
                  <p className="text-sm font-semibold">
                    {selectedOrder.currency.toUpperCase()} {selectedOrder.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Country</label>
                    <p className="text-sm">{selectedOrder.customerCountry}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-sm">{selectedOrder.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        {selectedOrder.currency.toUpperCase()}{' '}
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Information (if shipped) */}
              {selectedOrder.orderStatus === 'shipped' && (selectedOrder.trackingNumber || selectedOrder.courier) && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-semibold mb-3">Shipping Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.trackingNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                        <p className="text-sm font-mono font-semibold">{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                    {selectedOrder.courier && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Courier</label>
                        <p className="text-sm">{selectedOrder.courier}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-sm">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm">
                    {new Date(selectedOrder.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {showConfirmModal && pendingStatusUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-primary">Confirm Status Update</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to update this order status to{' '}
                <span className="font-semibold capitalize">{pendingStatusUpdate.newStatus}</span>?
              </p>

              {pendingStatusUpdate.newStatus === 'shipped' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number *
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Courier/Shipping Company *
                    </label>
                    <input
                      type="text"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      placeholder="e.g., DHL, FedEx, UPS"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  {(!trackingNumber || !courier) && (
                    <p className="text-sm text-red-500">
                      Please provide both tracking number and courier information.
                    </p>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-500">
                An email notification will be sent to the customer.
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingStatusUpdate(null);
                  setTrackingNumber('');
                  setCourier('');
                }}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={
                  isUpdating ||
                  (pendingStatusUpdate.newStatus === 'shipped' && (!trackingNumber || !courier))
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
