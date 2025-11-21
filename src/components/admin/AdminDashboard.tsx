import { useEffect, useState } from 'react';
import { getOrderStatistics } from '../../services/orderService';
import { ScaleLoader } from 'react-spinners';
import { useAuth } from '../../Hooks/useAuth';
import { FiDollarSign, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statistics = await getOrderStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching order statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md lg:max-w-[90%] xl:max-w-[100%]">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md lg:max-w-[90%] xl:max-w-[100%] flex items-center justify-center min-h-[400px]">
        <ScaleLoader color="#946A2E" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md lg:max-w-[90%] xl:max-w-[100%]">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'bg-green-100 text-green-800',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: FiPackage,
      color: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: FiClock,
      color: 'bg-yellow-100 text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Processing',
      value: stats.processingOrders.toString(),
      icon: FiTruck,
      color: 'bg-purple-100 text-purple-800',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Shipped',
      value: stats.shippedOrders.toString(),
      icon: FiTruck,
      color: 'bg-indigo-100 text-indigo-800',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Delivered',
      value: stats.deliveredOrders.toString(),
      icon: FiCheckCircle,
      color: 'bg-green-100 text-green-800',
      iconColor: 'text-green-600',
    },
    {
      title: 'Cancelled',
      value: stats.cancelledOrders.toString(),
      icon: FiXCircle,
      color: 'bg-red-100 text-red-800',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md lg:max-w-[90%] xl:max-w-[100%]">
      <h2 className="text-2xl font-bold text-primary mb-6">Dashboard Overview</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className={`text-2xl ${stat.iconColor}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-xl font-bold text-primary">
              ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-xl font-bold text-primary">
              {stats.totalOrders > 0
                ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1)
                : '0.0'}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Orders</p>
            <p className="text-xl font-bold text-primary">
              {stats.pendingOrders + stats.processingOrders + stats.shippedOrders}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
